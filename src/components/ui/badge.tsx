import React from "react";
import { cn, getMatchScoreColor } from "@/lib/utils";
import { RequirementStatus, ResumeStatus, SearchRunStatus } from "@/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger" | "subtle";
  size?: "sm" | "md";
}

export function Badge({ className, variant = "default", size = "md", children, ...props }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800 border-slate-200",
    secondary: "bg-blue-50 text-blue-700 border-blue-200",
    outline: "bg-white text-slate-700 border-slate-300",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    danger: "bg-red-50 text-red-700 border-red-200",
    subtle: "bg-slate-100 text-slate-600 border-transparent",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-1 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border tracking-tight transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function MatchScoreBadge({ score, className }: { score: number; className?: string }) {
  const style = getMatchScoreColor(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border",
        style.badge,
        className
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {score}% Match
    </span>
  );
}

export function StatusBadge({
  status,
  className,
}: {
  status: RequirementStatus | SearchRunStatus | ResumeStatus | string;
  className?: string;
}) {
  let variant: BadgeProps["variant"] = "default";
  let dotColor = "bg-slate-400";

  switch (status) {
    case "Completed":
    case "Parsed":
      variant = "success";
      dotColor = "bg-emerald-500";
      break;
    case "Ready":
    case "Retrieved":
      variant = "secondary";
      dotColor = "bg-blue-500";
      break;
    case "Searching":
    case "Processing":
    case "Running":
      variant = "warning";
      dotColor = "bg-amber-500 animate-pulse";
      break;
    case "Failed":
      variant = "danger";
      dotColor = "bg-red-500";
      break;
    case "Draft":
    case "Queued":
    case "Pending":
    default:
      variant = "default";
      dotColor = "bg-slate-400";
      break;
  }

  return (
    <Badge variant={variant} className={cn("gap-1.5 font-medium", className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", dotColor)} />
      {status}
    </Badge>
  );
}
