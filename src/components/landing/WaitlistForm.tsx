import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";

type WaitlistFormProps = {
  size?: "default" | "lg";
  className?: string;
  buttonLabel?: string;
  placeholder?: string;
};

const endpoint = "/api/waitlist";

export function WaitlistForm({
  size = "default",
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

    setEmail("");
    toast({
      title: "You're on the list",
      description: "Thanks for joining the waitlist.",
    });

    try {
      const body = new URLSearchParams({ email: trimmedEmail });
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      if (!response.ok) {
        throw new Error("Waitlist request failed.");
      }
    } catch (_error) {
      toast({
        title: "Submission delayed",
        description: "We couldn't save your email yet. Please try again shortly.",
        variant: "destructive",
      });
    }
  };

  const inputSize = size === "lg" ? "h-12 text-base" : "h-10 text-sm";
  const buttonSize = size === "lg" ? "lg" : "default";

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
