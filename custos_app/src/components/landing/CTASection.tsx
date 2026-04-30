"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-120px" });

  return (
    <section id="beta" className="relative bg-white pt-0 pb-4 md:pb-6">
      <div className="container relative" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mx-auto max-w-4xl text-center"
        >
          <WaitlistForm size="lg" buttonLabel="Join Private Beta" placeholder="What's your work email?" />
        </motion.div>
      </div>
    </section>
  );
}
