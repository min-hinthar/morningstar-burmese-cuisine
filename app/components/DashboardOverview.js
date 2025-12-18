"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import CustomizationSelector from "./CustomizationSelector";
import { CUSTOMIZATION_OPTIONS } from "@/lib/constants";
import { formatDateShort, getUpcomingWindow, isBeforeCutoff } from "@/lib/dates";

export default function DashboardOverview() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return undefined;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSession(data.session);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener?.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    if (!session?.user) {
      setSubscription(null);
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setSubscription(sub);

      if (sub) {
        const { data: order } = await supabase
          .from("orders")
          .select("*")
          .eq("subscription_id", sub.id)
          .order("delivery_date", { ascending: false })
          .limit(1)
          .maybeSingle();
        setActiveOrder(order);
      } else {
        setActiveOrder(null);
      }
      setLoading(false);
    };
    load();
  }, [session, supabase]);

  if (!supabase) {
    return (
      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <p className="text-sm font-semibold text-orange-200">Supabase not configured</p>
        <p className="text-xs text-slate-300">
          Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable dashboard data.
        </p>
      </div>
    );
  }

  const handleUpdateCustomization = async (customizationType) => {
    if (!subscription) return;
    if (!isBeforeCutoff()) {
      setMessage("Cutoff reached. Changes will apply to the following week.");
    }
    const res = await fetch("/api/subscriptions/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscriptionId: subscription.id,
        userId: session?.user?.id,
        customizationType,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSubscription((prev) => ({ ...prev, customization_type: customizationType }));
      setMessage("Customization updated.");
    } else {
      setMessage(data.error || "Unable to update customization.");
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    const res = await fetch("/api/subscriptions/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscriptionId: subscription.id, userId: session.user.id }),
    });
    const data = await res.json();
    setMessage(res.ok ? "Subscription canceled" : data.error || "Unable to cancel");
  };

  if (!session) {
    return (
      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <p className="text-sm font-semibold text-orange-200">Sign in to view your dashboard</p>
        <p className="text-xs text-slate-300">
          Use Supabase Auth on the landing page to authenticate, then come back here to see your
          subscription status.
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-sm text-slate-200">Loading your subscription...</div>;
  }

  if (!subscription) {
    return (
      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <p className="text-sm font-semibold text-orange-200">No subscription yet</p>
        <p className="text-xs text-slate-300">Start on the landing page to create your plan.</p>
      </div>
    );
  }

  const nextWindow = getUpcomingWindow();
  return (
    <div className="space-y-5">
      <div className="glass rounded-2xl border border-slate-700/60 p-6 shadow-glow">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Upcoming delivery</p>
            <p className="text-lg font-semibold text-orange-200">
              {formatDateShort(new Date(activeOrder?.delivery_date ?? nextWindow.deliveryDate))}
            </p>
            <p className="text-xs text-slate-300">
              Status: {activeOrder?.status ?? "pending"} · Customization:{" "}
              {subscription.customization_type}
            </p>
          </div>
          <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-200 ring-1 ring-orange-500/40">
            Next cutoff: {formatDateShort(nextWindow.cutoffAt)} @ 3 PM PT
          </span>
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-orange-200">Change customization</p>
          <p className="text-xs text-slate-400">Before Friday 3 PM PT</p>
        </div>
        <div className="mt-3">
          <CustomizationSelector
            value={subscription.customization_type}
            onChange={handleUpdateCustomization}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="glass rounded-2xl border border-slate-700/60 p-5">
          <p className="text-sm font-semibold text-orange-200">Commitment tracker</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">
            {subscription.delivered_weeks_count}/{subscription.min_commitment_weeks} weeks
          </p>
          <p className="text-xs text-slate-400">Minimum commitment required before canceling.</p>
        </div>
        <div className="glass rounded-2xl border border-slate-700/60 p-5">
          <p className="text-sm font-semibold text-orange-200">Manage subscription</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              onClick={handleCancel}
              className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-100 ring-1 ring-slate-700 hover:bg-slate-700"
            >
              Cancel after commitment
            </button>
            <a
              href="https://billing.stripe.com/p/login"
              className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-900 shadow-glow hover:bg-orange-400"
            >
              Open billing portal
            </a>
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-200">
          {message}
        </div>
      )}
    </div>
  );
}
