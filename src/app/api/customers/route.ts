import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const merchantId = String(body.merchantId || "");
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = body.email ? String(body.email).trim().toLowerCase() : null;

  if (!merchantId || !firstName || !lastName || !phone || !email) {
    return Response.json({ error: "Nom, prenom, email et telephone requis" }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const { data: merchant, error: merchantError } = await supabase
    .from("merchants")
    .select("*")
    .eq("id", merchantId)
    .maybeSingle();
  if (merchantError || !merchant) return Response.json({ error: "Commerce introuvable" }, { status: 404 });

  const customerId = randomUUID();
  const cardId = randomUUID();

  const { error: customerError } = await supabase.from("customers").insert({
    id: customerId,
    merchant_id: merchantId,
    first_name: firstName,
    last_name: lastName,
    phone,
    email
  });
  if (customerError) return Response.json({ error: customerError.message }, { status: 400 });

  const { error: cardError } = await supabase.from("loyalty_cards").insert({
    id: cardId,
    merchant_id: merchantId,
    customer_id: customerId,
    current_points: 0,
    status: "active",
    wallet_serial_number: cardId
  });
  if (cardError) return Response.json({ error: cardError.message }, { status: 400 });

  return Response.json({ customerId, cardId, redirectTo: `/m/${merchantId}/success/${cardId}` });
}
