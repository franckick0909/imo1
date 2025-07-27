"use client";

import { ReactLenis } from "lenis/react";

export default function SmoothLenis({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ReactLenis root>{children}</ReactLenis>;
}
