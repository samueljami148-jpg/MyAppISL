import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationForm } from "@/components/notification-form";
import { requireMerchant } from "@/lib/auth";

export default async function NotificationsPage() {
  await requireMerchant();
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase text-muted-foreground">Wallet messages</p>
        <h1 className="text-3xl font-bold tracking-normal">Notifications</h1>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Nouveau message</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationForm />
        </CardContent>
      </Card>
    </AppShell>
  );
}
