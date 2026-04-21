import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { AnimatedDashboard } from "./AnimatedDashboard";

const waitlistEndpoint = "/api/waitlist";

export function HeroSection() {
  const [email, setEmail] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

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

    // Optimistic confirmation so users don't wait on the network.
    toast({
      title: "You're on the list",
      description: "We received your request and are processing it.",
    });
    setStatusMessage("You're on the list. We'll be in touch.");
    try {
      const response = await fetch(waitlistEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: new URLSearchParams({ email: trimmedEmail }),
      });

      if (!response.ok) {
        throw new Error("Waitlist request failed.");
      }

      setEmail("");
    } catch (_error) {
      toast({
        title: "Submission delayed",
        description: "We couldn't save your email yet. Please try again shortly.",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="top" className="relative overflow-hidden bg-white pt-24 pb-24 md:pt-36 md:pb-32">
      <div className="container relative max-w-7xl mx-auto px-6 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 sm:gap-12 lg:gap-12 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Launch <span className="text-blue-600">trusted <span className="relative inline-block">
                <span className="relative z-10">spending AI</span>
                <svg 
                  className="absolute bottom-0 left-0 w-full h-3 -rotate-1"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  style={{ overflow: 'visible' }}
                >
                  <path
                    d="M 0 15 Q 20 10, 40 12 T 80 10 T 120 12 T 160 10 T 200 12"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))' }}
                  />
                </svg>
              </span></span> agents with full control.
            </h1>
            <p className="mt-4 sm:mt-5 mx-auto lg:mx-0 max-w-xl text-base text-slate-600 sm:text-lg md:text-xl leading-relaxed">
              Budgets, approvals, and audit trails enforced in real time. Agents do the buying. Finance keeps the guardrails.
            </p>

            <form
              onSubmit={handleSubmit}
              className="mt-6 sm:mt-10 flex flex-col gap-4 px-2 sm:px-0 sm:flex-row sm:items-center sm:justify-center lg:justify-start"
            >
              <div className="relative flex-1 max-w-lg">
                <div className="relative w-full">
                  <Input
                    type="email"
                    placeholder="What's your work email?"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full h-12 sm:h-16 rounded-lg border border-slate-900 bg-white pl-4 sm:pl-6 pr-4 sm:pr-44 text-sm sm:text-base text-slate-900 placeholder:text-sm sm:placeholder:text-base placeholder:text-slate-400 focus:border-slate-900 focus:outline-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    required
                  />
                  <Button
                    type="submit"
                    className="mt-3 h-12 w-full rounded-lg border border-slate-900 px-5 text-base font-semibold text-slate-900 z-50 shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:absolute sm:right-2 sm:top-2 sm:mt-0 sm:h-12 sm:w-auto"
                    style={{ backgroundColor: '#eefa79' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f0fb8a")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eefa79")}
                  >
                    Get Started For Free
                  </Button>
                </div>
                {statusMessage && (
                  <p className="mt-3 text-sm text-slate-600" aria-live="polite">
                    {statusMessage}
                  </p>
                )}
              </div>
            </form>
          </motion.div>

          {/* Right: Animated Dashboard with Retro Tech Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative -mt-2 px-2 sm:px-0 sm:mt-0 lg:mt-0"
          >
            <div className="relative border border-slate-900 rounded-2xl p-6 bg-[#eefa79] shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <AnimatedDashboard />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
