import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WaitlistEntry = {
  email: string;
  createdAt?: string;
};

const readEndpoint = "/api/waitlist";

const normalizeRows = (payload: unknown): WaitlistEntry[] => {
  const data = payload as Record<string, unknown> | unknown[];
  const rows = Array.isArray(data)
    ? data
    : (data?.data as unknown[]) ??
      (data?.rows as unknown[]) ??
      (data?.entries as unknown[]) ??
      (data?.records as unknown[]) ??
      [];

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") {
        return null;
      }

      const record = row as Record<string, unknown>;
      const email =
        (record.email as string | undefined) ??
        (record.Email as string | undefined) ??
        (record["Email Address"] as string | undefined);
      const createdAt =
        (record.createdAt as string | undefined) ??
        (record.created_at as string | undefined) ??
        (record.timestamp as string | undefined) ??
        (record.submittedAt as string | undefined);

      if (!email) {
        return null;
      }

      return {
        email,
        createdAt,
      };
    })
    .filter((row): row is WaitlistEntry => Boolean(row?.email));
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

const Admin = () => {
  const [rows, setRows] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadRows = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(readEndpoint);
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist.");
      }

      const payload = (await response.json()) as unknown;
      setRows(normalizeRows(payload));
    } catch (error) {
      setErrorMessage("Unable to load waitlist right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadRows();
  }, []);

  const emptyState = useMemo(() => {
    if (isLoading) return "Loading waitlist…";
    if (errorMessage) return errorMessage;
    if (!rows.length) return "No signups yet.";
    return null;
  }, [isLoading, errorMessage, rows.length]);

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Waitlist Admin</h1>
            <p className="mt-2 text-sm text-muted-foreground">Latest signups from your waitlist.</p>
          </div>
          <Button onClick={loadRows} disabled={isLoading}>
            {isLoading ? "Refreshing..." : "Refresh"}
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.email}-${row.createdAt ?? "na"}`}>
                  <TableCell className="font-medium">{row.email}</TableCell>
                  <TableCell>{formatDate(row.createdAt)}</TableCell>
                </TableRow>
              ))}
              {emptyState && (
                <TableRow>
                  <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                    {emptyState}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
