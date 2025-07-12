"use-client";

import React from 'react'
import { DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from './drawer';
import { useState } from 'react/cjs/react.production';
import { Select,SelectTrigger,SelectContent,SelectItem } from '.ui/select';

const CreateAccountDrawer = ({children}) => {
  const [open,setOpen]=useState(false);

  const {register,handleSubmit,formState:{errors},setValue,watch,reset,}=useForm({
    resolver:zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const onSubmit=async (data) => {
    console.log("Form Data:", data);}
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>

        {/* Form to create account goes here */}
        <div className="px-4 pb-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Account Name</label>
              <Input id="name" placeholder="e.g., Main Checking"
                {...register("name")} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="type" className="text-sm font-medium">Account Type</label>
              <Select
                value={watch("type")}
                onValueChange={val => setValue("type", val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="balance" className="text-sm font-medium">Initial Balance</label>
              <Input id="balance" placeholder="0.00" type="number" step="0.01"
                {...register("balance")} />
              {errors.balance && <p className="text-red-500 text-sm">{errors.balance.message}</p>}
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-1">
                <label htmlFor="balance" className="text-sm font-medium cursor-pointer">Set as Default</label>
              <p>This account is to be selected by default for transactions</p>
              
              </div>
              <Switch id="isDefault"
              onCheckedChange={(checked)=>setValue("isDefault", checked)}
              checked={watch("isDefault")}
              />
            </div>

            <div classname="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
            </div>
          </form>
        </div>
        
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;
