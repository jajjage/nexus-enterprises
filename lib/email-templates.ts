export function welcomeEmail() {
  return {
    subject: "Welcome to Nexus Updates",
    html: `<p>Thanks for subscribing to Nexus Enterprises updates.</p>` ,
  };
}

export function postBroadcastEmail({
  title,
  excerpt,
  url,
  coverImage,
}: {
  title: string;
  excerpt?: string | null;
  url: string;
  coverImage?: string | null;
}) {
  return {
    subject: `New post: ${title}`,
    html: `
      <div>
        <h2>${title}</h2>
        ${coverImage ? `<p><img src="${coverImage}" alt="${title}" style="max-width:100%;height:auto" /></p>` : ""}
        <p>${excerpt ?? "Read the latest update."}</p>
        <p><a href="${url}">Read the full post</a></p>
      </div>
    `,
  };
}

export function paymentConfirmationEmail({
  customerName,
  orderNumber,
  serviceName,
  amount,
  trackingUrl,
}: {
  customerName: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingUrl: string;
}) {
  const formattedAmount = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount);

  return {
    subject: `Payment Confirmed - Order ${orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Payment Confirmed ✓</h2>
        
        <p>Hello ${customerName},</p>
        
        <p>Thank you for your payment! We've successfully received your payment for <strong>${serviceName}</strong>.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Order Number:</strong> ${orderNumber}</p>
          <p style="margin: 5px 0;"><strong>Service:</strong> ${serviceName}</p>
          <p style="margin: 5px 0;"><strong>Amount Paid:</strong> ${formattedAmount}</p>
        </div>
        
        <p>Your order is now being processed. You can track the progress of your order using the link below:</p>
        
        <p style="text-align: center; margin: 30px 0;">
          <a href="${trackingUrl}" style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Track Your Order
          </a>
        </p>
        
        <p>If you have any questions, please don't hesitate to reach out to us.</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;" />
        
        <p style="font-size: 12px; color: #666;">
          This is an automated message. Please do not reply to this email.
        </p>
      </div>
    `,
  };
}

// Server-side function to send payment confirmation email
export async function sendPaymentConfirmationEmail({
  customerName,
  customerEmail,
  orderNumber,
  serviceName,
  amount,
  trackingUrl,
}: {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  serviceName: string;
  amount: number;
  trackingUrl: string;
  trackingToken: string;
}): Promise<void> {
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailTemplate = paymentConfirmationEmail({
    customerName,
    orderNumber,
    serviceName,
    amount,
    trackingUrl,
  });

  await resend.emails.send({
    from: "notifications@nexus.ng",
    to: customerEmail,
    subject: emailTemplate.subject,
    html: emailTemplate.html,
  });
}
