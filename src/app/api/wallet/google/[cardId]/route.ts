import { redirect } from "next/navigation";
import { getCardWithRelations } from "@/lib/cards";
import { buildGoogleWalletLink } from "@/lib/wallet";

export async function GET(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  if (!card) return Response.json({ error: "Carte introuvable" }, { status: 404 });
  redirect(await buildGoogleWalletLink(card));
}
