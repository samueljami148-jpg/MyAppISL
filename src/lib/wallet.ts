import { readFile } from "fs/promises";
import { appUrl } from "@/lib/utils";
import { formatCustomerName, qrPayload } from "@/lib/loyalty";
import type { LoyaltyCardWithCustomer } from "@/types/database";

function hasAppleCredentials() {
  return Boolean(
    process.env.APPLE_PASS_TYPE_IDENTIFIER &&
      process.env.APPLE_TEAM_IDENTIFIER &&
      process.env.APPLE_WWDR_CERT_PATH &&
      process.env.APPLE_SIGNER_CERT_PATH &&
      process.env.APPLE_SIGNER_KEY_PATH
  );
}

export async function buildApplePass(card: LoyaltyCardWithCustomer) {
  if (!hasAppleCredentials()) {
    return {
      buffer: Buffer.from(
        JSON.stringify(
          {
            message: "Apple Wallet credentials are not configured.",
            cardId: card.id,
            merchant: card.merchants.name,
            points: `${card.current_points} / ${card.merchants.reward_required_points}`,
            qr: qrPayload(card.id)
          },
          null,
          2
        )
      ),
      contentType: "application/json",
      filename: `${card.merchants.name.replace(/\s+/g, "-")}.json`
    };
  }

  const { PKPass } = await import("passkit-generator");
  const [wwdr, signerCert, signerKey] = await Promise.all([
    readFile(process.env.APPLE_WWDR_CERT_PATH!),
    readFile(process.env.APPLE_SIGNER_CERT_PATH!),
    readFile(process.env.APPLE_SIGNER_KEY_PATH!)
  ]);

  const pass = new PKPass(
    {},
    {
      wwdr,
      signerCert,
      signerKey,
      signerKeyPassphrase: process.env.APPLE_SIGNER_KEY_PASSPHRASE
    },
    {
      serialNumber: card.wallet_serial_number,
      passTypeIdentifier: process.env.APPLE_PASS_TYPE_IDENTIFIER!,
      teamIdentifier: process.env.APPLE_TEAM_IDENTIFIER!,
      organizationName: process.env.APPLE_ORGANIZATION_NAME || "LoyalPass",
      description: card.merchants.reward_name,
      foregroundColor: "rgb(0,0,0)",
      backgroundColor: hexToRgb(card.merchants.primary_color),
      labelColor: hexToRgb(card.merchants.card_text_color || "#111111"),
      logoText: card.merchants.name,
      formatVersion: 1
    }
  );

  pass.type = "storeCard";
  pass.primaryFields.push({
    key: "points",
    label: "POINTS",
    value: `${card.current_points} / ${card.merchants.reward_required_points}`
  });
  pass.secondaryFields.push({
    key: "reward",
    label: "RECOMPENSE",
    value: card.status === "reward_available" ? `🎁 ${card.merchants.reward_name}` : card.merchants.reward_name
  });
  pass.auxiliaryFields.push({
    key: "customer",
    label: "CLIENT",
    value: formatCustomerName(card.customers)
  });
  await addPassImage(pass, "logo.png", card.merchants.card_logo_url || card.merchants.logo_url);
  await addPassImage(pass, "strip.png", card.merchants.card_strip_url);
  await addPassImage(pass, "thumbnail.png", card.merchants.card_thumbnail_url);
  pass.setBarcodes({
    message: qrPayload(card.id),
    format: "PKBarcodeFormatQR",
    messageEncoding: "iso-8859-1"
  });
  pass.setRelevantDate(new Date(card.updated_at));
  const passWithService = pass as typeof pass & {
    webServiceURL?: string;
    authenticationToken?: string;
  };
  passWithService.webServiceURL = appUrl("/api/wallet/apple");
  passWithService.authenticationToken = card.id;

  return {
    buffer: pass.getAsBuffer(),
    contentType: "application/vnd.apple.pkpass",
    filename: `${card.merchants.name.replace(/\s+/g, "-")}.pkpass`
  };
}

export async function buildGoogleWalletLink(card: LoyaltyCardWithCustomer) {
  const issuer = process.env.GOOGLE_WALLET_ISSUER_ID;
  if (!issuer) {
    return appUrl(`/m/${card.merchant_id}/success/${card.id}?wallet=google-missing-credentials`);
  }

  const objectId = `${issuer}.${card.id.replace(/-/g, "_")}`;
  const payload = {
    iss: process.env.GOOGLE_CLIENT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    payload: {
      genericObjects: [
        {
          id: objectId,
          classId: `${issuer}.${process.env.GOOGLE_WALLET_CLASS_SUFFIX || "loyalpass"}`,
          genericType: "GENERIC_TYPE_LOYALTY_CARD",
          cardTitle: { defaultValue: { language: "fr", value: card.merchants.name } },
          header: { defaultValue: { language: "fr", value: `${formatCustomerName(card.customers)} - ${card.current_points} / ${card.merchants.reward_required_points} points` } },
          subheader: { defaultValue: { language: "fr", value: card.merchants.reward_name } },
          logo: card.merchants.card_logo_url || card.merchants.logo_url ? {
            sourceUri: { uri: card.merchants.card_logo_url || card.merchants.logo_url }
          } : undefined,
          heroImage: card.merchants.card_background_url || card.merchants.card_image_url ? {
            sourceUri: { uri: card.merchants.card_background_url || card.merchants.card_image_url }
          } : undefined,
          barcode: {
            type: "QR_CODE",
            value: qrPayload(card.id)
          },
          hexBackgroundColor: card.merchants.primary_color
        }
      ]
    }
  };

  return `https://pay.google.com/gp/v/save/${Buffer.from(JSON.stringify(payload)).toString("base64url")}`;
}

async function addPassImage(pass: unknown, filename: string, url: string | null | undefined) {
  if (!url || url.startsWith("data:")) return;
  try {
    const response = await fetch(url);
    if (!response.ok) return;
    const buffer = Buffer.from(await response.arrayBuffer());
    const target = pass as { addBuffer?: (name: string, data: Buffer) => void };
    target.addBuffer?.(filename, buffer);
  } catch {
    // Missing design assets should not block card generation.
  }
}

export async function updateWallets(card: LoyaltyCardWithCustomer) {
  const messages: string[] = [];
  if (!hasAppleCredentials()) messages.push("Apple credentials missing: pass update skipped.");
  if (!process.env.GOOGLE_WALLET_ISSUER_ID) messages.push("Google credentials missing: pass update skipped.");

  return {
    ok: true,
    skipped: messages,
    cardId: card.id
  };
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const bigint = Number.parseInt(normalized.length === 3 ? normalized.split("").map((c) => c + c).join("") : normalized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgb(${r},${g},${b})`;
}
