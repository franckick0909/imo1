"use client";

import { motion } from "framer-motion";
import React from "react";

interface TitleAnimationFramerProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  as?: React.ElementType;
  splitBy?: "words" | "chars";
  autoPlay?: boolean;
}

export default function TitleAnimationFramer({
  text,
  className = "",
  delay = 0,
  duration = 0.6,
  stagger = 0.1,
  as: Component = "h1",
  splitBy = "words",
  autoPlay = false,
}: TitleAnimationFramerProps) {
  // Split le texte selon le type choisi en préservant les espaces
  const splitText = splitBy === "words" ? text.split(" ") : text.split("");

  return (
    <Component className={className}>
      <motion.span
        className="inline-block"
        initial="hidden"
        animate={autoPlay ? "visible" : undefined}
        whileInView={!autoPlay ? "visible" : undefined}
        viewport={!autoPlay ? { once: false, amount: 0.3 } : undefined}
        transition={{
          delayChildren: delay,
          staggerChildren: stagger,
        }}
      >
        {splitText.map((piece, index) => (
          <span key={index} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ y: "100%" }}
              variants={{
                hidden: { y: "100%" },
                visible: { y: "0%" },
              }}
              transition={{
                duration: duration,
                ease: "easeOut",
              }}
            >
              {splitBy === "words"
                ? piece + "\u00A0"
                : piece === " "
                  ? "\u00A0"
                  : piece}
            </motion.span>
          </span>
        ))}
      </motion.span>
    </Component>
  );
}
