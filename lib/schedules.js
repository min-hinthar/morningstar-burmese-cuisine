import { getSupabaseServiceRole } from "./supabaseClient";
import { buildDefaultOrderItems } from "./orders";
import { getUpcomingWindow } from "./dates";

export async function lockWeeklyChanges() {
  const supabase = getSupabaseServiceRole();
  const { deliveryDate } = getUpcomingWindow();
  await supabase
    .from("orders")
    .update({ status: "confirmed" })
    .eq("delivery_date", deliveryDate.toISOString());
}

export async function generateSundayManifest() {
  const supabase = getSupabaseServiceRole();
  const { deliveryDate } = getUpcomingWindow();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("status", "active");

  if (!subs?.length) return [];

  const manifest = [];
  for (const subscription of subs) {
    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        subscription_id: subscription.id,
        user_id: subscription.user_id,
        customization_type: subscription.customization_type,
        delivery_date: deliveryDate.toISOString(),
        status: "pending",
      })
      .select()
      .single();

    if (!error && order) {
      const orderItems = buildDefaultOrderItems(subscription.customization_type).map((item) => ({
        ...item,
        order_id: order.id,
      }));
      await supabase.from("order_items").insert(orderItems);
      manifest.push(order);
    }
  }
  return manifest;
}

export async function rolloverWeek() {
  const supabase = getSupabaseServiceRole();
  const { deliveryDate } = getUpcomingWindow();
  const { data: subs } = await supabase.from("subscriptions").select("*").eq("status", "active");

  for (const subscription of subs ?? []) {
    await supabase
      .from("subscriptions")
      .update({
        delivered_weeks_count: (subscription.delivered_weeks_count ?? 0) + 1,
        next_delivery_date: deliveryDate.toISOString(),
      })
      .eq("id", subscription.id);
  }
}
