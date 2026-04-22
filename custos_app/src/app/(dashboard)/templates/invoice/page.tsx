import { redirect } from "next/navigation";
import { isInvoiceFeatureEnabled } from "@/lib/features";
import { InvoiceAgentClient } from "./invoice-agent-client";

export default function InvoiceAgentPage() {
  if (!isInvoiceFeatureEnabled()) {
    redirect("/templates");
  }
  return <InvoiceAgentClient />;
}
