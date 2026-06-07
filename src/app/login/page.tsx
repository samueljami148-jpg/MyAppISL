import { CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="noise flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-black text-primary">
            <CreditCard />
          </div>
          <CardTitle className="text-2xl">LoyalPass</CardTitle>
          <p className="text-sm text-muted-foreground">Connexion securisee admin et commercant.</p>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
