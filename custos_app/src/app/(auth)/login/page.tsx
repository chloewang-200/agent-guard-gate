"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-gradient text-heading-1 text-foreground">Custos</h1>
          <p className="mt-2 text-body text-muted-foreground">
            Spend governance for AI agents. Connect agents, set policies, and control every payment.
          </p>
        </div>
        <Card className="border-border shadow-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a secure link to sign in.
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
                      callbackUrl: "/overview",
                      redirect: false,
                    });
                    if (result?.error) {
                      setErrorMessage(result.error);
                    } else {
                      setEmailSent(true);
                    }
                  } catch {
                    setErrorMessage(
                      "Auth request failed. Check server logs and verify DynamoDB table schema/GSI setup."
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
              {errorMessage ? <p className="text-caption text-destructive">{errorMessage}</p> : null}
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
