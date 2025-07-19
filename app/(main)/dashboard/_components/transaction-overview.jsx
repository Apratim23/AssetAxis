"use client";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import React, { useState } from 'react'
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

const COLORS =[
    '#0088FE',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#FF6384',  
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#9400D3', // Violet
    '#4B0082', // Indigo
    '#0000FF', // Blue
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#FF7F00', // Orange
    '#FF0000', // Red
]

const DashboardOverview = ({accounts, transactions}) => {
const [selectAccountId, setSelectAccountId] = useState(
    accounts.find((a)=>a.isDefault)?.id || accounts[0]?.id || ""
  );

  const accountTransactions=transactions.filter(
    (t)=>t.accountId === selectAccountId
  );

  const recentTransactions =accountTransactions
    .sort((a,b)=>new Date(b.date) - new Date(a.date))
    .slice(0, 5);

    const currentDate=new Date();
    const currentMonthExpenses = accountTransactions.filter((t)=>{
        const transactionDate = new Date(t.date);
        return (
            t.type === "EXPENSE" && 
            transactionDate.getMonth()===currentDate.getMonth()&&
            transactionDate.getFullYear()===currentDate.getFullYear()
        );
    });

    const expensesByCategory = currentMonthExpenses.reduce((acc, transaction)=>{
        const category = transaction.category || "Uncategorized";
        if (!acc[category]) {
            acc[category] = 0;
        }
        acc[category] += transaction.amount;
        return acc;
    }, {});

    const pieChartData = Object.entries(expensesByCategory).map(([category, amount]) => ({
        name: category,
        value: amount,
    }));

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
  <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
    <CardTitle className='text-base font-normal'>Recent Transactions</CardTitle>
    <Select value={selectAccountId} onValueChange={setSelectAccountId}>
  <SelectTrigger className="w-[140px]">
    <SelectValue placeholder="Select Account" />
  </SelectTrigger>
  <SelectContent>
    {accounts.map((account) => (
      <SelectItem key={account.id} value={account.id}>{account.name}</SelectItem>
    ))}
  </SelectContent>
</Select>
  </CardHeader> 
  <CardContent>
    <div className='space-y-4'>
        {recentTransactions.length === 0 ? (
            <p className='text-center text-muted-foreground py-4'>
                No recent transactions found for this account.
            </p>
        ) : (
            recentTransactions.map((transaction) => (
                <div key={transaction.id} className='flex items-center justify-between'>
                    <div className='space-y-1'>
                        <p className='text-sm font-medium leading-none'>{transaction.description || "Untitled Transaction"}</p>
                        <p className='text-sm text-muted-foreground'>{format(new Date(transaction.date), "PP")}</p>
                    </div>
                    <div className='flex-items-center gap-2'>
                        <div
                            className={cn(
                                "flex items-center",
                                transaction.type === "INCOME" ? "text-green-500" : "text-red-500"
                            )}
                        >
                            {transaction.type === "INCOME" ? (
                                <ArrowDownRight className="mr-1 h-4 w-4" />
                            ) : (
                                <ArrowUpRight className="mr-1 h-4 w-4" />
                            )}
                            ${transaction.amount.toFixed(2)}
                        </div>
                    </div>
                </div>
            ))
        )}
    </div>
  </CardContent>
</Card>

<Card>
  <CardHeader>
    <CardTitle className='text-base font-normal'>Monthly Expense Breakdown</CardTitle>
  </CardHeader>
  <CardContent className='p-0 pb-5'>
    {pieChartData.length === 0 ? (
      <p className='text-center text-muted-foreground py-4'>
        No expenses recorded for this month.
      </p>
    ):(
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={pieChartData} cx="50%" cy="50%" fill="#8884d8" dataKey="value" outerRadius={80} label={({name,value}) => `${name}: $${value.toFixed(2)}`}>
                        {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index%COLORS.length]} />
                        ))}
                    </Pie>
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )}
  </CardContent>
</Card>
    </div>
  )
}

export default DashboardOverview
