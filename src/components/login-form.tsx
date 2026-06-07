"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const supabase = createSupabaseBrowserClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password"))
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    const roleResponse = await fetch("/api/auth/role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accessToken: data.session.access_token })
    });
    const profile = await roleResponse.json();

    if (!roleResponse.ok) {
      setError(profile.error || "Profil utilisateur introuvable");
      return;
    }

    router.push(profile?.role === "super_admin" ? "/admin" : "/merchant/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="email" type="email" placeholder="email@commerce.com" required />
      <Input name="password" type="password" placeholder="Mot de passe" required />
      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      <Button className="w-full" size="lg" disabled={loading}>
        <LogIn size={18} />
        {loading ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
