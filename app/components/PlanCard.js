"use client";

import { DEFAULT_WEEKLY_PLAN } from "@/lib/constants";

export default function PlanCard() {
  return (
    <div className="glass gradient-border rounded-2xl p-6 shadow-glow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-orange-200">Weekly Burmese Meal Plan</h3>
          <p className="text-sm text-slate-300">Curated by Chef Min for Sunday deliveries.</p>
        </div>
        <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-orange-500/40">
          Recurring weekly
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {DEFAULT_WEEKLY_PLAN.map((item) => (
          <div
            key={item}
            className="rounded-xl border border-slate-700/70 bg-slate-900/50 px-3 py-3 text-sm text-slate-100"
          >
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
