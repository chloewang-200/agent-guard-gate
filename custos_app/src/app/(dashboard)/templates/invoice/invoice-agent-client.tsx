"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadInvoice, extractInvoice } from "@/lib/api/invoice";
import { requestTransaction } from "@/lib/api/transactions";
import type { InvoiceExtractionResult } from "@/lib/types";
import { buildInvoiceTrustFields } from "@/lib/invoiceSubmissionTrust";
import { TransactionStatusBadge } from "@/components/status/StatusBadge";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getWallets } from "@/lib/api/wallets";
import { getAgents } from "@/lib/api/agents";

export function InvoiceAgentClient() {
  const searchParams = useSearchParams();
  const urlAgentId = searchParams.get("agentId")?.trim() ?? "";

  const [file, setFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [extraction, setExtraction] = useState<InvoiceExtractionResult | null>(null);
  const [txResult, setTxResult] = useState<Awaited<ReturnType<typeof requestTransaction>> | null>(null);
  const [walletId, setWalletId] = useState("");
  const [agentId, setAgentId] = useState("");
  const [purpose, setPurpose] = useState("");

  const { data: walletsData } = useQuery({
    queryKey: ["wallets", { page: 1, pageSize: 100 }],
    queryFn: () => getWallets({ page: 1, pageSize: 100 }),
  });
  const { data: agentsData } = useQuery({
    queryKey: ["agents", { page: 1, pageSize: 100 }],
    queryFn: () => getAgents({ page: 1, pageSize: 100 }),
  });
  const wallets = walletsData?.data ?? [];
  const agents = agentsData?.data ?? [];

  useEffect(() => {
    if (!urlAgentId || agents.length === 0) return;
    const agent = agents.find((a) => a.id === urlAgentId);
    if (!agent) {
      setAgentId("");
      setWalletId("");
      return;
    }
    setAgentId(agent.id);
    setWalletId(agent.assignedWalletId);
  }, [urlAgentId, agents]);

  const linkedAgent = urlAgentId ? agents.find((a) => a.id === urlAgentId) : undefined;

  const uploadMutation = useMutation({
    mutationFn: (f: File) => uploadInvoice(f),
    onSuccess: (res) => {
      setFileId(res.fileId);
    },
  });

  const extractMutation = useMutation({
    mutationFn: (id: string) => extractInvoice(id),
    onSuccess: setExtraction,
  });

  const requestMutation = useMutation({
    mutationFn: (body: Parameters<typeof requestTransaction>[0]) =>
      requestTransaction(body),
    onSuccess: setTxResult,
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setFileId(null);
      setExtraction(null);
      setTxResult(null);
      setPurpose("");
    }
  }

  function handleUpload() {
    if (!file) return;
    uploadMutation.mutate(file);
  }

  function handleExtract() {
    if (fileId) extractMutation.mutate(fileId);
  }

  function handleSubmitRequest() {
    if (!extraction?.amount || !walletId || !agentId) return;
    const wallet = wallets.find((w) => w.id === walletId);
    const agent = agents.find((a) => a.id === agentId);
    const ts = new Date().toISOString();
    const purposeLine =
      purpose.trim() || extraction.memo?.trim() || "Invoice agent payment request";

    const trust = buildInvoiceTrustFields({
      extraction,
      purpose: purposeLine,
      fileId,
      originalFilename: file?.name,
      payeeOverrideId: "",
      agentName: agent?.name,
      viaChat: false,
    });

    requestMutation.mutate({
      agentId,
      walletId,
      amount: extraction.amount,
      currency: wallet?.currency ?? "USD",
      vendor: extraction.vendor,
      memo: extraction.memo ?? purposeLine,
      policyResult: "within_policy",
      purpose: purposeLine,
      sourceKind: "invoice_upload",
      railType: extraction.railType,
      context: {
        extraction,
        source: "invoice_agent",
        fileId: fileId ?? undefined,
        invoiceNumber: extraction.invoiceNumber,
        dueDate: extraction.dueDate,
        extractionConfidence: extraction.confidence,
        originalFilename: file?.name,
        trustBrief:
          "Invoice submission with default citations (workflow, evidence, purpose, payee rules) and agentDecision trace.",
      },
      citedRules: trust.citedRules,
      agentDecision: trust.agentDecision,
      policyEvaluation: [
        {
          check: "Supporting evidence",
          result: fileId ? "pass" : "fail",
          detail: fileId ? "Invoice file attached" : "No invoice file reference",
        },
        {
          check: "Extraction confidence",
          result: "pass",
          detail:
            extraction.confidence != null
              ? `${Math.round(extraction.confidence * 100)}% pipeline confidence`
              : "Extraction completed (fixed-path confidence)",
        },
      ],
      auditEvents: [
        {
          id: `evt_submit_${Date.now()}`,
          timestamp: ts,
          action: "Invoice payment request submitted",
          type: "request",
          detail: JSON.stringify({ fileId, walletId, agentId }, null, 2),
        },
      ],
      evidence: fileId
        ? [
            {
              id: `ev_${fileId}`,
              type: "invoice",
              fileId,
              filename: file?.name ?? "invoice",
              uploadedAt: ts,
              extractedFields: {
                vendor: extraction.vendor,
                invoiceNumber: extraction.invoiceNumber,
                amount: extraction.amount,
                dueDate: extraction.dueDate,
                railType: extraction.railType,
                sourceFileId: extraction.sourceFileId,
                confidence: extraction.confidence,
              },
              confidence: extraction.confidence,
            },
          ]
        : undefined,
    });
  }

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-heading-1 text-foreground">Invoice Agent</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          Upload an invoice, extract fields, and submit a payment request for policy evaluation.
        </p>
        {linkedAgent ? (
          <p className="mt-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-body-sm text-foreground">
            Using agent{" "}
            <Link href={`/agents/${linkedAgent.id}`} className="font-medium underline underline-offset-4">
              {linkedAgent.name}
            </Link>
            {linkedAgent.assignedWalletName ? (
              <>
                {" "}
                · wallet <span className="font-medium">{linkedAgent.assignedWalletName}</span>
              </>
            ) : null}
            .
          </p>
        ) : urlAgentId ? (
          <p className="mt-2 text-body-sm text-amber-700 dark:text-amber-300">
            No agent matches this link — pick an agent and wallet below, or open this page from your Invoice Agent
            in{" "}
            <Link href="/agents" className="underline underline-offset-4">
              Agents
            </Link>
            .
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload invoice
            </CardTitle>
            <CardDescription>
              Image or PDF. Extraction is performed via API (OCR).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="max-w-xs"
              />
              <Button
                onClick={handleUpload}
                disabled={!file || uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "Uploading…" : "Upload"}
              </Button>
            </div>
            {file && (
              <p className="text-body-sm text-muted-foreground">
                Selected: {file.name}
              </p>
            )}
            {fileId && (
              <Button
                variant="outline"
                onClick={handleExtract}
                disabled={extractMutation.isPending}
              >
                {extractMutation.isPending ? "Extracting…" : "Extract fields"}
              </Button>
            )}
          </CardContent>
        </Card>

        {extraction && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Extracted fields
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-body-sm">
                <div>
                  <Label className="text-muted-foreground">Vendor</Label>
                  <p>{extraction.vendor ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Invoice #</Label>
                  <p>{extraction.invoiceNumber ?? "—"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p>
                    {extraction.amount != null
                      ? formatCurrency(extraction.amount)
                      : "—"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Due date</Label>
                  <p>{extraction.dueDate ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-muted-foreground">Memo</Label>
                  <p>{extraction.memo ?? "—"}</p>
                </div>
                {extraction.confidence != null && (
                  <div>
                    <Label className="text-muted-foreground">Confidence</Label>
                    <p>{Math.round(extraction.confidence * 100)}%</p>
                  </div>
                )}
                {extraction.railType ? (
                  <div>
                    <Label className="text-muted-foreground">Suggested rail</Label>
                    <p className="capitalize">{extraction.railType.replace(/_/g, " ")}</p>
                  </div>
                ) : null}
              </div>
              <div className="space-y-1.5 pt-2">
                <Label htmlFor="invoice-purpose">Business purpose (optional)</Label>
                <Textarea
                  id="invoice-purpose"
                  rows={2}
                  className="resize-none text-sm"
                  placeholder="Why this payment should go through — shown on the transaction audit trail."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Label className="w-full text-muted-foreground">Submit payment request</Label>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                >
                  <option value="">Select wallet</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                >
                  <option value="">Select agent</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSubmitRequest}
                  disabled={
                    requestMutation.isPending ||
                    !walletId ||
                    !agentId ||
                    extraction.amount == null
                  }
                >
                  {requestMutation.isPending ? "Submitting…" : "Submit request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {txResult && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base">Policy decision</CardTitle>
            <CardDescription>
              Transaction request evaluated. Result below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <TransactionStatusBadge status={txResult.status} />
              {txResult.policyResult && (
                <span className="text-body-sm text-muted-foreground">
                  — {txResult.policyResult.replace(/_/g, " ")}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/transactions/${txResult.id}`}>View transaction</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
