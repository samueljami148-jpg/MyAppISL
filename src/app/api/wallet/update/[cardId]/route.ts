import { requireMerchant } from "@/lib/auth";
import { assertMerchantAccess, getCardWithRelations } from "@/lib/cards";
import { updateWallets } from "@/lib/wallet";

export async function POST(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const user = await requireMerchant();
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  const forbidden = assertMerchantAccess(card, user.merchant_id!);
  if (forbidden) return forbidden;
  const wallet = await updateWallets(card!);
  return Response.json({
    ok: true,
    message: "Les points ont ete enregistres avec succes.",
    wallet
  });
}
