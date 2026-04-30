"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getTransaction } from "@/lib/api/transactions";
import { TransactionStatusBadge } from "@/components/status/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TransactionAuditPanel } from "@/components/transactions/TransactionAuditPanel";

interface TransactionDetailSheetProps {
  transactionId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TransactionDetailSheet({
  transactionId,
  open,
  onOpenChange,
}: TransactionDetailSheetProps) {
  const { data: tx, isLoading } = useQuery({
    queryKey: ["transactions", transactionId],
    queryFn: () => getTransaction(transactionId),
    enabled: open && !!transactionId,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Transaction details</SheetTitle>
        </SheetHeader>
        {isLoading || !tx ? (
          <Skeleton className="mt-6 h-48 w-full" />
        ) : (
          <div className="mt-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-caption text-muted-foreground">{tx.id}</p>
                <p className="mt-1 text-2xl font-semibold tabular-nums">
                  {formatCurrency(tx.amount, tx.currency)}
                </p>
              </div>
              <TransactionStatusBadge status={tx.status} />
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
                  <span className="text-muted-foreground">Vendor:</span>{" "}
                  {tx.vendor ?? tx.recipient ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Category:</span> {tx.category ?? "—"}
                </p>
                <p>
                  <span className="text-muted-foreground">Requested:</span>{" "}
                  {formatDateTime(tx.requestedAt)}
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
        )}
      </SheetContent>
    </Sheet>
  );
}
