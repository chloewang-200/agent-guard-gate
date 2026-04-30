import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import { InvoiceAgentClient } from "./invoice-agent-client";

export default function InvoiceAgentPage() {
  if (!isInvoiceFeatureEnabled()) {
    redirect("/templates");
  }
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading Invoice Agent…</div>}>
      <InvoiceAgentClient />
    </Suspense>
  );
}
