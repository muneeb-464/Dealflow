import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { PageAccessGrant } from "@/models";

// PUT /api/workspace/page-access/[id] — owner approves or rejects
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Use withAuth inline
  return withAuth(async (innerReq, ctx) => {
    if (ctx.role !== "owner" && ctx.role !== "manager") {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { decision, reviewNote } = await innerReq.json();
    if (!["approved", "rejected"].includes(decision)) {
      return NextResponse.json({ error: "decision must be approved or rejected" }, { status: 400 });
    }

    const grant = await PageAccessGrant.findOneAndUpdate(
      { _id: id, workspaceId: ctx.workspaceId },
      { status: decision, reviewedBy: ctx.user._id, reviewNote: reviewNote ?? "", reviewedAt: new Date() },
      { new: true }
    );
    if (!grant) return NextResponse.json({ error: "Request not found" }, { status: 404 });

    return NextResponse.json({ grant });
  })(req);
}

// DELETE /api/workspace/page-access/[id] — owner revokes an approved grant
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return withAuth(async (innerReq, ctx) => {
    if (ctx.role !== "owner") {
      return NextResponse.json({ error: "Owner only" }, { status: 403 });
    }
    await PageAccessGrant.findOneAndDelete({ _id: id, workspaceId: ctx.workspaceId });
    return NextResponse.json({ message: "Grant revoked" });
  })(_req);
}
