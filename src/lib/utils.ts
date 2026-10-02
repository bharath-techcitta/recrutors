import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getMatchScoreColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  category: "high" | "medium" | "low";
} {
  if (score >= 80) {
    return {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
      category: "high",
    };
  }
  if (score >= 65) {
    return {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      badge: "bg-amber-100 text-amber-800 border-amber-300",
      category: "medium",
    };
  }
  return {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    category: "low",
  };
}
