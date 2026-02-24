import { getToken } from "next-auth/jwt";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

type UploadAuthMetadata = { userId: string };

export async function requireUploadAdmin(req: Request): Promise<UploadAuthMetadata> {
  const secret =
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    process.env.ADMIN_SESSION_SECRET?.trim();

  let token: { role?: string; id?: string; sub?: string } | null = null;
  try {
    token = (await getToken({
      req: req as Parameters<typeof getToken>[0]["req"],
      secret,
    })) as { role?: string; id?: string; sub?: string } | null;
  } catch (error) {
    console.error("[uploadthing] Failed to read auth token", error);
    throw new UploadThingError("Unauthorized");
  }

  const role = token?.role;
  const userId = token?.id ?? token?.sub ?? null;

  if (!token || role !== "ADMIN" || !userId) {
    throw new UploadThingError("Unauthorized");
  }

  return { userId };
}

function resolveUploadUrl(file: { url: string; ufsUrl?: string }) {
  return file.ufsUrl ?? file.url;
}

export const ourFileRouter = {
  coverImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => requireUploadAdmin(req))
    .onUploadComplete(async ({ metadata, file }) => ({
      url: resolveUploadUrl(file),
      uploadedBy: metadata.userId,
    })),
  editorImage: f({
    image: {
      maxFileSize: "8MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => requireUploadAdmin(req))
    .onUploadComplete(async ({ metadata, file }) => ({
      url: resolveUploadUrl(file),
      uploadedBy: metadata.userId,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
