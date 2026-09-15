export type ClientStatus = "active" | "inactive" | "churned";
export type ClientPlatform = "UPWORK" | "FIVERR" | "LINKEDIN" | "DIRECT" | "REFERRAL" | "WHATSAPP" | "COLD_EMAIL" | "OTHER";
export type ClientCurrency = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "CAD" | "AUD";
export type ClientBillingType = "one_time" | "recurring";

export const BILLING_TYPES: { value: ClientBillingType; label: string }[] = [
  { value: "one_time", label: "One-time" },
  { value: "recurring", label: "Recurring" },
];

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  platform: ClientPlatform;
  status: ClientStatus;
  billingType: ClientBillingType;
  totalRevenue: number;
  currency: ClientCurrency;
  projectsCount: number;
  notes?: string;
  assignedTo?: string;
  createdBy?: string;
  createdByName?: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  platform: ClientPlatform;
  status: ClientStatus;
  billingType: ClientBillingType;
  totalRevenue?: number;
  currency: ClientCurrency;
  notes?: string;
  assignedTo?: string;
}
