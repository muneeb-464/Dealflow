import { Client, CreateClientDto } from "@/types/client";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

function authHeader(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getClients(workspaceId: string): Promise<Client[]> {
  const res = await fetch(`${BASE}/clients?workspaceId=${workspaceId}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch clients");
  return res.json();
}

export async function getClientById(id: string): Promise<Client> {
  const res = await fetch(`${BASE}/clients/${id}`, {
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to fetch client");
  return res.json();
}

export async function createClient(
  data: CreateClientDto & { workspaceId: string }
): Promise<Client> {
  const res = await fetch(`${BASE}/clients`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create client");
  return res.json();
}

export async function updateClient(
  id: string,
  data: Partial<CreateClientDto>
): Promise<Client> {
  const res = await fetch(`${BASE}/clients/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update client");
  return res.json();
}

export async function deleteClient(id: string): Promise<void> {
  const res = await fetch(`${BASE}/clients/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete client");
}
