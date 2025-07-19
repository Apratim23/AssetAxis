// actions/transaction.js
"use server";

import aj  from "@/lib/arcjet";
import { db } from "@/lib/prisma";
import { request } from "@arcjet/next";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
// import { success } from "zod"; // This import is still incorrect/unused. Remove it.

export async function createTransaction(data) {
    // FIX: Corrected serializeAmount function to take 'obj' as parameter
    const serializeAmount = (obj) => ({
        ...obj,
        amount: obj.amount.toNumber(),
    });

    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");

        //Arcjet to add rate limiting
        const req=await request();
        //Check rate limit
        const decision = await aj.protect(req, {
            userId,
            requested: 1,
        });

        if(decision.isDenied()){
            if(decision.reason.isRateLimit()){
                const {remaining, reset} = decision.reason;
                console.error({
                    code: "RATE_LIMIT_EXCEEDED",
                    details: {
                        remaining,
                        resetInSeconds: reset,
                    },
                });

                throw new Error(`Rate limit exceeded. Try again in ${reset} seconds. You have ${remaining} requests left.`);
            }
            throw new Error("Request Blocked");
        }

        const user = await db.user.findUnique({
            where: { clerkUserId: userId },
        });

        if (!user) {
            throw new Error("User not found");
        }

        const account = await db.account.findUnique({
            where: { id: data.accountId, userId: user.id },
        });
        if (!account) {
            throw new Error("Account not found");
        }

        const balanceChange = data.type === "EXPENSE" ? -data.amount : data.amount;
        const newBalance = account.balance.toNumber() + balanceChange;

        // FIX: Capture the result of the transaction into the 'transaction' variable
        const transaction = await db.$transaction(async (tx) => {
            const newTransaction = await tx.transaction.create({
                data: {
                    ...data,
                    userId: user.id,
                    nextRecurringDate: data.isRecurring && data.recurringInterval ? calculateNextRecurringDate(data.date, data.recurringInterval) : null,
                }
            });

            await tx.account.update({
                where: { id: account.id },
                data: { balance: newBalance },
            });

            // Return the newTransaction from the transaction block
            return newTransaction;
        });

        // After the transaction is complete and 'transaction' is assigned:
        revalidatePath("/dashboard");
        revalidatePath(`/account/${transaction.accountId}`); // Now 'transaction' is defined

        return { success: true, data: serializeAmount(transaction) }; // Now 'transaction' is defined

    } catch (error) {
        throw new Error(`Failed to create transaction: ${error.message}`);
    }

    // This function should be defined outside or above its usage if it's not a nested helper
    // For a Server Action, it's fine to be defined within the file scope.
    function calculateNextRecurringDate(startDate, interval) {
        const date = new Date(startDate);
        switch (interval) {
            case "DAILY":
                date.setDate(date.getDate() + 1);
                break;
            case "WEEKLY":
                date.setDate(date.getDate() + 7);
                break;
            case "MONTHLY":
                date.setMonth(date.getMonth() + 1);
                break;
            case "YEARLY":
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                throw new Error("Invalid interval");
        }
        return date;
    }
}