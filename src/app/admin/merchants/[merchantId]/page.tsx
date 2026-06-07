import Link from "next/link";
import { notFound } from "next/navigation";
import { Bell, ExternalLink, Mail, Phone, UserRound } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { AdminMerchantSettingsForm } from "@/components/admin-merchant-settings-form";
import { NotificationForm } from "@/components/notification-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSuperAdmin } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase";
import { enrollmentUrl, formatCustomerName } from "@/lib/loyalty";
import { formatDate } from "@/lib/utils";
import type { Customer, LoyaltyCard, Merchant, Notification } from "@/types/database";

type CustomerRow = Customer & {
  loyalty_cards: LoyaltyCard[];
};

export default async function AdminMerchantDetailPage({ params }: { params: Promise<{ merchantId: string }> }) {
  await requireSuperAdmin();
  const { merchantId } = await params;
  const supabase = createSupabaseAdminClient();

  const [merchantResult, customersResult, notificationsResult] = await Promise.all([
    supabase.from("merchants").select("*").eq("id", merchantId).maybeSingle(),
    supabase
      .from("customers")
      .select("*, loyalty_cards(*)")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false }),
    supabase.from("notifications").select("*").eq("merchant_id", merchantId).order("created_at", { ascending: false }).limit(5)
  ]);

  const merchant = merchantResult.data as Merchant | null;
  if (!merchant) notFound();
  const customers = (customersResult.data || []) as CustomerRow[];
  const notifications = (notificationsResult.data || []) as Notification[];

  return (
    <AppShell role="admin">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-semibold uppercase text-muted-foreground">Commerce</p>
          <h1 className="text-3xl font-bold tracking-normal">{merchant.name}</h1>
          <p className="mt-1 break-all text-sm text-muted-foreground">{enrollmentUrl(merchant.id)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="inline-flex h-11 items-center gap-2 rounded-lg border bg-white px-4 text-sm font-semibold" href={enrollmentUrl(merchant.id)} target="_blank">
            <ExternalLink size={17} />
            Lien client
          </Link>
          <a className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground" href="#notifications">
            <Bell size={17} />
            Notifications
          </a>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Carte et recompense</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMerchantSettingsForm merchant={merchant} />
            </CardContent>
          </Card>

          <Card id="notifications">
            <CardHeader>
              <CardTitle>Notification clients</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <NotificationForm merchantId={merchant.id} />
              <div className="pt-2">
                <p className="mb-2 text-sm font-semibold text-muted-foreground">Derniers messages</p>
              </div>
              {notifications.length ? notifications.map((notification) => (
                <div key={notification.id} className="rounded-lg border bg-white p-3">
                  <p className="font-semibold">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
              )) : <p className="text-sm text-muted-foreground">Aucune notification envoyee.</p>}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Clients</CardTitle>
              <Badge>{customers.length} clients</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {customers.length ? customers.map((customer) => {
              const card = customer.loyalty_cards?.[0];
              return (
                <div key={customer.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                    <div>
                      <p className="flex items-center gap-2 font-semibold">
                        <UserRound size={17} />
                        {formatCustomerName(customer)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1"><Phone size={14} />{customer.phone}</span>
                        <span className="inline-flex items-center gap-1"><Mail size={14} />{customer.email || "-"}</span>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <p className="font-semibold">{card ? `${card.current_points} points` : "Pas de carte"}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(customer.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            }) : <p className="text-sm text-muted-foreground">Aucun client pour ce commerce.</p>}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
