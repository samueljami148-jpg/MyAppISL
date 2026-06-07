import { NextRequest } from "next/server";
import { requireMerchant } from "@/lib/auth";
import { assertMerchantAccess, getCardWithRelations } from "@/lib/cards";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { nextCardStatus } from "@/lib/loyalty";
import { updateWallets } from "@/lib/wallet";

export async function POST(request: NextRequest, { params }: { params: Promise<{ cardId: string }> }) {
  const user = await requireMerchant();
  const { cardId } = await params;
  const body = await request.json();
  const points = Number(body.points || 0);
  if (!Number.isFinite(points) || points <= 0) {
    return Response.json({ error: "Nombre de points invalide" }, { status: 400 });
  }

  const card = await getCardWithRelations(cardId);
  const forbidden = assertMerchantAccess(card, user.merchant_id!);
  if (forbidden) return forbidden;

  const supabase = createSupabaseAdminClient();
  const nextPoints = card!.current_points + points;
  const nextStatus = nextCardStatus(nextPoints, card!.merchants.reward_required_points);

  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({ current_points: nextPoints, status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", cardId)
    .eq("merchant_id", user.merchant_id);
  if (updateError) return Response.json({ error: updateError.message }, { status: 400 });

  await supabase.from("transactions").insert({
    merchant_id: user.merchant_id,
    card_id: cardId,
    action: "add_points",
    points
  });

  const updatedCard = await getCardWithRelations(cardId);
  const wallet = updatedCard ? await updateWallets(updatedCard) : { ok: true, skipped: [] };

  return Response.json({
    ok: true,
    message: "Les points ont ete enregistres avec succes.",
    card: updatedCard,
    wallet
  });
}
