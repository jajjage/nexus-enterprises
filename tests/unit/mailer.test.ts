import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  resendCtor: vi.fn(),
}));

vi.mock("resend", () => ({
  Resend: vi.fn((...args: unknown[]) => {
    mocks.resendCtor(...args);
    return {
      emails: {
        send: mocks.send,
      },
    };
  }),
}));

const originalEnv = process.env;

describe("mailer best-effort wrapper", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.send.mockReset();
    mocks.resendCtor.mockReset();
    process.env = { ...originalEnv };
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_REPLY_TO;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("sends using configured sender and reply-to", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "Nexus <noreply@example.com>";
    process.env.RESEND_REPLY_TO = "support@example.com";
    mocks.send.mockResolvedValueOnce({
      data: { id: "msg-1" },
      error: null,
    });

    const { sendEmailBestEffort } = await import("@/lib/mailer");
    const result = await sendEmailBestEffort(
      {
        to: "user@example.com",
        subject: "Subject",
        html: "<p>Hello</p>",
        text: "Hello",
      },
      { event: "unit_test", recipient: "user@example.com" },
    );

    expect(result).toEqual({ sent: true, id: "msg-1" });
    expect(mocks.send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Nexus <noreply@example.com>",
        reply_to: "support@example.com",
        to: "user@example.com",
        subject: "Subject",
      }),
    );
  });

  it("skips send when API key is missing", async () => {
    process.env.RESEND_FROM_EMAIL = "Nexus <noreply@example.com>";

    const { sendEmailBestEffort } = await import("@/lib/mailer");
    const result = await sendEmailBestEffort(
      {
        to: "user@example.com",
        subject: "Subject",
        html: "<p>Hello</p>",
      },
      { event: "unit_test", recipient: "user@example.com" },
    );

    expect(result).toEqual({ sent: false, reason: "RESEND_API_KEY missing" });
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("returns failed result when provider returns an error payload", async () => {
    process.env.RESEND_API_KEY = "re_test_key";
    process.env.RESEND_FROM_EMAIL = "Nexus <noreply@example.com>";
    mocks.send.mockResolvedValueOnce({
      data: null,
      error: { message: "rate limited" },
    });

    const { sendEmailBestEffort } = await import("@/lib/mailer");
    const result = await sendEmailBestEffort(
      {
        to: "user@example.com",
        subject: "Subject",
        html: "<p>Hello</p>",
      },
      { event: "unit_test", recipient: "user@example.com" },
    );

    expect(result).toEqual({ sent: false, reason: "rate limited" });
  });
});
