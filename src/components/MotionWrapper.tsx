"use client";

import { motion, HTMLMotionProps } from "framer-motion";

interface Props extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
}

export function MotionDiv({ children, ...props }: Props) {
  return <motion.div {...props}>{children}</motion.div>;
}
