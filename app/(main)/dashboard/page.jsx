import { Card, CardContent } from '@/components/ui/card';
import CreateAccountDrawer from '@/components/ui/create-account-drawer';
import React, { Suspense } from 'react'
import { Plus } from 'lucide-react';
import { getDashboardData, getUserAccounts } from '@/actions/dashboard';
import AccountCard from './_components/account-card';
import { getCurrentBudget } from '@/actions/budget';
import BudgetProgress from './_components/budget-progress';
import DashboardOverview from './_components/transaction-overview';

async function DashboardPage(){
  const accounts = await getUserAccounts();
  const defaultAccount = accounts?.find((account) => account.isDefault);

  const transactions = await getDashboardData();

  let budgetData=null;
  if (defaultAccount){
    budgetData = await getCurrentBudget(defaultAccount.id);
  }
  return (
    <div className="space-y-8">
       {/*Budget Progress*/}
      {defaultAccount && <BudgetProgress
      initialBudget={budgetData?.budget}
      currentExpenses={budgetData?.currentExpenses || 0}
      />}

       {/*Overview*/}
       <Suspense fallback={"Loading Overview..."}>
        <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
        />
       </Suspense>

       {/*Accounts Grid*/}
       <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-full text-muted-foreground pt-5">
              <Plus className="h-10 w-10 mb-2"/>
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        {accounts.length>0 && accounts?.map((account)=>{
          return <AccountCard key={account.id} account={account}/>;
        })}
       </div>
       </div>
  );
}

export default DashboardPage;
