"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@/lib/zodResolver";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { createWallet, updateWallet } from "@/lib/api/wallets";
import { walletFormSchema, type WalletFormValues } from "@/lib/validators/wallet";
import { APPROVAL_MODES, CATEGORIES, WALLET_STATUSES } from "@/lib/constants";

interface WalletFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  walletId?: string;
  defaultValues?: Partial<WalletFormValues>;
}

export function WalletFormDialog({
  open,
  onOpenChange,
  walletId,
  defaultValues,
}: WalletFormDialogProps) {
  const queryClient = useQueryClient();
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletFormSchema),
    defaultValues: {
      name: "",
      currency: "USD",
      balance: defaultValues?.balance ?? 0,
      dailyLimit: defaultValues?.dailyLimit,
      perTransactionLimit: defaultValues?.perTransactionLimit,
      allowedCategories: defaultValues?.allowedCategories ?? [],
      allowedVendors: defaultValues?.allowedVendors ?? "",
      approvalMode: "review",
      status: "active",
      notes: defaultValues?.notes ?? "",
      ...defaultValues,
    },
  });

  const saveMutation = useMutation({
    mutationFn: (body: Parameters<typeof createWallet>[0]) =>
      walletId ? updateWallet(walletId, body) : createWallet(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
      if (walletId) queryClient.invalidateQueries({ queryKey: ["wallets", walletId] });
      onOpenChange(false);
      form.reset();
    },
  });

  function onSubmit(values: WalletFormValues) {
    const allowedVendorsList = values.allowedVendors
      ? values.allowedVendors.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    // @TODO Persist notes on Wallet model / Dynamo (`WalletItem`) and return from GET /api/wallets*
    const body = {
      name: values.name,
      currency: values.currency,
      balance: values.balance,
      policy: {
        approvalMode: values.approvalMode,
        limits: {
          daily: values.dailyLimit,
          perTransaction: values.perTransactionLimit,
        },
        ...(values.allowedCategories.length > 0
          ? { allowedCategories: values.allowedCategories }
          : {}),
        ...(allowedVendorsList.length > 0 ? { allowedVendors: allowedVendorsList } : {}),
      },
      status: values.status,
      ...(values.notes?.trim() ? { notes: values.notes.trim() } : {}),
    };
    saveMutation.mutate(body);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{walletId ? "Edit wallet" : "Add wallet"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Operations Wallet" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial balance</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Wallet status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WALLET_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dailyLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily limit (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="perTransactionLimit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Per-transaction limit (optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(e.target.value ? Number(e.target.value) : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="approvalMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Approval mode</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {APPROVAL_MODES.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowedCategories"
              render={({ field }) => (
                <FormItem>
                  <div className="mb-1">
                    <FormLabel>Allowed spend categories</FormLabel>
                    <FormDescription>
                      Leave none checked to allow all categories (policy interpretation may vary).
                    </FormDescription>
                  </div>
                  <div className="grid gap-2 rounded-md border border-border bg-muted/20 p-3 sm:grid-cols-2">
                    {CATEGORIES.map((cat) => (
                      <label
                        key={cat}
                        className="flex cursor-pointer items-center gap-2 text-sm leading-snug"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 shrink-0 rounded border border-input accent-primary"
                          checked={field.value.includes(cat)}
                          onChange={() => {
                            const set = new Set(field.value);
                            if (set.has(cat)) set.delete(cat);
                            else set.add(cat);
                            field.onChange([...set]);
                          }}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allowedVendors"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred vendors (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Acme Corp, Contoso Ltd (comma-separated)"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Sent as structured vendor allow-list when APIs support it.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Team notes — not shown to agents"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Display-only for now; persistence requires wallet API updates.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending
                  ? walletId
                    ? "Saving…"
                    : "Creating…"
                  : walletId
                    ? "Save"
                    : "Create wallet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
