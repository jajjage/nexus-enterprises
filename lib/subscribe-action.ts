"use server";

import { subscribe } from "@/lib/newsletter";

export async function subscribeToNewsletterAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  if (!email) return;
  await subscribe(email);
}
