"use client";

import { ToasterProvider } from "./toaster-provider";

export function ClientProviders() {
  return (
    <>
      <ToasterProvider />
      {/* Add any other future client-only providers here */}
    </>
  );
}
