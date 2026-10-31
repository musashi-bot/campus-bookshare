import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-charcoal/80"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-3.5 py-3 sm:py-2.5 min-h-[44px] rounded-xl border border-paper-border bg-white text-charcoal placeholder:text-charcoal/40 text-base sm:text-sm transition duration-150 focus:border-amber focus:ring-2 focus:ring-amber/20 focus:outline-none disabled:bg-paper-warm disabled:cursor-not-allowed",
            error && "border-terracotta focus:border-terracotta focus:ring-terracotta/20",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-terracotta font-medium">{error}</p>}
        {helperText && !error && (
          <p className="text-[11px] text-charcoal/60 leading-normal">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
