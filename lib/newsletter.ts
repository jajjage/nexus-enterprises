import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { welcomeEmail, postBroadcastEmail } from "@/lib/email-templates";

const resendApiKey = process.env.RESEND_API_KEY;
const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export async function subscribe(email: string) {
  const normalized = email.trim().toLowerCase();
  const subscriber = await prisma.subscriber.upsert({
    where: { email: normalized },
    update: { isActive: true },
    create: { email: normalized },
  });

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const { subject, html } = welcomeEmail();
    await resend.emails.send({
      from: "Nexus <noreply@nexus.test>",
      to: normalized,
      subject,
      html,
      text: "Thanks for subscribing to Nexus Enterprises updates.",
    });
  }

  return subscriber;
}

export async function broadcastPost(post: { id: string; title: string; excerpt: string | null; coverImage: string | null; slug: string; published: boolean }) {
  if (!post.published) throw new Error("Cannot broadcast unpublished post");
  if (!resendApiKey) return { sent: false, reason: "RESEND_API_KEY missing" };

  const subscribers = await prisma.subscriber.findMany({ where: { isActive: true } });
  if (!subscribers.length) return { sent: false, reason: "No subscribers" };

  const resend = new Resend(resendApiKey);
  const [primaryRecipient, ...bccRecipients] = subscribers.map((s) => s.email);
  const url = `${siteUrl}/blog/${post.slug}`;
  const { subject, html } = postBroadcastEmail({
    title: post.title,
    excerpt: post.excerpt,
    url,
    coverImage: post.coverImage,
  });

  await resend.emails.send({
    from: "Nexus <updates@nexus.test>",
    to: primaryRecipient,
    bcc: bccRecipients.length ? bccRecipients : undefined,
    subject,
    html,
    text: `${post.title}\n\n${post.excerpt ?? "Read the latest update."}\n\n${url}`,
  });

  return { sent: true, count: subscribers.length };
}
