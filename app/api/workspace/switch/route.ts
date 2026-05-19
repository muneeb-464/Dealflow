import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceMember } from "@/models";
import mongoose from "mongoose";

// POST /api/workspace/switch — change active workspace
export const POST = withAuth(async (req, ctx) => {
  const { workspaceId } = await req.json();
  if (!workspaceId) return NextResponse.json({ error: "workspaceId required" }, { status: 400 });

  // Verify user is member of target workspace
  const membership = await WorkspaceMember.findOne({
    userId: ctx.user._id,
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
  });
  if (!membership) return NextResponse.json({ error: "Not a member of that workspace" }, { status: 403 });

  ctx.user.activeWorkspaceId = new mongoose.Types.ObjectId(workspaceId);
  await ctx.user.save();

  return NextResponse.json({ success: true, workspaceId });
});
