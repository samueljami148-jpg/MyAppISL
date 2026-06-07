import { NextRequest } from "next/server";
import { requireMerchant } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function PATCH(request: NextRequest) {
  const user = await requireMerchant();
  const body = await request.json();

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("merchants")
    .update({
      card_background_url: body.cardBackgroundUrl || null,
      card_logo_url: body.cardLogoUrl || null,
      card_strip_url: body.cardStripUrl || null,
      card_thumbnail_url: body.cardThumbnailUrl || null,
      card_text_color: body.cardTextColor || "#111111",
      primary_color: body.primaryColor || "#FFD600",
      card_qr_position: ["bottom_right", "bottom_left", "center"].includes(body.cardQrPosition) ? body.cardQrPosition : "bottom_right",
      card_design_config: {
        qrPosition: body.cardQrPosition || "bottom_right",
        updatedAt: new Date().toISOString()
      }
    })
    .eq("id", user.merchant_id)
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 400 });
  return Response.json({ merchant: data });
}
