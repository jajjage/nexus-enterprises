export function formatDateTime(input: Date | string) {
  const date = input instanceof Date ? input : new Date(input);
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function firstNameOnly(fullName: string) {
  const [firstName] = fullName.trim().split(/\s+/);
  return firstName || "Client";
}

export function maskEmail(email: string) {
  const [name, domain = ""] = email.split("@");
  if (!name || !domain) return "hidden";

  if (name.length <= 2) {
    return `${name[0] ?? "*"}*@${domain}`;
  }

  return `${name.slice(0, 2)}${"*".repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

export function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return "hidden";

  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

export function formatCurrencyNaira(amountKobo?: number | null) {
  if (!amountKobo) return "Custom quote";

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountKobo / 100);
}
