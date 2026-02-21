import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PaymentRetry } from "@/components/checkout/payment-retry";
import { formatDateTime, firstNameOnly, maskEmail, maskPhone } from "@/lib/format";
import { ORDER_STATUS_BADGE_CLASS, ORDER_STATUS_LABELS, type OrderStatusValue } from "@/lib/order-status";
import { prisma } from "@/lib/prisma";
import { PAYSTACK_PUBLIC_KEY } from "@/lib/paystack";
import * as jose from "jose";

export const dynamic = "force-dynamic";

type TrackerLog = {
  id: string;
  status: OrderStatusValue;
  note: string;
  createdAt: Date;
};

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ||
    "fallback-secret-change-in-production-do-not-use",
);

async function verifyClientSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("client_session")?.value;

    if (!token) {
      return null;
    }

    const verified = await jose.jwtVerify(token, JWT_SECRET);
    return verified.payload as { orderId: string; trackingToken: string };
  } catch (error) {
    console.error("[verifyClientSession] JWT verification failed:", error);
    return null;
  }
}

export default async function TrackOrderPage() {
  // Verify the client session
  const session = await verifyClientSession();

  if (!session) {
    redirect("/track/login");
  }

  // Fetch the order using the orderId from the verified session
  const order = await prisma.order.findUnique({
    where: { id: session.orderId },
    include: {
      logs: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    redirect("/track/login?error=invalid_token");
  }

  const currentStatus = order.status as OrderStatusValue;

  const adminPhone = process.env.WHATSAPP_ADMIN_PHONE?.replace(/\D/g, "") || "";
  const message = encodeURIComponent(
    `Hello, I am enquiring about Order #${order.orderNumber}. Please share an update.`,
  );
  const whatsappHref = adminPhone ? `https://wa.me/${adminPhone}?text=${message}` : null;

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container space-y-6">
        <Card className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Order ID</p>
              <h1 className="text-2xl font-semibold text-(--color-primary)">{order.orderNumber}</h1>
              <p className="mt-1 text-sm text-slate-600">
                {firstNameOnly(order.clientName)} | {maskEmail(order.clientEmail)} | {maskPhone(order.clientPhone)}
              </p>
            </div>
            <Badge className={ORDER_STATUS_BADGE_CLASS[currentStatus]}>
              {ORDER_STATUS_LABELS[currentStatus]}
            </Badge>
          </div>
        </Card>

        {currentStatus === "AWAITING_PAYMENT" && PAYSTACK_PUBLIC_KEY && (
          <PaymentRetry
            orderNumber={order.orderNumber}
            amount={order.amountKobo ?? 0}
            email={order.clientEmail}
            publicKey={PAYSTACK_PUBLIC_KEY}
          />
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-(--color-primary)">Progress Timeline</h2>
          <div className="mt-6 space-y-5">
            {(order.logs as TrackerLog[]).map((log) => {
              const logStatus = log.status;
              return (
                <div key={log.id} className="relative flex gap-4 pl-6">
                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-(--color-primary)" />
                  <div className="-ml-4.75 mt-4 h-12 w-px bg-slate-200 last:hidden" />
                  <div className="space-y-1">
                    <Badge className={ORDER_STATUS_BADGE_CLASS[logStatus]}>
                      {ORDER_STATUS_LABELS[logStatus]}
                    </Badge>
                    <p className="text-sm text-slate-600">{log.note}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {whatsappHref ? (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="inline-flex">
            <Button className="h-12 gap-2 bg-emerald-600 px-6 text-base hover:bg-emerald-700">
              <MessageCircle className="h-5 w-5" />
              Chat on WhatsApp
            </Button>
          </a>
        ) : (
          <p className="text-sm text-slate-600">
            WhatsApp support is temporarily unavailable. Please contact support via email.
          </p>
        )}
      </div>
    </main>
  );
}
