import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import heroDiagram from "@/assets/hero-diagram.png";

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[500px] bg-hero-glow pointer-events-none" />

      <div className="container relative z-10 flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-body-sm font-medium text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Now in private beta
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl text-center text-display-2 md:text-display-1 text-foreground"
        >
          The Financial Control Plane for{" "}
          <span className="text-gradient">Autonomous AI Agents</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 max-w-2xl text-center text-body-lg text-muted-foreground"
        >
          Safely enable AI agents to spend money—while preserving enterprise-grade control, compliance, and accountability.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-4 max-w-2xl text-center text-body text-muted-foreground/80"
        >
          As AI agents begin purchasing software, booking services, and provisioning infrastructure, traditional finance tools break. This platform introduces agent-native wallets and real-time spend governance—built for autonomous systems, not humans.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Button variant="hero" size="xl">
            Request Early Access
            <ArrowRight className="ml-1 h-5 w-5" />
          </Button>
          <Button variant="heroOutline" size="xl">
            <Play className="mr-1 h-4 w-4" />
            View Architecture
          </Button>
        </motion.div>

        {/* Hero diagram */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 w-full max-w-5xl"
        >
          <div className="relative rounded-2xl border border-border/50 bg-card p-2 shadow-xl shadow-slate-200/50">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-border/50 to-transparent" />
            <img
              src={heroDiagram}
              alt="AI Agent Wallets Architecture - Agents connected to wallets, policy engine, and payment rails"
              className="relative rounded-xl w-full"
            />
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 flex flex-col items-center gap-4"
        >
          <p className="text-caption text-muted-foreground uppercase tracking-wider">
            Built for enterprise teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Fortune 500", "Series B+", "AI-First"].map((label) => (
              <span key={label} className="text-body-lg font-semibold text-foreground">
                {label}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
