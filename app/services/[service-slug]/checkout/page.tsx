import { notFound } from "next/navigation";
import { PaystackCheckout } from "@/components/checkout/paystack-checkout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyNaira } from "@/lib/format";
import { getCheckoutServiceBySlug } from "@/lib/services";

export default async function ServiceCheckoutPage({
  params,
}: {
  params: Promise<{ "service-slug": string }>;
}) {
  const { "service-slug": serviceSlug } = await params;
  const service = await getCheckoutServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-secondary)">
            Service Checkout
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-(--color-primary) sm:text-4xl">
            {service.title}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">{service.description}</p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">What happens next?</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. Enter your details and complete payment on this form.</li>
              <li>2. Your order is created and you receive a tracking link.</li>
              <li>3. Track your service delivery in real-time on the tracking page.</li>
            </ol>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <p className="mt-2 text-sm text-slate-600">
              Amount: {formatCurrencyNaira(service.amountKobo)}
            </p>
          </CardHeader>
          <CardContent>
            <PaystackCheckout
              serviceSlug={service.slug}
              serviceName={service.title}
              servicePrice={service.amountKobo / 100}
            />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

