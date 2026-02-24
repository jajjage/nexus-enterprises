import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
  getToken: mocks.getToken,
}));

import { requireUploadAdmin } from "@/app/api/uploadthing/core";

describe("uploadthing admin auth", () => {
  beforeEach(() => {
    mocks.getToken.mockReset();
  });

  it("rejects unauthenticated uploads", async () => {
    mocks.getToken.mockResolvedValueOnce(null);

    await expect(requireUploadAdmin(new Request("http://localhost/api/uploadthing"))).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("rejects non-admin uploads", async () => {
    mocks.getToken.mockResolvedValueOnce({
      id: "user-1",
      role: "USER",
    });

    await expect(requireUploadAdmin(new Request("http://localhost/api/uploadthing"))).rejects.toThrow(
      "Unauthorized",
    );
  });

  it("accepts admin uploads and returns metadata", async () => {
    mocks.getToken.mockResolvedValueOnce({
      id: "admin-1",
      role: "ADMIN",
    });

    await expect(
      requireUploadAdmin(new Request("http://localhost/api/uploadthing")),
    ).resolves.toEqual({
      userId: "admin-1",
    });
  });
});
