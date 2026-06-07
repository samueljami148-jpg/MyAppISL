import { randomUUID } from "crypto";
import QRCode from "qrcode";
import { appUrl } from "@/lib/utils";
import type { CardStatus, LoyaltyCardWithCustomer, MerchantType } from "@/types/database";

export function normalizeMerchantType(value: FormDataEntryValue | null): MerchantType {
  const allowed: MerchantType[] = ["restaurant", "cafe", "coiffeur", "barber", "gym", "other"];
  return allowed.includes(value as MerchantType) ? (value as MerchantType) : "other";
}

export function nextCardStatus(points: number, required: number): CardStatus {
  return points >= required ? "reward_available" : "active";
}

export function makePublicSlug(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base || "merchant"}-${randomUUID().slice(0, 8)}`;
}

export function qrPayload(cardId: string) {
  return JSON.stringify({ cardId });
}

export async function qrDataUrl(cardId: string) {
  return QRCode.toDataURL(qrPayload(cardId), {
    margin: 1,
    width: 420,
    color: {
      dark: "#000000",
      light: "#FFFFFF"
    }
  });
}

export function enrollmentUrl(merchantId: string) {
  return appUrl(`/m/${merchantId}`);
}

export function applePassUrl(cardId: string) {
  return appUrl(`/api/wallet/apple/${cardId}`);
}

export function googlePassUrl(cardId: string) {
  return appUrl(`/api/wallet/google/${cardId}`);
}

export function cardDisplay(card: LoyaltyCardWithCustomer) {
  const required = card.merchants.reward_required_points;
  return {
    progress: `${card.current_points} / ${required}`,
    isRewardAvailable: card.status === "reward_available",
    statusText: card.status === "reward_available" ? "Recompense disponible" : "Actif"
  };
}
