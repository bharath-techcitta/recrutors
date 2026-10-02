import React from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive?: boolean;
  supportingLabel: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export function MetricCard({
  title,
  value,
  change,
  isPositive = true,
  supportingLabel,
  icon: Icon,
  iconColor = "text-blue-600",
  iconBg = "bg-blue-50 border-blue-100",
}: MetricCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-all border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg border", iconBg)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded",
            isPositive ? "text-emerald-700 bg-emerald-50" : "text-amber-700 bg-amber-50"
          )}
        >
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {change}
        </span>
        <span className="text-xs text-slate-500 font-medium">{supportingLabel}</span>
      </div>
    </Card>
  );
}
