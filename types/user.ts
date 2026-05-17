export type UserRole = "owner" | "manager" | "employee";

export interface WorkspaceMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: "active" | "pending";
  joinedAt: string;
}

export interface InviteMemberDto {
  name: string;
  email: string;
  role: Exclude<UserRole, "owner">;
}
