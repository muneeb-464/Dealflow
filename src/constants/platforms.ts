export const PLATFORMS = [
  { value: "UPWORK", label: "Upwork" },
  { value: "FIVERR", label: "Fiverr" },
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "DIRECT", label: "Direct" },
  { value: "REFERRAL", label: "Referral" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "OTHER", label: "Other" },
] as const;

export type Platform = (typeof PLATFORMS)[number]["value"];

export const PLATFORM_COLORS: Record<Platform, { bg: string; color: string }> = {
  UPWORK: { bg: "rgba(74,222,128,0.12)", color: "#15803d" },
  FIVERR: { bg: "rgba(249,115,22,0.12)", color: "#c2410c" },
  LINKEDIN: { bg: "rgba(10,102,194,0.12)", color: "#0a66c2" },
  DIRECT: { bg: "rgba(10,42,34,0.10)", color: "#0A2A22" },
  REFERRAL: { bg: "rgba(20,184,166,0.12)", color: "#0d9488" },
  WHATSAPP: { bg: "rgba(37,211,102,0.12)", color: "#128c7e" },
  OTHER: { bg: "rgba(118,119,118,0.12)", color: "#767776" },
};
