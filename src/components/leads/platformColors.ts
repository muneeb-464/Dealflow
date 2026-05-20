export const platformBadge: Record<string, string> = {
  upwork:    "bg-green-100 text-green-800 border border-green-300",
  fiverr:    "bg-emerald-100 text-emerald-800 border border-emerald-300",
  linkedin:  "bg-blue-100 text-blue-800 border border-blue-300",
  whatsapp:  "bg-teal-100 text-teal-800 border border-teal-300",
  referral:  "bg-orange-100 text-orange-700 border border-orange-300",
  direct:    "bg-violet-100 text-violet-800 border border-violet-300",
  other:     "bg-gray-100 text-gray-600 border border-gray-300",
};

export function getPlatformCls(platform: string): string {
  return platformBadge[platform.toLowerCase()] ?? platformBadge.other;
}
