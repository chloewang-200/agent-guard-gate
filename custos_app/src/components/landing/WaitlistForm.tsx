"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WaitlistFormProps = {
  size?: "default" | "lg";
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
};

export function WaitlistForm({
  size = "default",
  className,
  buttonLabel = "Join beta",
  placeholder = "Enter your work email",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "err">("idle");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("idle");

    if (!email.trim()) return;

    const trimmedEmail = email.trim();

    try {
      const body = new URLSearchParams({ email: trimmedEmail });
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      if (!response.ok) throw new Error("Waitlist request failed.");
      setEmail("");
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  };

  const inputSize = size === "lg" ? "h-12 text-base" : "h-10 text-sm";
  const buttonSize = size === "lg" ? "lg" : "default";

  return (
    <div className="w-full space-y-2">
      <form
        className={`flex w-full flex-col gap-3 sm:flex-row sm:items-center ${className ?? ""}`}
        onSubmit={handleSubmit}
      >
        <Input
          type="email"
          name="email"
          placeholder={placeholder}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`flex-1 border-slate-300 bg-white ${inputSize}`}
          required
        />
        <Button
          type="submit"
          size={buttonSize}
          className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800 sm:min-w-[190px]"
        >
          {buttonLabel}
        </Button>
      </form>
      {status === "ok" ? (
        <p className="text-center text-sm text-emerald-600">Thanks — you&apos;re on the list.</p>
      ) : null}
      {status === "err" ? (
        <p className="text-center text-sm text-destructive">
          Couldn&apos;t save your email yet. Try again shortly.
        </p>
      ) : null}
    </div>
  );
}
