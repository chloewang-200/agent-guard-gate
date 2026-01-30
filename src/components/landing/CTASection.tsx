import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare } from "lucide-react";

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-hero-glow opacity-60" />
      
      <div className="container relative z-10" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-heading-1 md:text-display-2 text-foreground">
            AI agents <span className="text-primary">will</span> spend money.
          </h2>
          
          <p className="mt-6 text-body-lg text-muted-foreground">
            Enterprises need to decide whether that spend is governed—or uncontrolled.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Button variant="hero" size="xl">
              Request Early Access
              <ArrowRight className="ml-1 h-5 w-5" />
            </Button>
            <Button variant="heroOutline" size="xl">
              <MessageSquare className="mr-1 h-4 w-4" />
              Talk to the Team
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8 text-body-sm text-muted-foreground"
          >
            Private beta now available for select enterprises
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
