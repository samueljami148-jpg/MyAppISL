"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PublicSignupForm({ merchantId }: { merchantId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        firstName: form.get("firstName"),
        lastName: form.get("lastName"),
        phone: form.get("phone"),
        email: form.get("email")
      })
    });
    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(json.error || "Creation impossible");
      return;
    }
    router.push(json.redirectTo);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <Input name="firstName" placeholder="Prenom" required autoComplete="given-name" />
      <Input name="lastName" placeholder="Nom" required autoComplete="family-name" />
      <Input name="phone" type="tel" placeholder="Telephone" required autoComplete="tel" />
      <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
      {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
      <Button className="w-full" size="lg" disabled={loading}>
        {loading ? "Creation..." : "Creer ma carte"}
      </Button>
    </form>
  );
}
