import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const setCookie = vi.fn();
  return {
    setCookie,
    cookies: vi.fn(async () => ({ set: setCookie })),
    redirect: vi.fn((url: string) => {
      throw new Error(`NEXT_REDIRECT:${url}`);
    }),
    findFirst: vi.fn(),
  };
});

vi.mock("next/headers", () => ({ cookies: mocks.cookies }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("jose", () => ({
  SignJWT: class {
    setProtectedHeader() {
      return this;
    }

    async sign() {
      return "signed-jwt-token";
    }
  },
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    order: {
      findFirst: mocks.findFirst,
    },
  },
}));

import { setClientSession } from "@/app/actions/track-session";

describe("tracking input normalization", () => {
  beforeEach(() => {
    mocks.setCookie.mockReset();
    mocks.cookies.mockClear();
    mocks.redirect.mockClear();
    mocks.findFirst.mockReset();

    mocks.findFirst.mockResolvedValue({
      id: "order-id",
      trackingToken: "abc123tracking",
    });
  });

  it("accepts raw tracking token", async () => {
    await expect(setClientSession("abc123tracking")).rejects.toThrow("NEXT_REDIRECT:/track");

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              trackingToken: expect.objectContaining({
                equals: "abc123tracking",
              }),
            }),
          ]),
        }),
      }),
    );
  });

  it("accepts order number", async () => {
    await expect(setClientSession("NEX-20260222-0009")).rejects.toThrow("NEXT_REDIRECT:/track");

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              orderNumber: expect.objectContaining({
                equals: "NEX-20260222-0009",
              }),
            }),
          ]),
        }),
      }),
    );
  });

  it("accepts pasted /track/{token} URL and normalizes it", async () => {
    await expect(
      setClientSession("https://nexus.example.com/track/AbCdToken123?source=email"),
    ).rejects.toThrow("NEXT_REDIRECT:/track");

    expect(mocks.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              trackingToken: expect.objectContaining({
                equals: "AbCdToken123",
              }),
            }),
          ]),
        }),
      }),
    );
  });

  it("rejects empty or invalid normalized values", async () => {
    await expect(setClientSession("   ")).rejects.toThrow("NEXT_REDIRECT:/track/login?error=invalid_token");
    expect(mocks.findFirst).not.toHaveBeenCalled();
  });
});
