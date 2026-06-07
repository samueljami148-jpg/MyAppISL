import { headers } from "next/headers";

export async function getRequestOrigin() {
  const headerStore = await headers();
  const forwardedHost = headerStore.get("x-forwarded-host");
  const host = forwardedHost || headerStore.get("host") || "localhost:3001";
  const forwardedProto = headerStore.get("x-forwarded-proto");
  const proto = forwardedProto || (host.includes("localhost") || host.startsWith("127.") || host.startsWith("192.") ? "http" : "https");
  return `${proto}://${host}`;
}

export function merchantSignupPath(merchantId: string) {
  return `/m/${merchantId}`;
}

export function merchantSignupUrl(origin: string, merchantId: string) {
  return `${origin.replace(/\/$/, "")}${merchantSignupPath(merchantId)}`;
}
