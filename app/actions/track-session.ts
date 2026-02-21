"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "fallback-secret-change-in-production-do-not-use",
);

function normalizeTrackingInput(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";

  // Accept pasted full tracking links and extract the last /track/{id} segment.
  const trackMarker = "/track/";
  const markerIndex = trimmed.lastIndexOf(trackMarker);
  if (markerIndex !== -1) {
    const value = trimmed.slice(markerIndex + trackMarker.length);
    return value.split(/[?#]/)[0]?.trim() ?? "";
  }

  return trimmed;
}

export async function setClientSession(token: string) {
  try {
    const normalizedInput = normalizeTrackingInput(token);

    if (!normalizedInput) {
      redirect("/track/login?error=invalid_token");
    }

    // Accept either tracking token or order number.
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          {
            trackingToken: {
              equals: normalizedInput,
              mode: "insensitive",
            },
          },
          {
            orderNumber: {
              equals: normalizedInput,
              mode: "insensitive",
            },
          },
        ],
      },
      select: { id: true, trackingToken: true },
    });

    if (!order) {
      redirect("/track/login?error=invalid_token");
    }

    // Create JWT payload
    const payload = {
      orderId: order.id,
      trackingToken: order.trackingToken,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    };

    // Sign the JWT
    const jwtToken = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .sign(JWT_SECRET);

    // Set the secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: "client_session",
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    redirect("/track");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[setClientSession] Error:", error);
    redirect("/track/login?error=server_error");
  }
}
