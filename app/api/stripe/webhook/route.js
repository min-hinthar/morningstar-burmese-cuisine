import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { getSupabaseServiceRole } from "@/lib/supabaseClient";
import { getUpcomingWindow } from "@/lib/dates";
import { buildDefaultOrderItems } from "@/lib/orders";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!stripe) {
    return new Response("Stripe is not configured", { status: 500 });
  }

  const body = await request.text();
  const signature = headers().get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = getSupabaseServiceRole();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { userId, customizationType } = session.metadata ?? {};
      const stripeSubscriptionId = session.subscription;
      const { deliveryDate } = getUpcomingWindow();

      if (userId) {
        const { data: subscription } = await supabase
          .from("subscriptions")
          .update({
            status: "active",
            stripe_subscription_id: stripeSubscriptionId,
            start_date: new Date().toISOString(),
            next_delivery_date: deliveryDate.toISOString(),
          })
          .eq("user_id", userId)
          .eq("customization_type", customizationType)
          .order("created_at", { ascending: false })
          .limit(1)
          .select()
          .single();

        if (subscription) {
          const { data: order } = await supabase
            .from("orders")
            .insert({
              subscription_id: subscription.id,
              user_id: userId,
              customization_type: customizationType,
              delivery_date: deliveryDate.toISOString(),
              status: "confirmed",
              total_price: (session.amount_total ?? 0) / 100,
            })
            .select()
            .single();

          if (order) {
            const orderItems = buildDefaultOrderItems(customizationType).map((item) => ({
              ...item,
              order_id: order.id,
            }));
            await supabase.from("order_items").insert(orderItems);
          }
        }
      }
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object;
      const subscriptionId = invoice.subscription;
      const { data: subscription } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("stripe_subscription_id", subscriptionId)
        .single();

      if (subscription) {
        await supabase
          .from("subscriptions")
          .update({
            delivered_weeks_count: (subscription.delivered_weeks_count ?? 0) + 1,
            next_delivery_date: getUpcomingWindow().deliveryDate.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("id", subscription.id);

        await supabase.from("payments").insert({
          order_id: invoice.metadata?.orderId ?? null,
          stripe_payment_intent_id: invoice.payment_intent,
          stripe_invoice_id: invoice.id,
          status: "succeeded",
          amount: (invoice.amount_paid ?? 0) / 100,
          captured_at: new Date().toISOString(),
        });
      }
      break;
    }
    default:
      break;
  }

  return new Response("ok", { status: 200 });
}
