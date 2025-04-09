import * as React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  thickness?: "thin" | "normal" | "thick";
}

export function LoadingSpinner({ 
  className, 
  size = "md", 
  thickness = "normal",
  ...props 
}: LoadingSpinnerProps) {
  // Size mappings
  const sizeClass = {
    sm: "h-6 w-6",
    md: "h-10 w-10",
    lg: "h-16 w-16"
  };

  // Thickness mappings
  const thicknessClass = {
    thin: "border-2",
    normal: "border-3",
    thick: "border-4"
  };

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <motion.div
        className={cn(
          sizeClass[size],
          thicknessClass[thickness],
          "rounded-full border-transparent border-t-primary/80 border-r-primary/30",
          "transform-gpu"
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

// A more elaborate version with inner and outer rotating circles
export function FancyLoadingSpinner({
  className,
  size = "md", 
  ...props
}: LoadingSpinnerProps) {
  // Size mappings
  const sizeMap = {
    sm: { outer: "h-8 w-8", inner: "h-4 w-4" },
    md: { outer: "h-12 w-12", inner: "h-6 w-6" },
    lg: { outer: "h-20 w-20", inner: "h-10 w-10" }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)} {...props}>
      <motion.div
        className={cn(
          sizeMap[size].outer,
          "rounded-full border-2 border-transparent border-t-primary/80 border-r-primary/30",
          "transform-gpu absolute"
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      <motion.div
        className={cn(
          sizeMap[size].inner,
          "rounded-full border-2 border-transparent border-t-primary/60 border-r-primary/20",
          "transform-gpu absolute"
        )}
        animate={{ rotate: -360 }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}