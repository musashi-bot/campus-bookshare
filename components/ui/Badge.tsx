import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "rented" | "overdue" | "teal" | "amber" | "terracotta" | "ink" | "neutral";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = "neutral",
  size = "md",
  children,
  ...props
}) => {
  const variants = {
    available: "bg-teal/15 text-teal border border-teal/20",
    teal: "bg-teal/15 text-teal border border-teal/20",
    rented: "bg-amber/20 text-[#A66E1D] border border-amber/30",
    amber: "bg-amber/20 text-[#A66E1D] border border-amber/30",
    overdue: "bg-terracotta/15 text-terracotta border border-terracotta/25",
    terracotta: "bg-terracotta/15 text-terracotta border border-terracotta/25",
    ink: "bg-ink text-paper border border-ink",
    neutral: "bg-paper-warm text-charcoal/80 border border-paper-border",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-medium rounded-full",
    md: "px-2.5 py-1 text-xs font-semibold rounded-full",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 leading-none tracking-wide",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

