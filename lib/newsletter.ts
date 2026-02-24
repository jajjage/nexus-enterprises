import { prisma } from "@/lib/prisma";
import {
  postBroadcastEmail,
  sendNewsletterWelcomeEmail,
} from "@/lib/email-templates";
import { sendEmailBestEffort } from "@/lib/mailer";
import { getSiteUrl } from "@/lib/urls";

export async function subscribe(email: string) {
  const normalized = email.trim().toLowerCase();
  const subscriber = await prisma.subscriber.upsert({
    where: { email: normalized },
    update: { isActive: true },
    create: { email: normalized },
  });

  await sendNewsletterWelcomeEmail(normalized);

  return subscriber;
}

export async function broadcastPost(post: { id: string; title: string; excerpt: string | null; coverImage: string | null; slug: string; published: boolean }) {
  if (!post.published) throw new Error("Cannot broadcast unpublished post");

  const subscribers = await prisma.subscriber.findMany({ where: { isActive: true } });
  if (!subscribers.length) return { sent: false, reason: "No subscribers" };

  const [primaryRecipient, ...bccRecipients] = subscribers.map((s) => s.email);
  const url = `${getSiteUrl()}/blog/${post.slug}`;
  const template = postBroadcastEmail({
    title: post.title,
    excerpt: post.excerpt,
    url,
    coverImage: post.coverImage,
  });

  const result = await sendEmailBestEffort(
    {
      to: primaryRecipient,
      bcc: bccRecipients.length ? bccRecipients : undefined,
      subject: template.subject,
      html: template.html,
      text: template.text,
    },
    { event: "blog_broadcast", recipient: primaryRecipient },
  );

  if (!result.sent) {
    return { sent: false, reason: result.reason };
  }

  return { sent: true, count: subscribers.length };
}
