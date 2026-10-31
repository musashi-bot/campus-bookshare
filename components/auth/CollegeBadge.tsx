import React from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollegeBadgeProps {
  collegeName?: string | null;
  className?: string;
  showIcon?: boolean;
}

export function CollegeBadge({
  collegeName,
  className,
  showIcon = true,
}: CollegeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal/10 text-teal border border-teal/30",
        className
      )}
      title={collegeName ? `Verified student at ${collegeName}` : "College domain verified"}
    >
      {showIcon && <ShieldCheck className="w-3.5 h-3.5 text-teal shrink-0" />}
      <span>College Verified</span>
    </span>
  );
}

