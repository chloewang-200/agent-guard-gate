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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createAgent, updateAgent } from "@/lib/api/agents";
import { agentFormSchema, type AgentFormValues } from "@/lib/validators/agent";
import {
  AGENT_TEMPLATE_TYPES,
  AGENT_ROLES,
  AGENT_STATUSES,
  AGENT_CAPABILITY_OPTIONS,
} from "@/lib/constants";
import type { AgentCapability } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api/wallets";

function capabilityIdsToObjects(ids: string[]): AgentCapability[] {
  const byId = new Map<string, { id: string; name: string }>(
    AGENT_CAPABILITY_OPTIONS.map((o) => [o.id, o]),
  );
  return ids.map((id) => {
    const opt = byId.get(id);
    return opt ? { id: opt.id, name: opt.name } : { id, name: id };
  });
}

interface AgentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<AgentFormValues>;
  agentId?: string;
}

export function AgentFormDialog({
  open,
  onOpenChange,
  defaultValues,
  agentId,
}: AgentFormDialogProps) {
  const queryClient = useQueryClient();
  const { data: walletsData } = useQuery({
    queryKey: ["wallets", { page: 1, pageSize: 100 }],
    queryFn: () => getWallets({ page: 1, pageSize: 100 }),
  });
  const wallets = walletsData?.data ?? [];

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: "",
      description: "",
      templateType: "custom",
      assignedWalletId: "",
      role: "requester",
      capabilities: defaultValues?.capabilities ?? [],
      status: "active",
      ...defaultValues,
    },
  });

  const createMutation = useMutation({
    mutationFn: (body: Parameters<typeof createAgent>[0]) =>
      agentId ? updateAgent(agentId, body) : createAgent(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
      if (agentId) queryClient.invalidateQueries({ queryKey: ["agents", agentId] });
      onOpenChange(false);
      form.reset();
    },
  });

  function onSubmit(values: AgentFormValues) {
    const body = {
      name: values.name,
      description: values.description,
      templateType: values.templateType,
      assignedWalletId: values.assignedWalletId,
      role: values.role,
      capabilities: capabilityIdsToObjects(values.capabilities),
      status: values.status,
    };
    createMutation.mutate(body);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{agentId ? "Edit agent" : "Add agent"}</DialogTitle>
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
                    <Input placeholder="e.g. Invoice Agent" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What this agent does" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="templateType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGENT_TEMPLATE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
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
              name="assignedWalletId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned wallet</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select wallet" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {wallets.map((w) => (
                        <SelectItem key={w.id} value={w.id}>
                          {w.name}
                        </SelectItem>
                      ))}
                      {wallets.length === 0 && (
                        <SelectItem value="_none" disabled>
                          No wallets — create one first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGENT_ROLES.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator />
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGENT_STATUSES.map((s) => (
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
            <FormField
              control={form.control}
              name="capabilities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capabilities</FormLabel>
                  <FormDescription>
                    What this agent is allowed to do under wallet policy.
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {AGENT_CAPABILITY_OPTIONS.map((opt) => {
                      const selected = field.value.includes(opt.id);
                      return (
                        <Button
                          key={opt.id}
                          type="button"
                          variant={selected ? "secondary" : "outline"}
                          size="sm"
                          className="h-auto min-h-9 whitespace-normal px-3 py-1.5 text-left font-normal"
                          onClick={() => {
                            field.onChange(
                              selected
                                ? field.value.filter((id: string) => id !== opt.id)
                                : [...field.value, opt.id],
                            );
                          }}
                        >
                          {opt.name}
                        </Button>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? agentId
                    ? "Saving…"
                    : "Creating…"
                  : agentId
                    ? "Save"
                    : "Create agent"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
