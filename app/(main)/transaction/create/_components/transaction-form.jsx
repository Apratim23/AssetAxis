"use client";

import { createTransaction } from '@/actions/transaction';
import { transactionSchema } from '@/app/lib/schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import CreateAccountDrawer from '@/components/ui/create-account-drawer';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import useFetch from '@/hooks/use-fetch';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import ReciptScanner from './recipt-scanner';

const AddTransactionForm = ({accounts, categories, editMode=false, initialData=null}) => {
    const Router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const {register,setValue,handleSubmit,formState:{errors},watch,getValues,reset,}=useForm({
        resolver:zodResolver(transactionSchema),
        defaultValues: 
        editMode && initialData ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description || "",
            accountId: initialData.accountId,
            category: initialData.category || "",
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring || false,
            ...(initialData.recurringInterval && {
                recurringInterval: initialData.recurringInterval
            }),
        }
        :
        {
            type: "EXPENSE",
            amount:"",
            description:"",
            accountId:accounts.find((ac)=>ac.isDefault)?.id || "",
            date:new Date(),
            isRecurring: false,
        },
    });

    const [loading, setLoading] = React.useState(false);

    // If in edit mode, define updateTransaction handler
    const updateTransaction = async (data) => {
        setLoading(true);

        const formData = {
            ...data,
            amount: parseFloat(data.amount),
            id: editId,
        };

        try {
            const result = await updateTransaction(formData); // Replace with your actual updateTransaction action if available

            if (result?.success) {
                toast.success("Transaction updated successfully");
                reset();

                setTimeout(() => {
                    Router.push(`/account/${result.data.accountId}`);
                }, 1500);
            } else {
                toast.error(result?.message || "Something went wrong");
            }
        } catch (err) {
            if (err.message.includes("Rate limit exceeded")) {
                toast.error("⏱️ Rate limit exceeded. Please try again later.");
            } else {
                toast.error("❌ Unexpected error occurred");
            }
            console.error("❌ updateTransaction failed:", err);
        } finally {
            setLoading(false);
        }
    };


    const type =watch("type");
    const isRecurring = watch("isRecurring");
    const date = watch("date");

    const onSubmit = async (data) => {
  setLoading(true);

  const formData = {
    ...data,
    amount: parseFloat(data.amount),
  };

  try {
    const result = await createTransaction(formData);

    if (result?.success) {
      toast.success("Transaction created successfully");
      reset();

      // Optional: delay redirect to allow toast visibility
      setTimeout(() => {
        Router.push(`/account/${result.data.accountId}`);
      }, 1500);
    } else {
      toast.error(result?.message || "Something went wrong");
    }
  } catch (err) {
  if (err.message.includes("Rate limit exceeded")) {
    toast.error("⏱️ Rate limit exceeded. Please try again later.");
  } else {
    toast.error("❌ Unexpected error occurred");
  }
  console.error("❌ createTransaction failed:", err);
} finally {
    setLoading(false);
  }
};


    const filteredCategories = categories.filter((category) => category.type === type);


const handleScanComplete = (scannedData) => {
    if(scannedData){
        setValue("amount", scannedData.amount.toString());
        setValue("date", new Date(scannedData.date));
        if (scannedData.description){
            setValue("description", scannedData.description);
        }
        if (scannedData.category){
            setValue("category", scannedData.category);
        }
    }
};

