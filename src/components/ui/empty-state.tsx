import React from "react";
import { LucideIcon, Search, AlertCircle, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm" variant="primary" className="mt-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  description = "An error occurred while loading this section. Please try again.",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border border-red-200 rounded-xl bg-red-50/50 text-red-900">
      <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
      <h4 className="text-sm font-semibold">{title}</h4>
      <p className="text-xs text-red-700 mt-1 max-w-sm">{description}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline" className="mt-3 bg-white text-red-700 border-red-300">
          Try Again
        </Button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ className, rows = 3 }: { className?: string; rows?: number }) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      <div className="h-5 bg-slate-200 rounded w-1/3" />
      {Array.from({ length: rows }).map((_, idx) => (
        <div key={idx} className="h-10 bg-slate-100 rounded w-full" />
      ))}
    </div>
  );
}
