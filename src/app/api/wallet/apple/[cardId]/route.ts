import { getCardWithRelations } from "@/lib/cards";
import { buildApplePass } from "@/lib/wallet";

export async function GET(_request: Request, { params }: { params: Promise<{ cardId: string }> }) {
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  if (!card) return Response.json({ error: "Carte introuvable" }, { status: 404 });

  const pass = await buildApplePass(card);
  return new Response(new Uint8Array(pass.buffer), {
    headers: {
      "Content-Type": pass.contentType,
      "Content-Disposition": `attachment; filename="${pass.filename}"`
    }
  });
}
