import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import User from "@/models/User";
import WorkspaceMember from "@/models/WorkspaceMember";
import type { MemberRole } from "@/models/WorkspaceMember";
import type { IUser } from "@/models/User";
import mongoose from "mongoose";

export interface AuthContext {
  clerkId: string;
  user: IUser;
  workspaceId: mongoose.Types.ObjectId;
  role: MemberRole;
}

type RouteHandler = (req: Request, ctx: AuthContext) => Promise<NextResponse>;

/**
 * Wraps an API route handler with auth + workspace membership check.
 * Usage: export const GET = withAuth(async (req, ctx) => { ... });
 * Optional: withAuth(handler, "manager") — requires minimum role
 */
export function withAuth(handler: RouteHandler, requiredRole?: MemberRole) {
  return async (req: Request): Promise<NextResponse> => {
    try {
      const { userId } = await auth();
      if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      await connectDB();

      const user = await User.findOne({ clerkId: userId });
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (!user.activeWorkspaceId) {
        return NextResponse.json({ error: "No workspace selected" }, { status: 400 });
      }

      const membership = await WorkspaceMember.findOne({
        userId: user._id,
        workspaceId: user.activeWorkspaceId,
      });

      if (!membership) {
        return NextResponse.json({ error: "Not a workspace member" }, { status: 403 });
      }

      // Role hierarchy check
      if (requiredRole) {
        const hierarchy: Record<MemberRole, number> = { owner: 3, manager: 2, employee: 1 };
        if (hierarchy[membership.role] < hierarchy[requiredRole]) {
          return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
        }
      }

      const ctx: AuthContext = {
        clerkId: userId,
        user,
        workspaceId: user.activeWorkspaceId,
        role: membership.role,
      };

      return await handler(req, ctx);
    } catch (err) {
      console.error("[withAuth]", err);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}
