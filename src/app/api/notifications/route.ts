import { NextRequest } from "next/server";
import { requireMerchant } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const user = await requireMerchant();
  const body = await request.json();
  const title = String(body.title || "").trim();
  const message = String(body.message || "").trim();
  if (!title || !message) return Response.json({ error: "Titre et message requis" }, { status: 400 });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .insert({ merchant_id: user.merchant_id, title, message })
    .select()
    .single();
  if (error) return Response.json({ error: error.message }, { status: 400 });

  return Response.json({
    ok: true,
    notification: data,
    futureDelivery: ["Apple Push Notifications", "Google Wallet Messages"]
  });
}
