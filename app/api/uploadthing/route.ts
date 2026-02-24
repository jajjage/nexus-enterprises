import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

function resolveUploadThingToken() {
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (token) return token;

  if (process.env.UPLOADTHING_SECRET?.trim()) {
    console.error(
      "[uploadthing] UPLOADTHING_SECRET is no longer supported on v7. Set UPLOADTHING_TOKEN.",
    );
  }

  return undefined;
}

function resolveCallbackUrl() {
  const siteUrl = process.env.SITE_URL?.trim();
  if (!siteUrl) return undefined;
  return `${siteUrl.replace(/\/+$/, "")}/api/uploadthing`;
}

const uploadthingToken = resolveUploadThingToken();
const shouldUseDevMode = process.env.NODE_ENV !== "production";
const callbackUrl = shouldUseDevMode ? undefined : resolveCallbackUrl();

const uploadthingFetch: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);

  if (!response.ok && String(input).includes("api.uploadthing.com")) {
    const body = await response.clone().text();
    console.error("[uploadthing] upstream request failed", {
      url: String(input),
      status: response.status,
      body,
    });
  }

  return response;
};

export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
  config: {
    token: uploadthingToken,
    callbackUrl,
    isDev: shouldUseDevMode,
    fetch: uploadthingFetch,
    logLevel: process.env.NODE_ENV === "development" ? "Debug" : "Info",
  },
});
