import AuthPanel from "./components/AuthPanel";
import CutoffBanner from "./components/CutoffBanner";
import CustomizationSelector from "./components/CustomizationSelector";
import PlanCard from "./components/PlanCard";
import { CUSTOMIZATION_OPTIONS, DELIVERY_REGIONS } from "@/lib/constants";
import { formatDateShort, getUpcomingWindow } from "@/lib/dates";
import Link from "next/link";

export default function HomePage() {
  const { deliveryDate } = getUpcomingWindow();

  return (
    <main className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2 lg:items-center">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-wide text-orange-200/80">
            Mandalay Morning Star · Burmese weekly plan
          </p>
          <h1 className="text-4xl font-bold leading-tight text-slate-50 sm:text-5xl">
            Fresh Burmese curries & sides delivered every Sunday in LA & OC.
          </h1>
          <p className="text-lg text-slate-300">
            Subscribe to a rotating Burmese meal plan with customizable proteins, beef/goat
            upgrades, and vegetarian options. Cutoff every Friday at 3 PM PT for the upcoming
            Sunday delivery.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="#plan"
              className="rounded-lg bg-orange-500 px-6 py-3 text-sm font-semibold text-slate-900 shadow-glow hover:bg-orange-400"
            >
              View weekly plan
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 hover:border-orange-400"
            >
              Go to dashboard
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            {DELIVERY_REGIONS.map((region) => (
              <span
                key={region}
                className="rounded-full bg-slate-900/60 px-3 py-1 ring-1 ring-slate-700"
              >
                {region}
              </span>
            ))}
          </div>
        </div>
        <div className="glass gradient-border rounded-3xl border border-slate-800/70 p-6 shadow-glow">
          <p className="text-sm font-semibold text-orange-200">Next delivery</p>
          <p className="mt-1 text-3xl font-bold text-slate-50">
            {formatDateShort(deliveryDate)}
          </p>
          <p className="text-sm text-slate-300">Subscribe today to reserve your spot.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-200">
            <div className="rounded-xl bg-slate-900/60 p-3 ring-1 ring-slate-800">
              <p className="text-xs text-slate-400">Subscription</p>
              <p className="font-semibold text-orange-200">Weekly recurring</p>
              <p className="text-xs text-slate-400">Pause or cancel after 4 weeks</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-3 ring-1 ring-slate-800">
              <p className="text-xs text-slate-400">Add-on</p>
              <p className="font-semibold text-orange-200">Beef/Goat upgrade</p>
              <p className="text-xs text-slate-400">Tracked as invoice item</p>
            </div>
          </div>
        </div>
      </section>

      <CutoffBanner />

      <section id="plan" className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <PlanCard />
          <div className="glass rounded-2xl border border-slate-700/60 p-6">
            <p className="text-sm font-semibold text-orange-200">Customization options</p>
            <p className="text-xs text-slate-300">
              Choose your protein preferences and we'll adjust the lineup for your weekly delivery.
            </p>
            <div className="mt-4">
              <CustomizationSelector value="DEFAULT" onChange={() => {}} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          <AuthPanel />
          <div className="glass rounded-2xl border border-slate-700/60 p-6">
            <p className="text-sm font-semibold text-orange-200">What&apos;s included</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-200">
              {CUSTOMIZATION_OPTIONS.map((item) => (
                <li key={item.value} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-orange-400" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="glass rounded-3xl border border-slate-800/70 p-6 shadow-glow">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-orange-200">Stripe checkout</p>
            <p className="text-sm text-slate-300">
              Secure subscription checkout with add-on invoice items for beef/goat upgrades and a
              billing portal link for payment updates.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-200">Supabase auth & DB</p>
            <p className="text-sm text-slate-300">
              Email + passwordless magic links, profile & address tables, subscriptions, orders,
              order items, payments, and cutoff windows.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-orange-200">Operations ready</p>
            <p className="text-sm text-slate-300">
              Cutoff enforcement, delivery manifest grouping, add-on revenue tracking, and scheduled
              jobs for weekly automation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
