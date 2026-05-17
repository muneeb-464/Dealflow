export type ClientStatus = "active" | "inactive" | "churned";
export type ClientPlatform = "UPWORK" | "FIVERR" | "LINKEDIN" | "DIRECT" | "REFERRAL" | "WHATSAPP" | "OTHER";
export type ClientCurrency = "PKR" | "USD" | "EUR" | "GBP" | "AED" | "CAD" | "AUD";

export interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  platform: ClientPlatform;
  status: ClientStatus;
  totalRevenue: number;
  currency: ClientCurrency;
  projectsCount: number;
  notes?: string;
  assignedTo?: string;
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
  totalRevenue?: number;
  currency: ClientCurrency;
  notes?: string;
  assignedTo?: string;
}
