import { setClientSession } from "@/app/actions/track-session";

export default async function TrackTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  // Create the session and redirect to /track.
  // setClientSession handles validation and redirects on invalid IDs.
  await setClientSession(token);
}
