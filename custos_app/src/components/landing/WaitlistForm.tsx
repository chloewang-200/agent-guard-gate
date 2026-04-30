"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type WaitlistFormProps = {
  size?: "default" | "lg";
  /** Hero overlap layout (email + inset button), same API as default. */
  variant?: "default" | "hero";
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
};

const heroInputClass =
  "h-14 rounded-lg border border-slate-900 bg-white pl-6 pr-[12.5rem] sm:pr-44 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]";

const heroButtonClass =
  "absolute right-2 top-2 z-10 h-10 whitespace-nowrap rounded-lg border border-slate-900 px-2 text-[11px] font-semibold text-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-[#eefa79] hover:bg-[#f0fb8a] sm:px-4 sm:text-sm";

export function WaitlistForm({
  size = "default",
  variant = "default",
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

  if (variant === "hero") {
    return (
      <div className={`w-full space-y-2 ${className ?? ""}`}>
        <form className="relative w-full" onSubmit={handleSubmit}>
          <Input
            type="email"
            name="email"
            placeholder={placeholder}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={`w-full ${heroInputClass}`}
            required
          />
          <Button type="submit" className={heroButtonClass}>
            {buttonLabel}
          </Button>
        </form>
        {status === "ok" ? (
          <p className="text-sm text-emerald-600 lg:text-left text-center">Thanks — you&apos;re on the list.</p>
        ) : null}
        {status === "err" ? (
          <p className="text-sm text-destructive lg:text-left text-center">
            Couldn&apos;t save your email yet. Try again shortly.
          </p>
        ) : null}
      </div>
    );
  }

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
