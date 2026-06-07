import { requireMerchant } from "@/lib/auth";
import { assertMerchantAccess, getCardWithRelations } from "@/lib/cards";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { nextCardStatus } from "@/lib/loyalty";
import { updateWallets } from "@/lib/wallet";

export async function POST(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const user = await requireMerchant();
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  const forbidden = assertMerchantAccess(card, user.merchant_id!);
  if (forbidden) return forbidden;

  const required = card!.merchants.reward_required_points;
  if (card!.current_points < required) {
    return Response.json({ error: "Recompense non disponible" }, { status: 400 });
  }

  const nextPoints = card!.merchants.reward_redemption_mode === "deduct" ? card!.current_points - required : 0;
  const supabase = createSupabaseAdminClient();
  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({
      current_points: nextPoints,
      status: nextCardStatus(nextPoints, required),
      updated_at: new Date().toISOString()
    })
    .eq("id", cardId)
    .eq("merchant_id", user.merchant_id);
  if (updateError) return Response.json({ error: updateError.message }, { status: 400 });

  await supabase.from("transactions").insert({
    merchant_id: user.merchant_id,
    card_id: cardId,
    action: "redeem_reward",
    points: required
  });

  const updatedCard = await getCardWithRelations(cardId);
  const wallet = updatedCard ? await updateWallets(updatedCard) : { ok: true, skipped: [] };

  return Response.json({
    ok: true,
    message: "Recompense utilisee avec succes.",
    card: updatedCard,
    wallet
  });
}
