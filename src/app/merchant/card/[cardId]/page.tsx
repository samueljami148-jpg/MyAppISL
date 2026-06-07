import { notFound } from "next/navigation";
import { Gift, Phone, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardActions } from "@/components/card-actions";
import { getCardWithRelations } from "@/lib/cards";
import { requireMerchant } from "@/lib/auth";
import { cardDisplay } from "@/lib/loyalty";
import { formatDate } from "@/lib/utils";

export default async function MerchantCardPage({ params }: { params: Promise<{ cardId: string }> }) {
  const user = await requireMerchant();
  const { cardId } = await params;
  const card = await getCardWithRelations(cardId);
  if (!card || card.merchant_id !== user.merchant_id) notFound();
  const display = cardDisplay(card);

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl space-y-5">
        <Card className="overflow-hidden">
          <div className="h-2" style={{ background: card.merchants.primary_color }} />
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Fiche client</p>
                <CardTitle className="text-3xl">{card.customers.first_name}</CardTitle>
              </div>
              <Badge tone={display.isRewardAvailable ? "warning" : "success"}>{display.statusText}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={<Phone size={17} />} label="Telephone" value={card.customers.phone} />
              <Info icon={<UserRound size={17} />} label="Email" value={card.customers.email || "-"} />
              <Info label="Creation" value={formatDate(card.created_at)} />
              <Info label="Objectif" value={`${card.merchants.reward_required_points} points`} />
            </div>
            <div className="rounded-xl bg-black p-5 text-white">
              <p className="text-sm text-white/60">Points actuels</p>
              <p className="mt-2 text-5xl font-bold tracking-normal">{display.progress}</p>
              <div className="mt-4 flex items-center gap-2 text-primary">
                <Gift size={18} />
                <span className="font-semibold">{card.merchants.reward_name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Actions caisse</CardTitle>
          </CardHeader>
          <CardContent>
            <CardActions cardId={card.id} rewardAvailable={display.isRewardAvailable} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function Info({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">{icon}{label}</p>
      <p className="mt-1 break-all font-semibold">{value}</p>
    </div>
  );
}
