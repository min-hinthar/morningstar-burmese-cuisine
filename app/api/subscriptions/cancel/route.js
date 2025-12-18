import { NextResponse } from "next/server";
import { getSupabaseServiceRole } from "@/lib/supabaseClient";
import { subscriptionCancelSchema } from "@/lib/schemas";
import { stripe } from "@/lib/stripe";

export async function POST(request) {
  const payload = await request.json();
  const parsed = subscriptionCancelSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const { subscriptionId, userId } = parsed.data;
    const supabase = getSupabaseServiceRole();

    const { data: subscription, error: findError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", userId)
      .single();

    if (findError || !subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    if (subscription.delivered_weeks_count < subscription.min_commitment_weeks) {
      return NextResponse.json(
        {
          error: "Commitment not met",
          message: `You can cancel after ${subscription.min_commitment_weeks} weeks. Delivered: ${subscription.delivered_weeks_count}`,
        },
        { status: 400 }
      );
    }

    if (stripe && subscription.stripe_subscription_id) {
      await stripe.subscriptions.update(subscription.stripe_subscription_id, {
        cancel_at_period_end: true,
        metadata: { canceled_via_app: true },
      });
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("id", subscriptionId);

    if (error) {
      return NextResponse.json(
        { error: "Unable to cancel subscription", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Subscription canceled" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
