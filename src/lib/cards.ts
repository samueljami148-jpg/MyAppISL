import { createSupabaseAdminClient } from "@/lib/supabase";
import type { LoyaltyCardWithCustomer } from "@/types/database";

export async function getCardWithRelations(cardId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("loyalty_cards")
    .select("*, customers(*), merchants(*)")
    .eq("id", cardId)
    .maybeSingle();

  if (error) throw error;
  return data as LoyaltyCardWithCustomer | null;
}

export function assertMerchantAccess(card: LoyaltyCardWithCustomer | null, merchantId: string) {
  if (!card) {
    return Response.json({ error: "Carte introuvable" }, { status: 404 });
  }
  if (card.merchant_id !== merchantId) {
    return Response.json({ error: "Acces interdit" }, { status: 403 });
  }
  return null;
}
