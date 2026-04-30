"use client";

import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Server auth misconfiguration. On Vercel set NEXTAUTH_SECRET, NEXTAUTH_URL (or rely on VERCEL_URL for previews), SMTP vars, AWS credentials, and NEXTAUTH_DYNAMODB_TABLE.",
  AccessDenied: "You do not have access.",
  Verification: "This sign-in link expired or was already used. Request a new link.",
  Default: "Sign-in failed. Try again.",
};

/** NextAuth callbackUrl must stay same-origin; disallow protocol-relative or absolute URLs. */
function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/overview";
  return raw;
}

function LoginForm() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const postLoginDestination = safeCallbackUrl(searchParams.get("callbackUrl"));

  useEffect(() => {
    if (status !== "authenticated") return;
    // Full navigation so the session cookie from the magic-link callback is guaranteed to apply to the next document load.
    // Client-side router.replace often races the dashboard layout and loops login ↔ overview.
    window.location.replace(postLoginDestination);
  }, [status, postLoginDestination]);

  const callbackError = searchParams.get("error");
  const urlError =
    callbackError &&
    (AUTH_ERROR_MESSAGES[callbackError] ?? AUTH_ERROR_MESSAGES.Default);

  const [email, setEmail] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const combinedError = urlError ?? errorMessage;

  // Never hide the whole page while session is "loading" — if /api/auth/session hangs or errors,
  // users otherwise see an endless spinner after following the magic link.
  if (status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-background to-muted/30 px-4">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <p className="text-body text-muted-foreground">Signed in. Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-gradient text-heading-1 text-foreground">Custos</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Spend governance for AI agents. Connect agents, set policies, and control every payment.
          </p>
          {status === "loading" ? (
            <p className="mt-2 text-caption text-muted-foreground">
              Checking if you&apos;re already signed in…
            </p>
          ) : null}
        </div>
        <Card className="border-border shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a secure link to sign in. If you only saw
              Vercel&apos;s “Sign in to …vercel.app” screen, that unlocks the preview — you still
              need this Custos step.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                className="w-full"
                disabled={isLoadingEmail || !email}
                onClick={async () => {
                  setIsLoadingEmail(true);
                  setErrorMessage(null);
                  setEmailSent(false);
                  try {
                    const result = await signIn("email", {
                      email,
                      callbackUrl: postLoginDestination,
                      redirect: false,
                    });
                    if (result?.error) {
                      setErrorMessage(result.error);
                    } else {
                      setEmailSent(true);
                    }
                  } catch {
                    setErrorMessage(
                      "Auth request failed. Check server logs and verify DynamoDB table schema/GSI setup.",
                    );
                  }
                  setIsLoadingEmail(false);
                }}
              >
                {isLoadingEmail ? "Sending..." : "Send sign-in link"}
              </Button>
              {emailSent ? (
                <p className="text-caption text-emerald-600">
                  Sign-in link sent. Check your inbox and open it on this device.
                </p>
              ) : null}
              {combinedError ? (
                <p className="text-caption text-destructive">{combinedError}</p>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-caption text-muted-foreground">
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-gradient-to-b from-background to-muted/30 px-4">
          <h1 className="text-gradient text-heading-1 text-foreground">Custos</h1>
          <p className="text-caption text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
