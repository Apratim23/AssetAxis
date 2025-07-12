"use server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const serializeTransaction = (obj) => {
    const serialized= {...obj};

    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
};

export async function createAccount(data) {
    try {
        const {userId} = await auth();
        if(!userId) throw new Error("Unauthorized");
        const user= await db.user.findUnique({
            where: {clerkUserId: userId},   
        });
        if(!user) throw new Error("User not found");

        const balanceFloat = parseFloat(data.balance);
        if(isNaN(balanceFloat)) throw new Error("Invalid balance");

        const existingAccounts = await db.account.findFirst({
            where: { userId: user.id},
        });

        const shouldBeDefault = existingAccounts.length===0?true:data.isDefault;

        const account = await db.account.create({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });
        const serializedAccount = serializeTransaction(account);
        revalidatePath("/dashboard");
        return {success:true,data:serializedAccount};
    } catch (error) {
          throw new Error(error.message);
    }
}