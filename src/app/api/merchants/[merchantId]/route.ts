import { NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ merchantId: string }> }) {
  await requireSuperAdmin();
  const { merchantId } = await params;
  const form = await request.formData();

  const rewardRequiredPoints = Number(form.get("reward_required_points") || 0);
  if (!Number.isFinite(rewardRequiredPoints) || rewardRequiredPoints < 1) {
    return Response.json({ error: "Objectif de points invalide" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .update({
      name: String(form.get("name") || "").trim(),
      logo_url: String(form.get("logo_url") || "") || null,
      card_image_url: String(form.get("card_image_url") || "") || null,
      card_background_url: String(form.get("card_background_url") || "") || null,
      card_logo_url: String(form.get("card_logo_url") || "") || null,
      card_strip_url: String(form.get("card_strip_url") || "") || null,
      card_thumbnail_url: String(form.get("card_thumbnail_url") || "") || null,
      card_text_color: String(form.get("card_text_color") || "#111111"),
      card_qr_position: ["bottom_right", "bottom_left", "center"].includes(String(form.get("card_qr_position"))) ? String(form.get("card_qr_position")) : "bottom_right",
      primary_color: String(form.get("primary_color") || "#FFD600"),
      reward_required_points: rewardRequiredPoints,
      reward_name: String(form.get("reward_name") || "").trim(),
      description: String(form.get("description") || ""),
      reward_redemption_mode: String(form.get("reward_redemption_mode") || "reset") === "deduct" ? "deduct" : "reset"
    })
    .eq("id", merchantId)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ merchant: data });
}
