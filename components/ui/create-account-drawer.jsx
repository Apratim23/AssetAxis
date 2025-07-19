'use client';

import React from 'react'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from './drawer';
import { use, useEffect, useState } from 'react';
import { Select,SelectTrigger,SelectContent,SelectItem,SelectValue } from './select';
import useFetch from '@/hooks/use-fetch';
import { createAccount } from '@/actions/dashboard';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { accountSchema } from '@/app/lib/schema';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation";

import { zodResolver } from '@hookform/resolvers/zod';

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

  // Assuming useFetch is correctly implemented to take a Server Action and return a function to call it
  const {data:newAccount, error,fn:createAccountFn,loading:createAccountLoading}=useFetch(createAccount);

  useEffect(() => {
    if (newAccount && !createAccountLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
      router.refresh();
    }
  }, [newAccount, createAccountLoading]);

  useEffect(() => {
    if (error){
      // Ensure error.message is a string, especially if Zod errors are JSON.stringified
      try {
        const parsedError = JSON.parse(error.message);
        if (parsedError.type === "validation" && parsedError.errors) {
          // Display specific Zod validation errors
          Object.keys(parsedError.errors).forEach(field => {
            toast.error(`${field}: ${parsedError.errors[field].join(', ')}`);
          });
        } else {
          toast.error(error.message || "An error occurred while creating the account");
        }
      } catch (e) {
        toast.error(error.message || "An error occurred while creating the account");
      }
    }
  }, [error]);

  const router = useRouter();

const onSubmit = async (data) => {
  const result = await createAccountFn(data); // triggers your server action

  if (result?.success) {
    toast.success("Account created successfully");
    reset();
    setOpen(false);

    // ✅ Force client to refresh the updated /dashboard data
    window.location.reload();
  }
};


  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            {/* ... (your form fields) ... */}

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
                <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">Set as Default</label>
                <p>This account is to be selected by default for transactions</p>
              </div>
              <Switch id="isDefault"
                onCheckedChange={(checked)=>setValue("isDefault", checked)}
                checked={watch("isDefault")}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>

              <Button type="submit" className="flex-1 cursor-pointer" disabled={createAccountLoading}>
                {createAccountLoading?(<><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Creating...</>):( "Create Account")}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateAccountDrawer;