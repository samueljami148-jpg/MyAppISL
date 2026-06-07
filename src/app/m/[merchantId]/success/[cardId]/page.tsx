import Image from "next/image";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import { WalletAddButtons } from "@/components/wallet-add-buttons";
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
        <WalletCardPreview merchant={card.merchants} customerName={card.customers.first_name} points={card.current_points} qrSrc={qr} />
        <Card className="shadow-soft">
          <CardContent className="p-5 text-center">
            <p className="text-sm font-semibold text-muted-foreground">QR Code unique de la carte client</p>
            <Image src={qr} alt="QR Code carte fidelite" width={220} height={220} className="mx-auto mt-4 rounded-xl border bg-white p-3" />
          </CardContent>
        </Card>
        <div className="grid gap-3">
          <WalletAddButtons
            appleUrl={applePassUrl(card.id)}
            googleUrl={googlePassUrl(card.id)}
            appleConfigured={Boolean(process.env.APPLE_PASS_TYPE_IDENTIFIER && process.env.APPLE_TEAM_IDENTIFIER)}
            googleConfigured={Boolean(process.env.GOOGLE_WALLET_ISSUER_ID)}
          />
        </div>
      </section>
    </main>
  );
}
