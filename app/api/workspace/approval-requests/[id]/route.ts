import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/withAuth";
import { ApprovalRequest } from "@/models";

const ReviewSchema = z.object({
  decision: z.enum(["approved", "rejected"]),
  reviewNote: z.string().max(500).optional(),
});

function getRequestId(req: Request): string {
  return new URL(req.url).pathname.split("/").at(-1) ?? "";
}

// PUT /api/workspace/approval-requests/[id] — owner approves or rejects
export const PUT = withAuth(async (req, ctx) => {
  if (ctx.role !== "owner") {
    return NextResponse.json({ error: "Only owners can review approval requests" }, { status: 403 });
  }

  const requestId = getRequestId(req);
  const body = await req.json();
  const parsed = ReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const request = await ApprovalRequest.findOne({
    _id: requestId,
    workspaceId: ctx.workspaceId,
    status: "pending",
  });
  if (!request) return NextResponse.json({ error: "Request not found or already reviewed" }, { status: 404 });

  request.status = parsed.data.decision;
  request.reviewedBy = ctx.user._id;
  request.reviewNote = parsed.data.reviewNote;
  request.reviewedAt = new Date();
  await request.save();

  return NextResponse.json({ message: `Request ${parsed.data.decision}` });
});
