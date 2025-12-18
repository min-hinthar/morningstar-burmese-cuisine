/* eslint-disable @next/next/no-img-element */
"use client";

import { CUSTOMIZATION_OPTIONS } from "@/lib/constants";

export default function CustomizationSelector({ value, onChange }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CUSTOMIZATION_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`text-left rounded-2xl border px-4 py-4 transition hover:border-orange-400 hover:shadow-glow ${
              selected
                ? "border-orange-400/70 bg-orange-500/10 shadow-glow"
                : "border-slate-700 bg-slate-900/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-orange-200">{option.title}</p>
                <p className="mt-1 text-sm text-slate-200">{option.description}</p>
                <p className="mt-2 text-xs text-orange-300/90">{option.priceNote}</p>
              </div>
              <div
                className={`mt-1 h-5 w-5 rounded-full border ${
                  selected ? "border-orange-400 bg-orange-500" : "border-slate-500"
                }`}
                aria-hidden
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
