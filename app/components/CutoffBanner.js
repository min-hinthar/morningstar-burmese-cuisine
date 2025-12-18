import { formatDateShort, getUpcomingWindow } from "@/lib/dates";

export default function CutoffBanner() {
  const { cutoffAt, deliveryDate } = getUpcomingWindow();

  return (
    <div className="glass gradient-border relative overflow-hidden rounded-2xl p-5 shadow-glow">
      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-orange-200">Weekly cutoff reminder</p>
          <p className="text-slate-200">
            Lock changes by <span className="font-semibold">Friday 3:00 PM PT</span> for the{" "}
            <span className="font-semibold">{formatDateShort(deliveryDate)}</span> Sunday delivery.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-orange-500/10 px-4 py-2 text-xs font-semibold text-orange-200 ring-1 ring-orange-500/40">
          Cutoff: {formatDateShort(cutoffAt)} @ 3:00 PM PT
        </span>
      </div>
    </div>
  );
}
