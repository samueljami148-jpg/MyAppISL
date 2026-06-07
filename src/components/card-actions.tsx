"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Gift, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CardActions({ cardId, rewardAvailable }: { cardId: string; rewardAvailable: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState("");
  const [custom, setCustom] = useState("1");
  const [message, setMessage] = useState("");

  async function add(points: number) {
    setLoading(`+${points}`);
    const response = await fetch(`/api/cards/${cardId}/add-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points })
    });
    const json = await response.json();
    setMessage(json.message || json.error || "");
    setLoading("");
    router.refresh();
  }

  async function redeem() {
    setLoading("redeem");
    const response = await fetch(`/api/cards/${cardId}/redeem`, { method: "POST" });
    const json = await response.json();
    setMessage(json.message || json.error || "");
    setLoading("");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 5].map((points) => (
          <Button key={points} size="lg" onClick={() => add(points)} disabled={Boolean(loading)}>
            <Plus size={18} /> {points}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <Input value={custom} onChange={(event) => setCustom(event.target.value)} type="number" min="1" inputMode="numeric" />
        <Button variant="secondary" onClick={() => add(Number(custom))} disabled={Boolean(loading)}>
          Ajouter
        </Button>
      </div>
      <Button className="w-full" size="lg" variant={rewardAvailable ? "danger" : "secondary"} onClick={redeem} disabled={!rewardAvailable || Boolean(loading)}>
        <Gift size={18} />
        Utiliser recompense
      </Button>
      {message ? <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{message}</p> : null}
    </div>
  );
}
