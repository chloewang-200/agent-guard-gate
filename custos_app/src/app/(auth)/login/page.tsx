"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/** Landing waitlist section (`CTASection`); override with full URL when marketing lives elsewhere. */
const DEFAULT_WAITLIST_HREF = "/#beta";

function waitlistHref(): string {
  const fromEnv = process.env.NEXT_PUBLIC_WAITLIST_URL?.trim();
  return fromEnv || DEFAULT_WAITLIST_HREF;
}

const VERIFICATION_URL_MESSAGE =
  "This sign-in link expired or was already used. Request a new link below.";

/** NextAuth callbackUrl must stay same-origin; disallow protocol-relative or absolute URLs. */
function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) return "/overview";
  return raw;
}

function WaitlistCallout({ href }: { href: string }) {
  const external = /^https?:\/\//i.test(href);
  const linkClass =
    "font-medium text-primary underline underline-offset-4 hover:no-underline";
  return (
    <div className="rounded-md border border-border bg-muted/40 px-3 py-3 text-caption text-muted-foreground">
      <p className="text-foreground">
        Custos access is limited to approved emails right now. Join the waitlist and we&apos;ll reach out when your
        workspace can sign in.
      </p>
      <p className="mt-2">
        {external ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
            Join the waitlist
          </a>
        ) : (
          <Link href={href} className={linkClass}>
            Join the waitlist
          </Link>
        )}
      </p>
    </div>
  );
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
  const waitlistLink = useMemo(() => waitlistHref(), []);

  const [email, setEmail] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  /** True when sign-in failed in a way we explain as invite-only / waitlist (not expired-link). */
  const [showWaitlistNotice, setShowWaitlistNotice] = useState(false);

  const verificationOnly =
    callbackError === "Verification" ? VERIFICATION_URL_MESSAGE : null;
  const urlWaitlist =
    callbackError && callbackError !== "Verification" ? true : false;

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
                  setShowWaitlistNotice(false);
                  setEmailSent(false);
                  try {
                    const result = await signIn("email", {
                      email,
                      callbackUrl: postLoginDestination,
                      redirect: false,
                    });
                    if (result?.error) {
                      if (result.error === "Verification") {
                        setErrorMessage(VERIFICATION_URL_MESSAGE);
                      } else {
                        setShowWaitlistNotice(true);
                      }
                    } else {
                      setEmailSent(true);
                    }
                  } catch {
                    setShowWaitlistNotice(true);
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
              {verificationOnly ? (
                <p className="text-caption text-destructive">{verificationOnly}</p>
              ) : null}
              {errorMessage ? <p className="text-caption text-destructive">{errorMessage}</p> : null}
              {(urlWaitlist || showWaitlistNotice) && !verificationOnly ? (
                <WaitlistCallout href={waitlistLink} />
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
