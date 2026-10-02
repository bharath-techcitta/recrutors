import React from "react";
import { cn } from "@/lib/utils";

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  className?: string;
  indicatorClassName?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "emerald" | "amber" | "rose" | "auto";
}

export function ProgressBar({
  value,
  max = 100,
  className,
  indicatorClassName,
  showLabel = false,
  size = "md",
  color = "auto",
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizes = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  let colorClass = "bg-blue-600";
  if (color === "emerald") colorClass = "bg-emerald-600";
  else if (color === "amber") colorClass = "bg-amber-500";
  else if (color === "rose") colorClass = "bg-rose-500";
  else if (color === "auto") {
    if (percentage >= 80) colorClass = "bg-emerald-600";
    else if (percentage >= 65) colorClass = "bg-amber-500";
    else colorClass = "bg-slate-500";
  }

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-slate-700">
          <span>Match Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      <div className={cn("w-full overflow-hidden rounded-full bg-slate-100", sizes[size], className)}>
        <div
          className={cn("h-full transition-all duration-500 ease-out rounded-full", colorClass, indicatorClassName)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
