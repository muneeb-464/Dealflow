import { User, WorkspaceMember } from "@/models";

/**
 * Auth context for dynamic `[id]` routes, which can't use `withAuth` because it drops Next's
 * `{ params }` argument. Returns null when the user has no active workspace or was removed from it.
 * Caller must `await connectDB()` first.
 */
export async function getRouteAuthContext(clerkId: string) {
  const user = await User.findOne({ clerkId }).select("_id activeWorkspaceId").lean();
  if (!user?.activeWorkspaceId) return null;
  const member = await WorkspaceMember.findOne({
    workspaceId: user.activeWorkspaceId,
    userId: user._id,
  }).select("role").lean();
  if (!member) return null;
  return { userId: user._id, workspaceId: user.activeWorkspaceId, role: member.role };
}
