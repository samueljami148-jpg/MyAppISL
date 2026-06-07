import { requireMerchant } from "@/lib/auth";
import { assertMerchantAccess, getCardWithRelations } from "@/lib/cards";

export async function GET(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const user = await requireMerchant();
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  const forbidden = assertMerchantAccess(card, user.merchant_id!);
  if (forbidden) return forbidden;
  return Response.json({ card });
}
