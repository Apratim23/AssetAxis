import { sendEmail } from "@/actions/send-email";
import { db } from "../prisma";
import { inngest } from "./client";
import EmailTemplate from "@/emails/template";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const checkBudgetAlert = inngest.createFunction(
  { name: "Check Budget Alerts" },
  { cron: "0 */6 * * *" },
  async ({ step }) => {
    const budgets = await step.run("fetch-budget", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: {
                where: {
                                isDefault: true,
                            },
                        },
                    },
                },
            },
    });
  });

  for (const budget of budgets){
    const defaultAccount = budget.user.accounts[0];
    if (!defaultAccount) continue;

    await step.run(`check-budget-${budget.id}`, async () => {
        const startDate = new Date();
        startDate.setDate(1);

        const currentDate=new Date();
            const startOfMonth=new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                1
            );
            const endOfMonth=new Date(
                currentDate.getFullYear(),
                currentDate.getMonth() + 1,
                0
            );

        const expenses= await db.transaction.aggregate({
            where:{
                userId: budget.userId,
                accountId: defaultAccount.id,
                type: "EXPENSE",
                date: {
                    gte: startOfMonth,
                    lte: endOfMonth,
                },
            },
            _sum: {
                amount: true,
            },
        });
        const totalExpenses = expenses._sum.amount?.toNumber() || 0;
        const budgetAmount= budget.amount;
        const percentageUsed = (totalExpenses / budgetAmount) * 100;
        
        if (percentageUsed>=80 && 
            (!budget.lastAlertSent || isNewMonth(new Date(budget.lastAlertSent), new Date()))) 
            {
                //send email alert
                await sendEmail({
                    to:budget.user.email,
                    subject: `Budget Alert for ${defaultAccount.name}`,
                    react: EmailTemplate({
                        userName: budget.user.name,
                        type: "budget-alert",
                        data: {
                            percentageUsed,
                            budgetAmount:parseInt(budgetAmount).toFixed(1),
                            totalExpenses: parseInt(totalExpenses).toFixed(1),
                            accountName: defaultAccount.name,
                        },
                    }),
                });
                //update lastAlertSent
                await db.budget.update({
                    where: { id: budget.id },
                    data: { lastAlertSent: new Date() },
                });
            }
            });


  }
}
);

function isNewMonth(lastAlertDate, currentDate) {
    return( lastAlertDate.getMonth() !== currentDate.getMonth() ||
           lastAlertDate.getFullYear() !== currentDate.getFullYear());
}

export const triggerRecurringTransactions = inngest.createFunction({
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
},{cron:"0 0 * * *"},
async ({step})=>{
const recurringTransactions = await step.run("fetch-recurring-transactions", async () => {
    return await db.transaction.findMany({
        where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
                {lastProcessed: null},
                {nextRecurringDate: {lte: new Date()}},
            ],
        },
    });
}
);


if(recurringTransactions.length>0){
    const events = recurringTransactions.map((transaction) => ({
    name: "transaction.recurring.process",
    data: {
        transactionId: transaction.id,
        userId: transaction.userId
    },
}));

await inngest.send(events);
}

return {triggered: recurringTransactions.length};
}
);

