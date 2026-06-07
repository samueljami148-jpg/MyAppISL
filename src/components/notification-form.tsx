"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

export function NotificationForm({ merchantId }: { merchantId?: string }) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        merchantId,
        title: form.get("title"),
        message: form.get("message")
      })
    });
    const json = await response.json();
    setMessage(response.ok ? "Message enregistre. Livraison Wallet preparee pour la suite." : json.error);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input name="title" placeholder="Titre" required />
      <Textarea name="message" placeholder="Message" required />
      <Button disabled={loading}>
        <Send size={18} />
        {loading ? "Envoi..." : "Envoyer"}
      </Button>
      {message ? <p className="text-sm font-semibold text-muted-foreground">{message}</p> : null}
    </form>
  );
}
