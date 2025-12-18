import { NextResponse } from "next/server";
import { getSupabaseServiceRole } from "@/lib/supabaseClient";
import { subscriptionUpdateSchema } from "@/lib/schemas";
import { isBeforeCutoff } from "@/lib/dates";

export async function POST(request) {
  const payload = await request.json();
  const parsed = subscriptionUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!isBeforeCutoff()) {
    return NextResponse.json(
      {
        error: "Cutoff reached",
        message: "Changes are locked after Friday 3 PM PT for the upcoming delivery.",
      },
      { status: 400 }
    );
  }

  try {
    const { subscriptionId, customizationType, userId } = parsed.data;
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

    const { error } = await supabase
      .from("subscriptions")
      .update({ customization_type: customizationType, updated_at: new Date().toISOString() })
      .eq("id", subscriptionId);

    if (error) {
      return NextResponse.json(
        { error: "Unable to update customization", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Customization updated",
      customizationType,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
