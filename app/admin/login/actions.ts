"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "").trim();

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return redirect("/admin/login?error=invalid_credentials");
    }
    return redirect("/admin/login?error=server_error");
  }

  redirect("/admin/orders");
}

export async function logoutAction() {
  await signOut({ redirect: false });
  redirect("/admin/login");
}
