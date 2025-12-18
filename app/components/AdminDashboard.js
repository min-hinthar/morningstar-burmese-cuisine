"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabaseClient";
import { CUSTOMIZATION_OPTIONS } from "@/lib/constants";

export default function AdminDashboard() {
  const supabase = useMemo(() => {
    try {
      return getSupabaseBrowserClient();
    } catch (err) {
      console.error(err);
      return null;
    }
  }, []);
  const [subscriptions, setSubscriptions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });
      setSubscriptions(subs ?? []);

      const { data: orderData } = await supabase
        .from("orders")
        .select("*")
        .order("delivery_date", { ascending: true })
        .limit(50);
      setOrders(orderData ?? []);
    };
    load();
  }, [supabase]);

  if (!supabase) {
    return (
      <div className="glass rounded-2xl border border-slate-700/60 p-6">
        <p className="text-sm font-semibold text-orange-200">Supabase not configured</p>
        <p className="text-xs text-slate-300">
          Add Supabase environment variables to load subscriptions and orders.
        </p>
      </div>
    );
  }

  const groupedByCustomization = CUSTOMIZATION_OPTIONS.map((option) => ({
    ...option,
    items: subscriptions.filter((s) => s.customization_type === option.value),
  }));

  const manifest = orders.reduce((acc, order) => {
    const key = order.customization_type;
    acc[key] = acc[key] || [];
    acc[key].push(order);
    return acc;
  }, {});

  const beefRevenue = orders
    .filter((o) => o.customization_type === "BEEF_GOAT")
    .reduce((sum, order) => sum + Number(order.total_price || 0), 0);

  const handleRefresh = async () => {
    setMessage("Refreshing...");
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    setSubscriptions(subs ?? []);
    setMessage("Latest data loaded.");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Admin</p>
          <p className="text-lg font-semibold text-orange-200">Delivery manifest & revenue</p>
        </div>
        <button
          onClick={handleRefresh}
          className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-semibold text-slate-900 shadow-glow hover:bg-orange-400"
        >
          Refresh data
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {groupedByCustomization.map((group) => (
          <div key={group.value} className="glass rounded-2xl border border-slate-700/60 p-5">
            <p className="text-sm font-semibold text-orange-200">{group.title}</p>
            <p className="mt-2 text-3xl font-bold text-slate-50">{group.items.length}</p>
            <p className="text-xs text-slate-400">Active subscriptions</p>
          </div>
        ))}
        <div className="glass rounded-2xl border border-slate-700/60 p-5">
          <p className="text-sm font-semibold text-orange-200">Add-on revenue</p>
          <p className="mt-2 text-3xl font-bold text-slate-50">${beefRevenue.toFixed(2)}</p>
          <p className="text-xs text-slate-400">Beef/Goat upgrades</p>
        </div>
      </div>

      <div className="glass rounded-2xl border border-slate-700/60 p-5">
        <p className="text-sm font-semibold text-orange-200">Delivery manifest</p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {Object.keys(manifest).map((key) => (
            <div key={key} className="rounded-xl border border-slate-700 bg-slate-900/60 p-3">
              <p className="text-xs font-semibold text-orange-200">{key}</p>
              <ul className="mt-2 space-y-1 text-xs text-slate-200">
                {manifest[key].map((order) => (
                  <li key={order.id} className="flex items-center justify-between">
                    <span>{order.user_id ?? "Customer"}</span>
                    <span className="text-slate-400">{order.delivery_date}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <p className="text-xs text-slate-300" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
