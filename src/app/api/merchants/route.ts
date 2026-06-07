import { randomUUID } from "crypto";
import QRCode from "qrcode";
import { NextRequest } from "next/server";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { enrollmentUrl, makePublicSlug, normalizeMerchantType } from "@/lib/loyalty";

export async function POST(request: NextRequest) {
  await requireSuperAdmin();
  const form = await request.formData();
  const name = String(form.get("name") || "").trim();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const password = String(form.get("password") || randomUUID().slice(0, 12));

  if (!name || !email) {
    return Response.json({ error: "Nom du commerce et email requis" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const merchantId = randomUUID();
  const publicSlug = makePublicSlug(name);

  const merchant = {
    id: merchantId,
    name,
    type: normalizeMerchantType(form.get("type")),
    logo_url: String(form.get("logo_url") || "") || null,
    card_image_url: String(form.get("card_image_url") || "") || null,
    card_background_url: String(form.get("card_background_url") || "") || null,
    card_logo_url: String(form.get("card_logo_url") || "") || null,
    card_strip_url: String(form.get("card_strip_url") || "") || null,
    card_thumbnail_url: String(form.get("card_thumbnail_url") || "") || null,
    card_text_color: String(form.get("card_text_color") || "#111111"),
    card_qr_position: "bottom_right",
    card_design_config: {},
    primary_color: String(form.get("primary_color") || "#FFD600"),
    reward_required_points: Number(form.get("reward_required_points") || 10),
    reward_name: String(form.get("reward_name") || "Recompense"),
    description: String(form.get("description") || ""),
    reward_redemption_mode: String(form.get("reward_redemption_mode") || "reset") === "deduct" ? "deduct" : "reset",
    public_slug: publicSlug
  };

  const { error: merchantError } = await supabase.from("merchants").insert(merchant);
  if (merchantError) return Response.json({ error: merchantError.message }, { status: 400 });

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (authError || !authUser.user) {
    await supabase.from("merchants").delete().eq("id", merchantId);
    return Response.json({ error: authError?.message || "Creation compte impossible" }, { status: 400 });
  }

  const { error: userError } = await supabase.from("users").insert({
    id: authUser.user.id,
    merchant_id: merchantId,
    role: "merchant",
    email
  });
  if (userError) return Response.json({ error: userError.message }, { status: 400 });

  const publicUrl = enrollmentUrl(merchantId);
  const enrollmentQr = await QRCode.toDataURL(publicUrl);

  return Response.json({
    merchant,
    merchantId,
    email,
    temporaryPassword: password,
    publicUrl,
    enrollmentQr,
    wallet: {
      appleTemplate: "storeCard",
      googleTemplate: "genericPass"
    }
  });
}
