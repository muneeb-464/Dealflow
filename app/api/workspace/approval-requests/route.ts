import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/withAuth";
import { ApprovalRequest } from "@/models";

const CreateSchema = z.object({
  type: z.enum(["delete_lead", "bulk_update_leads", "delete_client"]),
  targetId: z.string().optional(),
  targetLabel: z.string().optional(),
  note: z.string().max(500).optional(),
});

// POST — manager creates an approval request
export const POST = withAuth(async (req, ctx) => {
  if (ctx.role !== "manager") {
    return NextResponse.json({ error: "Only managers can submit approval requests" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const request = await ApprovalRequest.create({
    workspaceId: ctx.workspaceId,
    requestedBy: ctx.user._id,
    ...parsed.data,
  });

  return NextResponse.json({ message: "Approval request created", requestId: request._id }, { status: 201 });
});

// GET — owner lists all pending requests
export const GET = withAuth(async (_req, ctx) => {
  if (ctx.role !== "owner") {
    return NextResponse.json({ error: "Only owners can view approval requests" }, { status: 403 });
  }

  const requests = await ApprovalRequest.find({
    workspaceId: ctx.workspaceId,
    status: "pending",
  })
    .populate("requestedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return NextResponse.json({ requests });
});
