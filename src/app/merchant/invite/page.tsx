import Image from "next/image";
import QRCode from "qrcode";
import { Link as LinkIcon } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { InviteActions } from "@/components/invite-actions";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireMerchant } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { enrollmentUrl } from "@/lib/loyalty";
import type { Merchant } from "@/types/database";

export default async function MerchantInvitePage() {
  const user = await requireMerchant();
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("merchants").select("*").eq("id", user.merchant_id).single();
  const merchant = data as Merchant;
  const inviteUrl = enrollmentUrl(merchant.id);
  const qr = await QRCode.toDataURL(inviteUrl, { margin: 1, width: 420 });

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Invitation client</p>
        <h1 className="text-3xl font-bold tracking-normal">Envoyer le lien client</h1>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle>Lien public d&apos;inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-3 rounded-lg border bg-white p-4">
              <LinkIcon size={18} />
              <p className="break-all font-mono text-sm">{inviteUrl}</p>
            </div>
            <InviteActions merchantName={merchant.name} inviteUrl={inviteUrl} />
            <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
              Bonjour, ajoutez votre carte de fidelite {merchant.name} ici :<br />
              <span className="break-all font-mono text-foreground">{inviteUrl}</span>
            </div>
          </CardContent>
        </Card>
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>QR code d&apos;inscription</CardTitle>
            </CardHeader>
            <CardContent>
              <Image src={qr} alt="QR code inscription client" width={320} height={320} className="mx-auto rounded-xl border bg-white p-3" />
            </CardContent>
          </Card>
          <WalletCardPreview merchant={merchant} compact />
        </div>
      </div>
    </AppShell>
  );
}
