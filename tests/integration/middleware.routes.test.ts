import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  jwtVerify: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({ getToken: mocks.getToken }));
vi.mock("jose", () => ({ jwtVerify: mocks.jwtVerify }));

import { middleware } from "../../middleware";

function buildRequest(path: string, cookieHeader?: string) {
  const headers: Record<string, string> = {};
  if (cookieHeader) {
    headers.cookie = cookieHeader;
  }

  return new NextRequest(`http://localhost:3000${path}`, { headers });
}

describe("middleware route protection", () => {
  beforeEach(() => {
    mocks.getToken.mockReset();
    mocks.jwtVerify.mockReset();

    mocks.getToken.mockResolvedValue(null);
    mocks.jwtVerify.mockResolvedValue({});
  });

  it("redirects /admin/* without admin session", async () => {
    const response = await middleware(buildRequest("/admin/orders"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/admin/login");
  });

  it("redirects /track without client_session cookie", async () => {
    const response = await middleware(buildRequest("/track"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost:3000/track/login");
  });

  it("always allows /track/login", async () => {
    const response = await middleware(buildRequest("/track/login"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("allows /track/{token} without existing cookie", async () => {
    const response = await middleware(buildRequest("/track/abc123token"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps public routes accessible", async () => {
    const response = await middleware(buildRequest("/blog"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
