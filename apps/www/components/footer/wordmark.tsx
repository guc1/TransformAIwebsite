"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type FadeInStaggerProps = {
  className?: string;
  children: ReactNode;
};

function FadeInStagger({ className, children }: FadeInStaggerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, margin: "0px 0px 0px 0px" }}
      transition={{ staggerChildren: 0.15 }}
      className={cn("flex justify-center", className)}
    >
      {children}
    </motion.div>
  );
}

type WordmarkProps = {
  className?: string;
};

export function Wordmark({ className }: WordmarkProps) {
  const shouldReduceMotion = useReducedMotion();

  const variants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 64 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <FadeInStagger className={className}>
      <motion.div
        variants={variants}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-4xl"
      >
        <Image
          src="/images/logos/transformai/Darklogoenhanced.png"
          alt="TransformAI wordmark"
          width={1684}
          height={769}
          sizes="(max-width: 1024px) 80vw, 1024px"
          className="h-auto w-full"
        />
      </motion.div>
    </FadeInStagger>
  );
}
