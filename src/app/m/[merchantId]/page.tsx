import { notFound } from "next/navigation";
import { CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PublicSignupForm } from "@/components/public-signup-form";
import { WalletCardPreview } from "@/components/wallet-card-preview";
import { createSupabaseAdminClient } from "@/lib/supabase";
import type { Merchant } from "@/types/database";

export default async function PublicMerchantPage({ params }: { params: Promise<{ merchantId: string }> }) {
  const { merchantId } = await params;
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase.from("merchants").select("*").eq("id", merchantId).maybeSingle();
  const merchant = data as Merchant | null;
  if (!merchant) notFound();

  return (
    <main className="noise min-h-screen px-4 py-8">
      <section className="mx-auto max-w-md space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-2xl bg-black text-primary shadow-soft">
            {merchant.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={merchant.logo_url} alt={merchant.name} className="size-full rounded-2xl object-cover" />
            ) : (
              <CreditCard size={34} />
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-normal">{merchant.name}</h1>
          <p className="mx-auto mt-3 max-w-sm text-lg font-semibold" dir="auto">{merchant.description}</p>
        </div>
        <WalletCardPreview merchant={merchant} />
        <Card className="shadow-soft">
          <CardContent className="p-5">
            <p className="mb-4 text-sm font-semibold text-muted-foreground">
              {merchant.reward_required_points} points pour debloquer {merchant.reward_name}
            </p>
            <PublicSignupForm merchantId={merchant.id} />
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
