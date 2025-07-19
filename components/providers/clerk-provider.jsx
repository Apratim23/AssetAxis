"use client";

import { ClerkProvider } from "@clerk/nextjs";

export function ClerkClientProvider({ children }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}
