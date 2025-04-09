import * as React from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { LoadingSpinner, FancyLoadingSpinner } from "./loading-spinner";

export interface LoadingOverlayProps {
  className?: string;
  isLoading: boolean;
  text?: string;
  spinnerType?: "simple" | "fancy";
  spinnerSize?: "sm" | "md" | "lg";
  fullScreen?: boolean;
}

export function LoadingOverlay({
  className,
  isLoading,
  text,
  spinnerType = "simple",
  spinnerSize = "md",
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={cn(
            "flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-50",
            fullScreen
              ? "fixed inset-0"
              : "absolute inset-0 rounded-xl",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {spinnerType === "simple" ? (
            <LoadingSpinner size={spinnerSize} />
          ) : (
            <FancyLoadingSpinner size={spinnerSize} />
          )}
          
          {text && (
            <motion.span
              className="mt-4 text-sm font-light text-foreground/80"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {text}
            </motion.span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}