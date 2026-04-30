"use client";

import { motion } from "framer-motion";
import { AnimatedDashboard } from "./AnimatedDashboard";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export function HeroSection() {
  return (
    <section id="top" className="relative overflow-hidden bg-white pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="container relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1]">
              Launch <span className="text-slate-900">trusted <span className="relative inline-block">
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
            <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-lg text-slate-600 md:text-xl leading-relaxed">
              Deploy AI agents that book travel, manage vendors, and execute purchases with real-time control of budgets, approvals, and audit-ready records.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center lg:justify-start">
              <div className="relative w-full max-w-md">
                <WaitlistForm
                  variant="hero"
                  buttonLabel="Get Started For Free"
                  placeholder="What's your work email?"
                />
              </div>
            </div>
          </motion.div>

          {/* Right: Animated Dashboard with Retro Tech Style */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
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
