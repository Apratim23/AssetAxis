"use client";

import { Toaster } from "@/components/ui/sonner"; // ✅ uses your custom wrapper

export function ToasterProvider() {
    console.log("✅ ToasterProvider mounted");
  return <Toaster position="top-right" richColors />;
}
