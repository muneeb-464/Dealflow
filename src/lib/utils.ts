export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Rough fixed rates — there is no FX feed yet, so any "USD eq." number is an estimate.
const USD_RATE: Record<string, number> = { USD: 1, PKR: 1 / 280, EUR: 1.08, GBP: 1.27, AED: 0.27, CAD: 0.73, AUD: 0.66 };

export function toUSD(amount: number, currency: string): number {
  return Math.round(amount * (USD_RATE[currency] ?? 1));
}

export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