return (
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
         { /*AI Receipt Scanner */}
            <ReciptScanner onScanComplete={handleScanComplete}/>
    <div className="space-y-2">
            <label className='text-sm font-medium'>Type</label>
<Select 
            onValueChange={(value) => setValue("type", value)}
            defaultValue={type}
>
    <SelectTrigger>
            <SelectValue placeholder="Select Type" />
    </SelectTrigger>
<SelectContent>
    <SelectItem value="EXPENSE">Expense</SelectItem>
    <SelectItem value="INCOME">Income</SelectItem>
</SelectContent>
</Select> 

{errors.type && (
    <p className="text-red-500 text-sm">{errors.type.message}</p>
)}

    </div>
<div>
    <div className="space-y-2">
            <label className='text-sm font-medium'>Amount</label>
<Input
type="number"
step="0.01"
placeholder="0.00"
{...register("amount")}
/>
{errors.amount && (
    <p className="text-red-500 text-sm">{errors.amount.message}</p>
)}
    </div>
<div className="space-y-2">
            <label className='text-sm font-medium'>Account</label>
<Select 
            onValueChange={(value) => setValue("accountId", value)}
            defaultValue={getValues("accountId")}
>
    <SelectTrigger>
            <SelectValue placeholder="Select Account" />
    </SelectTrigger>
<SelectContent>
    {accounts.map((account) => (
            <SelectItem key={account.id} value={account.id}>
                    {account.name} (${parseFloat(account.balance).toFixed(2)})
            </SelectItem>
    ))}
    <CreateAccountDrawer>
    <Button variant="ghost" className="w-full select-none items-center cursor-pointer">Create Account</Button>

    </CreateAccountDrawer>
</SelectContent>
</Select> 

{errors.accountId && (
    <p className="text-red-500 text-sm">{errors.accountId.message}</p>
)}

    </div>

    </div>

    <div className="space-y-2">
            <label className='text-sm font-medium'>Category</label>
<Select 
            onValueChange={(value) => setValue("category", value)}
            defaultValue={getValues("category")}
>
    <SelectTrigger>
            <SelectValue placeholder="Select Category" />
    </SelectTrigger>
<SelectContent>
    {filteredCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
                    {category.name}
            </SelectItem>
    ))}
    
</SelectContent>
</Select> 

{errors.category && (
    <p className="text-red-500 text-sm">{errors.category.message}</p>
)}

    </div>


    <div className="space-y-2">
            <label className='text-sm font-medium'>Date</label>
            <Popover>
<PopoverTrigger asChild>
    <Button variant="outline" className="w-full pl-3 text-left font-normal cursor-pointer">
            {date ? format(date, "PPP") : <span>Select Date</span>}
            <CalendarIcon className="h-4 w-4 ml-auto opacity-50" />
    </Button>
</PopoverTrigger>
<PopoverContent className="w-auto p-0" align="start">
    <Calendar
        mode="single"
        selected={date}
        onSelect={(date) => setValue("date", date)}
        disabled={(date) =>
             date > new Date() || date < new Date("1900-01-01")
        }
        initialFocus
    />
</PopoverContent>
</Popover>
{errors.date && (
    <p className="text-red-500 text-sm">{errors.date.message}</p>
)}
    <div className='space-y-2'>
            <label className='text-sm font-medium'>Description</label>
            <Input
                type="text"
                placeholder="Enter a description"
                {...register("description")}
            />
            {errors.description && (
                <p className="text-red-500 text-sm">{errors.description.message}</p>
            )}
    </div>
    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-1">
                            <label htmlFor="isDefault" className="text-sm font-medium cursor-pointer">Recurring Transaction</label>
                            <p>This transaction will be automatically created on a recurring basis</p>
                        </div>
                        <Switch id="isDefault"
                            checked={isRecurring}
                            onCheckedChange={(checked) => setValue("isRecurring", checked)}
                        />
                    </div>
    </div>

    {isRecurring && (
            <div className="space-y-2">
            <label className='text-sm font-medium'>Recurring Interval</label>
<Select 
            onValueChange={(value) => setValue("recurringInterval", value)}
            defaultValue={getValues("recurringInterval")}
>
    <SelectTrigger>
            <SelectValue placeholder="Select Recurring Interval" />
    </SelectTrigger>
<SelectContent>
    <SelectItem value="DAILY">Daily</SelectItem>
    <SelectItem value="WEEKLY">Weekly</SelectItem>
    <SelectItem value="MONTHLY">Monthly</SelectItem>
    <SelectItem value="YEARLY">Yearly</SelectItem>
</SelectContent>
</Select> 

{errors.recurringInterval && (
    <p className="text-red-500 text-sm">{errors.recurringInterval.message}</p>
)}

    </div>
    )}

    <div className='flex gap-4'>
            <Button
            variant="outline"
            type="button"
            className="min-w-[100px] cursor-pointer"
            onClick={()=> Router.back()}
            >Cancel</Button>
            <Button type="submit" className="min-w-[100px]" disabled={loading}>
  {loading ? "Creating..." : "Create Transaction"}
</Button>

    </div>
    </form>
)
};
export default  AddTransactionForm;

