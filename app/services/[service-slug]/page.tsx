import { notFound } from "next/navigation";
import { createOrderAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrencyNaira } from "@/lib/format";
import { getServiceBySlug } from "@/lib/services";

export default async function ServiceCheckoutPage({
  params,
}: {
  params: Promise<{ "service-slug": string }>;
}) {
  const { "service-slug": serviceSlug } = await params;
  const service = getServiceBySlug(serviceSlug);

  if (!service) {
    notFound();
  }

  return (
    <main className="section-space bg-slate-50">
      <div className="site-container grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <section>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-secondary)]">
            Service Checkout
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--color-primary)] sm:text-4xl">
            {service.title}
          </h1>
          <p className="mt-4 max-w-2xl text-slate-600">{service.description}</p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-slate-800">What happens next?</h2>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. Your order is created with a private tracking token.</li>
              <li>2. You are redirected to your live tracking page.</li>
              <li>3. Payment processing (Paystack/Flutterwave) is being finalized.</li>
            </ol>
          </div>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
            <p className="mt-2 text-sm text-slate-600">Package: {formatCurrencyNaira(service.amountKobo)}</p>
          </CardHeader>
          <CardContent>
            <form action={createOrderAction} className="space-y-4">
              <input type="hidden" name="serviceSlug" value={service.slug} />

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required placeholder="john@company.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" required placeholder="+2348012345678" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name (Optional)</Label>
                <Input id="companyName" name="companyName" placeholder="Nexus Global Ltd" />
              </div>

              <Button type="submit" className="mt-2 w-full" variant="secondary">
                Pay &amp; Start
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
