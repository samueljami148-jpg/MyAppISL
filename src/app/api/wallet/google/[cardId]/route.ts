import { redirect } from "next/navigation";
import { getCardWithRelations } from "@/lib/cards";
import { buildGoogleWalletLink } from "@/lib/wallet";

export async function GET(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  if (!card) return Response.json({ error: "Carte introuvable" }, { status: 404 });
  if (!process.env.GOOGLE_WALLET_ISSUER_ID) {
    return Response.json({
      error: "Google Wallet credentials are not configured.",
      message: "La carte client est creee. Configurez GOOGLE_WALLET_ISSUER_ID pour activer l'ajout Google Wallet."
    }, { status: 501 });
  }
  redirect(await buildGoogleWalletLink(card));
}
