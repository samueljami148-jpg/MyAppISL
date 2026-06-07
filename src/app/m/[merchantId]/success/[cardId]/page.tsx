import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Apple, BadgePlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getCardWithRelations } from "@/lib/cards";
import { applePassUrl, googlePassUrl, qrDataUrl } from "@/lib/loyalty";

export default async function SuccessPage({ params }: { params: Promise<{ merchantId: string; cardId: string }> }) {
  const { merchantId, cardId } = await params;
  const card = await getCardWithRelations(cardId);
  if (!card || card.merchant_id !== merchantId) notFound();
  const qr = await qrDataUrl(card.id);

  return (
    <main className="noise min-h-screen px-4 py-8">
      <section className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-normal">Carte creee</h1>
          <p className="mt-2 text-muted-foreground">Ajoutez-la a votre Wallet et presentez le QR en caisse.</p>
        </div>
        <Card className="overflow-hidden shadow-soft">
          <div className="h-2" style={{ background: card.merchants.primary_color }} />
          <CardContent className="p-5 text-center">
            <p className="text-sm font-semibold uppercase text-muted-foreground">{card.merchants.name}</p>
            <p className="mt-3 text-5xl font-bold tracking-normal">0 / {card.merchants.reward_required_points}</p>
            <p className="mt-3 text-lg font-semibold">🎁 {card.merchants.reward_name}</p>
            <Image src={qr} alt="QR Code carte fidelite" width={220} height={220} className="mx-auto mt-5 rounded-xl border bg-white p-3" />
          </CardContent>
        </Card>
        <div className="grid gap-3">
          <Link href={applePassUrl(card.id)} className="flex h-14 items-center justify-center gap-2 rounded-lg bg-black px-5 font-semibold text-white">
            <Apple size={20} />
            Ajouter a Apple Wallet
          </Link>
          <Link href={googlePassUrl(card.id)} className="flex h-14 items-center justify-center gap-2 rounded-lg border bg-white px-5 font-semibold">
            <BadgePlus size={20} />
            Ajouter a Google Wallet
          </Link>
        </div>
      </section>
    </main>
  );
}
