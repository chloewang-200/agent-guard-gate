"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTransaction } from "@/lib/api/transactions";
import { TransactionStatusBadge } from "@/components/status/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionAuditPanel } from "@/components/transactions/TransactionAuditPanel";

export default function TransactionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: tx, isLoading } = useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getTransaction(id),
  });

  if (isLoading || !tx) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/transactions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <p className="font-mono text-caption text-muted-foreground">{tx.id}</p>
          <div className="mt-1 flex items-center gap-2">
            <h1 className="text-heading-1 text-foreground">
              {formatCurrency(tx.amount, tx.currency)}
            </h1>
            <TransactionStatusBadge status={tx.status} />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-body-sm">
          <p>
            <span className="text-muted-foreground">Agent:</span> {tx.agentName}
          </p>
          <p>
            <span className="text-muted-foreground">Wallet:</span> {tx.walletName}
          </p>
          <p>
            <span className="text-muted-foreground">Vendor:</span> {tx.vendor ?? tx.recipient ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Category:</span> {tx.category ?? "—"}
          </p>
          <p>
            <span className="text-muted-foreground">Requested:</span> {formatDateTime(tx.requestedAt)}
          </p>
          {tx.memo && (
            <p>
              <span className="text-muted-foreground">Memo:</span> {tx.memo}
            </p>
          )}
        </CardContent>
      </Card>

      <TransactionAuditPanel tx={tx} />
    </div>
  );
}
