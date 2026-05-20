export type UserRole = "owner" | "manager" | "employee" | "invite_guest";

export type InviteTokenStatus = "pending" | "active" | "expired" | "removed";

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: UserRole;
  status: "active" | "pending" | "removed";
  joinedAt: string;
  leadCount?: number;
  clientCount?: number;
}

export interface PendingInvite {
  _id: string;
  email: string;
  role: string;
  expiresAt: string;
  status: InviteTokenStatus;
  token?: string;
}

export interface InviteMemberDto {
  name: string;
  email: string;
  role: Exclude<UserRole, "owner" | "invite_guest">;
}
