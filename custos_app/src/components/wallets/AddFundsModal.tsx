"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zodResolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fundWallet } from "@/lib/api/wallets";
import { addFundsSchema, type AddFundsValues } from "@/lib/validators/fund";
import { Badge } from "@/components/ui/badge";
import { StripeWalletFundSection } from "@/components/wallets/StripeWalletFundSection";
import { CreditCard } from "lucide-react";

interface AddFundsModalProps {
  walletId: string;
  walletName?: string;
  currency: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const VENMO_USERNAME = "carlos-custos";
const PAYMENT_REFERENCE = "Custos wallet funding - include wallet ID in note";

export function AddFundsModal({
  walletId,
  currency,
  open,
  onOpenChange,
}: AddFundsModalProps) {
  const queryClient = useQueryClient();
  const form = useForm<AddFundsValues>({
    resolver: zodResolver(addFundsSchema),
    defaultValues: { amount: 0, reference: "" },
  });

  const fundMutation = useMutation({
    mutationFn: (body: { amount: number; reference?: string }) =>
      fundWallet(walletId, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["wallets", walletId] });
      void queryClient.invalidateQueries({ queryKey: ["wallets"] });
      onOpenChange(false);
      form.reset();
    },
  });

  function onSubmit(values: AddFundsValues) {
    fundMutation.mutate({
      amount: values.amount,
      reference: values.reference,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,820px)] flex-col gap-0 overflow-hidden sm:max-w-xl">
        <DialogHeader className="shrink-0 space-y-1 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle>Add funds</DialogTitle>
            <Badge variant="secondary">Test mode</Badge>
          </div>
          <p className="text-caption text-muted-foreground">
            Pay with Stripe test cards, or record a manual top-up for the prototype.
          </p>
        </DialogHeader>

        <Tabs defaultValue="card" className="flex min-h-0 flex-1 flex-col gap-3 px-0.5 pt-1">
          <TabsList className="grid w-full shrink-0 grid-cols-2">
            <TabsTrigger value="card" className="gap-2">
              <CreditCard className="h-4 w-4" aria-hidden />
              Card (Stripe)
            </TabsTrigger>
            <TabsTrigger value="manual">Manual</TabsTrigger>
          </TabsList>

          <TabsContent
            value="card"
            className="mt-0 max-h-[min(58vh,520px)] space-y-4 overflow-y-auto overscroll-contain pb-2 data-[state=inactive]:hidden"
          >
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Stripe test card</p>
              <p className="mt-1 font-mono text-xs tabular-nums">4242 4242 4242 4242</p>
              <p className="mt-1 text-xs">
                Any future expiry, any CVC, any postal code. Use{" "}
                <a
                  className="underline underline-offset-4 hover:text-foreground"
                  href="https://docs.stripe.com/testing"
                  target="_blank"
                  rel="noreferrer"
                >
                  Stripe testing docs
                </a>{" "}
                for more scenarios.
              </p>
            </div>
            <StripeWalletFundSection
              embedded
              walletId={walletId}
              currency={currency}
              onComplete={() => onOpenChange(false)}
            />
          </TabsContent>

          <TabsContent
            value="manual"
            className="mt-0 max-h-[min(58vh,520px)] space-y-4 overflow-y-auto overscroll-contain pb-2 data-[state=inactive]:hidden"
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ({currency})</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Memo for records" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
                  <p className="text-caption font-medium text-amber-800 dark:text-amber-200">
                    Prototype only
                  </p>
                  <p className="mt-1 text-body-sm text-amber-700 dark:text-amber-300">
                    This path does not charge a card — it only adjusts the demo ledger after you confirm.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-body-sm text-muted-foreground">Venmo:</span>
                    <code className="rounded bg-muted px-2 py-0.5 text-sm">{VENMO_USERNAME}</code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void navigator.clipboard.writeText(VENMO_USERNAME)}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="mt-2">
                    <p className="text-caption text-muted-foreground">Payment reference:</p>
                    <code className="mt-1 block break-all rounded bg-muted px-2 py-1 text-caption">
                      {PAYMENT_REFERENCE} — {walletId}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="mt-1"
                      onClick={() =>
                        void navigator.clipboard.writeText(`${PAYMENT_REFERENCE} — ${walletId}`)
                      }
                    >
                      Copy reference
                    </Button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={fundMutation.isPending}>
                  {fundMutation.isPending ? "Recording…" : "Record funding"}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>

        <DialogFooter className="shrink-0 border-t border-border pt-3">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
