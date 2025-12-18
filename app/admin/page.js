import AdminDashboard from "../components/AdminDashboard";

export const metadata = {
  title: "Admin Dashboard | Mandalay Morning Star",
};

export default function AdminPage() {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-orange-200/80">Operations</p>
        <h1 className="text-3xl font-bold text-slate-50">Admin dashboard</h1>
        <p className="text-sm text-slate-300">
          View subscriptions by customization type, generate delivery manifests, and track add-on
          revenue for beef/goat upgrades.
        </p>
      </div>
      <AdminDashboard />
    </main>
  );
}
