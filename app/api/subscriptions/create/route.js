import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getSupabaseServiceRole } from "@/lib/supabaseClient";
import { buildDefaultOrderItems } from "@/lib/orders";
import { subscriptionCreateSchema } from "@/lib/schemas";
import { getUpcomingWindow } from "@/lib/dates";

export async function POST(request) {
  const body = await request.json();
  const parsed = subscriptionCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured on the server" },
      { status: 500 }
    );
  }

  if (!process.env.STRIPE_PRICE_ID) {
    return NextResponse.json(
      { error: "Missing STRIPE_PRICE_ID environment variable" },
      { status: 500 }
    );
  }

  const {
    userId,
    customerEmail,
    customerName,
    customizationType,
    addressId,
  } = parsed.data;

  try {
    const supabase = getSupabaseServiceRole();
    const { deliveryDate } = getUpcomingWindow();
    const lineItems = [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      },
    ];

    if (customizationType === "BEEF_GOAT" && process.env.STRIPE_BEEF_GOAT_PRICE_ID) {
      lineItems.push({
        price: process.env.STRIPE_BEEF_GOAT_PRICE_ID,
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: customerEmail,
      billing_address_collection: "auto",
      line_items: lineItems,
      subscription_data: {
        metadata: {
          userId,
          customizationType,
        },
      },
      metadata: {
        userId,
        customizationType,
        customerName,
        addressId: addressId ?? "",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?status=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?status=cancelled`,
    });

    const { data: subscriptionRecord, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: userId,
        status: "pending",
        customization_type: customizationType,
        start_date: new Date().toISOString(),
        next_delivery_date: deliveryDate.toISOString(),
        stripe_subscription_id: null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Unable to create subscription record", details: error.message },
        { status: 500 }
      );
    }

    const { data: orderRecord, error: orderError } = await supabase
      .from("orders")
      .insert({
        subscription_id: subscriptionRecord.id,
        user_id: userId,
        customization_type: customizationType,
        delivery_date: deliveryDate.toISOString(),
        status: "pending",
        total_price: 0,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: "Unable to create order", details: orderError.message },
        { status: 500 }
      );
    }

    const orderItems = buildDefaultOrderItems(customizationType).map((item) => ({
      ...item,
      order_id: orderRecord.id,
    }));

    await supabase.from("order_items").insert(orderItems);

    return NextResponse.json({
      checkoutUrl: session.url,
      subscriptionId: subscriptionRecord.id,
      orderId: orderRecord.id,
      deliveryDate: deliveryDate.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error creating subscription" }, { status: 500 });
  }
}
