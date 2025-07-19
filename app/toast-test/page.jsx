"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ToastTestPage() {
  return (
    <div className="p-10">
      <h1 className="text-2xl mb-4">Test Toast Page</h1>
      <Button onClick={() => toast.success("🎉 Toast is working!")}>
        Trigger Toast
      </Button>
    </div>
  );
}
