import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { PageAccessGrant } from "@/models";
import type { GrantablePage } from "@/models/PageAccessGrant";

const GRANTABLE: GrantablePage[] = ["revenue", "analytics", "team", "settings"];

// POST /api/workspace/page-access — employee requests access to a page
export const POST = withAuth(async (req, ctx) => {
  const { page, note } = await req.json();
  if (!GRANTABLE.includes(page)) {
    return NextResponse.json({ error: "Invalid page" }, { status: 400 });
  }

  await PageAccessGrant.findOneAndUpdate(
    { workspaceId: ctx.workspaceId, userId: ctx.user._id, page },
    { $setOnInsert: { workspaceId: ctx.workspaceId, userId: ctx.user._id, page, status: "pending", requestNote: note ?? "" } },
    { upsert: true, new: true }
  );

  return NextResponse.json({ message: "Access request submitted" });
});

// GET /api/workspace/page-access — owner/manager: all requests; employee: own grants
export const GET = withAuth(async (_req, ctx) => {
  const isManagerOrAbove = ctx.role === "owner" || ctx.role === "manager";

  if (isManagerOrAbove) {
    const grants = await PageAccessGrant.find({ workspaceId: ctx.workspaceId })
      .populate("userId", "name email avatar")
      .populate("reviewedBy", "name")
      .lean();
    return NextResponse.json({ grants });
  }

  // Employee: own approved grants only
  const grants = await PageAccessGrant.find({
    workspaceId: ctx.workspaceId,
    userId: ctx.user._id,
  }).lean();
  return NextResponse.json({ grants });
});
