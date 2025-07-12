import { Card, CardContent } from '@/components/ui/card';
import CreateAccountDrawer from '@/components/ui/create-account-drawer';
import React from 'react'

function DashboardPage(){
  return (
    <div className="px-5">
       {/*Budget Progress*/}

       {/*Overview*/}

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
       </div>
       </div>
  )
};

export default DashboardPage;