export const processRecurringTransactions = inngest.createFunction(
    {
        id: "process-recurring-transactions",
        throttle: {
            limit: 10,
            period: "1m",
            key: "event.data.userId",
        },
    },
    {event: "transaction.recurring.process"},
    async ({event, step}) => {
    if (!event?.data?.transactionId || !event?.data?.userId) {
        console.error("Invalid event data:", event);
        return {error: "Missing required event data"};
    }

    await step.run("process-transaction", async () => {
        const transaction = await db.transaction.findUnique({
            where: { 
                id: event.data.transactionId,
                userId: event.data.userId,
            },
            include: { account: true },
        });
        // You may want to add logic here to process the transaction
        if(!transaction || !isTransactionDue(transaction)) return;

        await db.$transaction(async (tx) => {
            await tx.transaction.create({
                data: {
                    type: transaction.type,
                    amount: transaction.amount,
                    description: `${transaction.description}  (Recurring)`,
                    date: new Date(),
                    category: transaction.category,
                    userId: transaction.userId,
                    accountId: transaction.accountId,
                    isRecurring: false,
            },
        });

        const balanceChange=
        transaction.type === "EXPENSE" ? -transaction.amount.toNumber() : transaction.amount.toNumber();

        await tx.account.update({
            where: { id: transaction.accountId },
            data: {
                balance: {
                    increment: balanceChange,
                },
            },
        });

        await tx.transaction.update({
            where: { id: transaction.id },
            data:{
                lastProcessed: new Date(),
                nextRecurringDate: calculateNextRecurringDate(new Date(), transaction.recurringInterval),
            }
    });
}
);

function isTransactionDue(transaction) {
    if (!transaction.lastProcessed) return true;

    const today= new Date();
    const nextDue=new Date(transaction.nextRecurringDate);

    return nextDue<=today;
}

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


);

}
);

export const generateMonthlyReports = inngest.createFunction({
    id: "generate-monthly-reports",
    name: "Generate Monthly Reports",
},
{cron:"0 0 1 * *"},
    async ({step})=>{
        const users=await step.run("fetch-users", async () => {
            return await db.user.findMany({
                include: {
                    accounts: true,
                },
            });
    });

    for(const user of users){
        await step.run(`generate-report-${user.id}`, async () => {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);

            const stats = await getMonthlyStats(user.id, lastMonth);
            const monthName = lastMonth.toLocaleString("default", {
                month: "long",
            });

            const insights = await generateFinancialInsights(stats, monthName);

            await sendEmail({
                    to: user.email,
                    subject: `Your Monthly Financial Report - ${monthName}`,
                    react: EmailTemplate({
                        userName: user.name,
                        type: "monthly-report",
                        data: {
                            stats,
                            month: monthName,
                            insights,
                        },
                    }),
                });
        });
    }
    return {processed: users.length};   
}
);

async function generateFinancialInsights(stats, monthName) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this financial data and provide 3 concise, actionable insights.
    Focus on spending patterns and practical advice.
    Keep it friendly and conversational.

    Financial Data for ${monthName}:
    - Total Income: $${stats.totalIncome}
    - Total Expenses: $${stats.totalExpenses}
    - Net Income: $${stats.totalIncome - stats.totalExpenses}
    - Expense Categories: ${stats.byCategory ? Object.entries(stats.byCategory)
      .map(([category, amount]) => `${category}: $${amount}`)
      .join(", ") : "None"}

    Format the response as a JSON array of strings, like this:
    ["insight 1", "insight 2", "insight 3"]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

        return JSON.parse(cleanedText);
    } catch (error) {
        console.error("Error generating insights:", error);

        // Fallback default insights
        return [
            "Your highest expense category this month might need attention.",
            "Consider setting up a budget for better financial control.",
            "Review subscriptions or recurring payments for potential savings.",
        ];
    }
}


const getMonthlyStats = async (userId, month) => {
    const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
    const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    const transactions = await db.transaction.findMany({
        where: {
            userId,
            date: {
                gte: startDate,
                lte: endDate,
            },
        },
    });

    const totalIncome = transactions
        .filter(tx => tx.type === "INCOME")
        .reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

    const totalExpenses = transactions
        .filter(tx => tx.type === "EXPENSE")
        .reduce((sum, tx) => sum + tx.amount.toNumber(), 0);

    // ✅ Group expenses by category
    const byCategory = {};
    for (const tx of transactions) {
        if (tx.type === "EXPENSE") {
            const category = tx.category || "Uncategorized";
            byCategory[category] = (byCategory[category] || 0) + tx.amount.toNumber();
        }
    }

    return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        byCategory, // ✅ add this
    };
};
