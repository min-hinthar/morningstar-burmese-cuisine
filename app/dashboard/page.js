import DashboardOverview from "../components/DashboardOverview";
import CutoffBanner from "../components/CutoffBanner";

export const metadata = {
  title: "Subscriber Dashboard | Mandalay Morning Star",
};

export default function DashboardPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-orange-200/80">Subscriber dashboard</p>
        <h1 className="text-3xl font-bold text-slate-50">Manage your weekly plan</h1>
        <p className="text-sm text-slate-300">
          Update customization before the Friday cutoff, manage addresses and payment methods, and
          review commitment status.
        </p>
      </div>
      <CutoffBanner />
      <DashboardOverview />
    </main>
  );
}
