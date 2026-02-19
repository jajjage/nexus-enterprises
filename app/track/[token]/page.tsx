import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { setClientSession } from "@/app/actions/track-session";

export default async function TrackTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // Validate that the token exists as a valid tracking token
  const order = await prisma.order.findUnique({
    where: { trackingToken: token },
    select: { id: true, trackingToken: true },
  });

  if (!order) {
    notFound();
  }

  // Create the session and redirect to /track
  // This will call setClientSession which will set the cookie and redirect
  await setClientSession(token);
}
