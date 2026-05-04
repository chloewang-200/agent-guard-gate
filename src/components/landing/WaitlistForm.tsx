import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

type WaitlistFormProps = {
  size?: "default" | "lg";
  variant?: "default" | "hero";
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
};

const heroInputClass =
  "h-14 rounded-lg border border-slate-900 bg-white pl-6 pr-[12.5rem] sm:pr-44 text-base text-slate-900 placeholder:text-slate-400 focus-visible:border-slate-900 focus-visible:ring-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)]";

const heroButtonClass =
  "absolute right-2 top-2 z-10 h-10 whitespace-nowrap rounded-lg border border-slate-900 px-2 text-[11px] font-semibold text-slate-900 shadow-[2px_2px_0_0_rgba(0,0,0,1)] bg-[#eefa79] hover:bg-[#f0fb8a] sm:px-4 sm:text-sm";

function waitlistPostUrl(): string {
  const base = import.meta.env.VITE_CUSTOS_APP_URL?.trim().replace(/\/$/, "");
  if (base) return `${base}/api/waitlist`;
  return "/api/waitlist";
}

function describeWaitlistFailure(
  response: Response,
  payload: { ok?: boolean; error?: string; details?: unknown } | null,
): string {
  if (payload?.details != null) {
    if (typeof payload.details === "string") return payload.details.slice(0, 600);
    try {
      return JSON.stringify(payload.details).slice(0, 600);
    } catch {
      return String(payload.details);
    }
  }
  if (payload?.error) return payload.error;
  if (!response.ok) return `Request failed (HTTP ${response.status}).`;
  return "Something went wrong.";
}

export function WaitlistForm({
  size = "default",
  variant = "default",
  className,
  buttonLabel = "Join beta",
  placeholder = "Enter your work email",
}: WaitlistFormProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim()) {
      toast({
        title: "Enter an email",
        description: "Please add a valid email to join the waitlist.",
      });
      return;
    }

    const trimmedEmail = email.trim();

    try {
      const body = new URLSearchParams({ email: trimmedEmail });
      const response = await fetch(waitlistPostUrl(), {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        credentials: "omit",
      });

      const raw = await response.text();
      let payload: {
        ok?: boolean;
        persisted?: boolean;
        warning?: string;
        error?: string;
        details?: unknown;
      } | null = null;
      if (raw) {
        try {
          payload = JSON.parse(raw) as typeof payload;
        } catch {
          payload = null;
        }
      }

      if (!response.ok || payload?.ok === false) {
        toast({
          title: "Couldn't save your email",
          description: describeWaitlistFailure(response, payload),
          variant: "destructive",
        });
        return;
      }

      if (payload?.persisted === false) {
        toast({
          title: "Not saved yet",
          description:
            payload.warning ||
            "The API did not persist this email (dev stub or missing Supabase env on the Custos server).",
          variant: "destructive",
        });
        return;
      }

      setEmail("");
      toast({
        title: "You're on the list",
        description: "Thanks for joining the waitlist.",
      });
    } catch (error: unknown) {
      const isNetwork =
        error instanceof TypeError &&
        (error.message === "Failed to fetch" ||
          error.message.includes("Failed to fetch") ||
          error.message.includes("Load failed"));
      toast({
        title: isNetwork ? "Can't reach the Custos API" : "Submission delayed",
        description: isNetwork
          ? "Start Custos in another terminal: yarn dev:custos (port 8080). If you use the marketing site from yarn dev, set VITE_CUSTOS_APP_URL=http://localhost:8080 in the repo root .env.local and restart Vite."
          : "We couldn't save your email yet. Please try again shortly.",
        variant: "destructive",
      });
    }
  };

  const inputSize = size === "lg" ? "h-12 text-base" : "h-10 text-sm";
  const buttonSize = size === "lg" ? "lg" : "default";

  if (variant === "hero") {
    return (
      <form
        className={`relative w-full ${className ?? ""}`}
        onSubmit={handleSubmit}
      >
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
    );
  }

  return (
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
  );
}
