import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  revalidatePath: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  deletePost: vi.fn(),
  broadcastPost: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock("@/auth", () => ({
  auth: mocks.auth,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    post: {
      findUnique: mocks.findUnique,
      findFirst: mocks.findFirst,
      create: mocks.create,
      update: mocks.update,
      delete: mocks.deletePost,
    },
  },
}));

vi.mock("@/lib/newsletter", () => ({
  broadcastPost: mocks.broadcastPost,
}));

import {
  broadcastPostAction,
  createOrUpdatePostAction,
  deletePostAction,
} from "@/app/admin/blog/actions";

const basePayload = {
  title: "How to Register a Business in Nigeria",
  slug: "How to Register a Business in Nigeria!!!",
  excerpt: "A short excerpt",
  content: "<p>This is a complete post body with enough words.</p>",
  coverImage: "https://utfs.io/f/post-cover-image",
  published: true,
};

describe("admin blog actions", () => {
  beforeEach(() => {
    mocks.auth.mockReset();
    mocks.revalidatePath.mockReset();
    mocks.findUnique.mockReset();
    mocks.findFirst.mockReset();
    mocks.create.mockReset();
    mocks.update.mockReset();
    mocks.deletePost.mockReset();
    mocks.broadcastPost.mockReset();

    mocks.auth.mockResolvedValue({
      user: {
        id: "admin-1",
        role: "ADMIN",
      },
    });
  });

  it("rejects unauthorized requests", async () => {
    mocks.auth.mockResolvedValueOnce(null);

    await expect(createOrUpdatePostAction(basePayload)).rejects.toThrow("Unauthorized");
  });

  it("creates a post and normalizes slug + readTime", async () => {
    mocks.findUnique.mockResolvedValueOnce(null);
    mocks.create.mockResolvedValueOnce({
      id: "post-1",
      slug: "how-to-register-a-business-in-nigeria",
    });

    const result = await createOrUpdatePostAction(basePayload);

    expect(result).toEqual({ id: "post-1" });
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: "how-to-register-a-business-in-nigeria",
          readTime: expect.any(Number),
        }),
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/how-to-register-a-business-in-nigeria");
  });

  it("rejects duplicate slug on create", async () => {
    mocks.findUnique.mockResolvedValueOnce({ id: "existing" });

    await expect(createOrUpdatePostAction(basePayload)).rejects.toThrow(
      "A post with this slug already exists.",
    );
  });

  it("updates a post and revalidates both old and new slug paths", async () => {
    mocks.findUnique.mockResolvedValueOnce({
      id: "post-1",
      slug: "old-slug",
    });
    mocks.findFirst.mockResolvedValueOnce(null);
    mocks.update.mockResolvedValueOnce({
      id: "post-1",
      slug: "new-title",
    });

    const result = await createOrUpdatePostAction({
      ...basePayload,
      id: "post-1",
      slug: "new title",
    });

    expect(result).toEqual({ id: "post-1" });
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "post-1" },
        data: expect.objectContaining({ slug: "new-title" }),
      }),
    );
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/new-title");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/old-slug");
  });

  it("deletes post and revalidates affected paths", async () => {
    mocks.deletePost.mockResolvedValueOnce({ slug: "delete-me" });

    await deletePostAction("post-1");

    expect(mocks.deletePost).toHaveBeenCalledWith({
      where: { id: "post-1" },
      select: { slug: true },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/admin/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog");
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/blog/delete-me");
  });

  it("broadcasts an existing post", async () => {
    mocks.findUnique.mockResolvedValueOnce({
      id: "post-2",
      title: "Post",
      excerpt: "Excerpt",
      coverImage: null,
      slug: "post",
      published: true,
    });
    mocks.broadcastPost.mockResolvedValueOnce({ sent: 2 });

    const result = await broadcastPostAction("post-2");

    expect(result).toEqual({ sent: 2 });
    expect(mocks.broadcastPost).toHaveBeenCalledTimes(1);
  });
});
