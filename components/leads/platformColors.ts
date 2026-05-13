export const platformBadge: Record<string, string> = {
  LinkedIn:  "bg-blue-50 text-blue-600 border border-blue-100",
  Upwork:    "bg-secondary/10 text-secondary border border-secondary/20",
  Fiverr:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
  WhatsApp:  "bg-green-50 text-green-600 border border-green-100",
  Referral:  "bg-tertiary/10 text-tertiary border border-tertiary/20",
  Direct:    "bg-violet-50 text-violet-600 border border-violet-100",
  Other:     "bg-neutral/8 text-neutral border border-neutral/10",
};

export function getPlatformCls(platform: string): string {
  return platformBadge[platform] ?? platformBadge.Other;
}
