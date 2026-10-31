import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "accent" | "outline" | "ghost" | "danger" | "teal";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all duration-150 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.97]";

    const variants = {
      primary: "bg-ink text-white hover:bg-ink-light shadow-sm",
      accent: "bg-amber text-ink hover:bg-amber-hover shadow-sm",
      teal: "bg-teal text-white hover:bg-teal-hover shadow-sm",
      outline: "border-2 border-paper-border text-ink hover:bg-paper-warm hover:border-ink/30",
      ghost: "text-charcoal hover:bg-paper-warm hover:text-ink",
      danger: "bg-terracotta text-white hover:bg-terracotta-hover shadow-sm",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5 min-h-[36px]",
      md: "px-4 py-2.5 text-sm rounded-xl gap-2 min-h-[44px]",
      lg: "px-5 py-3 text-sm sm:text-base rounded-2xl gap-2 min-h-[48px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
