"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type WaitlistEntry = {
  email: string;
  createdAt?: string;
};

const readEndpoint = "/api/waitlist";
const authKey = "custos_admin_authed";
const loginEndpoint = "/api/admin-login";
const sessionEndpoint = "/api/admin-session";
const logoutEndpoint = "/api/admin-logout";

const normalizeRows = (payload: unknown): WaitlistEntry[] => {
  const data = payload as Record<string, unknown> | unknown[];
  const rows = Array.isArray(data)
    ? data
    : (data?.data as unknown[]) ??
      (data?.rows as unknown[]) ??
      (data?.entries as unknown[]) ??
      (data?.records as unknown[]) ??
      [];

  const out: WaitlistEntry[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") {
      continue;
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
      continue;
    }
    out.push({ email, createdAt });
  }
  return out;
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

export default function AdminPage() {
  const [rows, setRows] = useState<WaitlistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(authKey) === "true" : false,
  );

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    void (async () => {
      try {
        const response = await fetch(loginEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
          throw new Error("Invalid credentials.");
        }
        localStorage.setItem(authKey, "true");
        setIsAuthed(true);
        setPassword("");
      } catch {
        setAuthError("Incorrect username or password.");
      }
    })();
  };

  const handleLogout = () => {
    void (async () => {
      try {
        await fetch(logoutEndpoint, { method: "POST", credentials: "include" });
      } finally {
        localStorage.removeItem(authKey);
        setIsAuthed(false);
      }
    })();
  };

  const loadRows = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(readEndpoint, { credentials: "include" });
      if (!response.ok) {
        throw new Error("Failed to fetch waitlist.");
      }

      const payload = (await response.json()) as unknown;
      setRows(normalizeRows(payload));
    } catch {
      setErrorMessage("Unable to load waitlist right now.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthed) return;
    void loadRows();
  }, [isAuthed]);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch(sessionEndpoint, { credentials: "include" });
        if (!response.ok) {
          localStorage.removeItem(authKey);
          setIsAuthed(false);
        }
      } catch {
        localStorage.removeItem(authKey);
        setIsAuthed(false);
      }
    })();
  }, []);

  const emptyState = useMemo(() => {
    if (isLoading) return "Loading waitlist…";
    if (errorMessage) return errorMessage;
    if (!rows.length) return "No signups yet.";
    return null;
  }, [isLoading, errorMessage, rows.length]);

  if (!isAuthed) {
    return (
      <div className="flex min-h-screen items-center bg-slate-50 px-6 py-24">
        <div className="mx-auto w-full max-w-md rounded-xl border border-slate-900 bg-white p-8 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <div className="mb-6 flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                className="border-slate-900 bg-white shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="border-slate-900 bg-white shadow-[1px_1px_0_0_rgba(0,0,0,1)]"
              />
            </div>
            {authError ? <p className="text-sm font-medium text-red-600">{authError}</p> : null}
            <Button
              type="submit"
              className="w-full border border-slate-900 font-semibold shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
              style={{ backgroundColor: "#eefa79", color: "#1e293b" }}
            >
              Sign in
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/favicon.svg" alt="" className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Waitlist Admin</h1>
              <p className="mt-1 text-sm text-slate-600">Latest signups and conversion metrics.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={() => void loadRows()}
              disabled={isLoading}
              className="border border-slate-900 bg-white font-semibold shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-slate-50"
            >
              {isLoading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              type="button"
              onClick={handleLogout}
              className="border border-slate-900 bg-white font-semibold shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:bg-slate-50"
            >
              Log out
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <div className="rounded-xl border border-slate-900 bg-white p-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
            <p className="text-sm font-medium text-slate-600">Total waitlist signups</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{rows.length}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-900 bg-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-900 hover:bg-slate-50/70">
                <TableHead className="font-semibold text-slate-900">Email</TableHead>
                <TableHead className="font-semibold text-slate-900">Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow
                  key={`${row.email}-${row.createdAt ?? "na"}`}
                  className="border-b border-slate-200 hover:bg-slate-50/70"
                >
                  <TableCell className="font-medium text-slate-900">{row.email}</TableCell>
                  <TableCell className="text-slate-600">{formatDate(row.createdAt)}</TableCell>
                </TableRow>
              ))}
              {emptyState ? (
                <TableRow>
                  <TableCell colSpan={2} className="py-10 text-center text-sm text-slate-600">
                    {emptyState}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
