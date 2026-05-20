import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceInvite } from "@/models";

const EditSchema = z.object({
  role: z.enum(["manager", "employee"]).optional(),
  expiresHours: z.number().int().min(1).max(720).optional(),
});

function getInviteId(req: Request): string {
  return new URL(req.url).pathname.split("/").at(-1) ?? "";
}

// PUT /api/workspace/invites/[id] — edit role or expiry, regenerates token
export const PUT = withAuth(async (req, ctx) => {
  if (ctx.role === "employee") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const inviteId = getInviteId(req);
  const body = await req.json().catch(() => ({}));
  const parsed = EditSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const invite = await WorkspaceInvite.findOne({
    _id: inviteId,
    workspaceId: ctx.workspaceId,
    status: "pending",
  });
  if (!invite) return NextResponse.json({ error: "Invite not found or not pending" }, { status: 404 });

  // Regenerate token — old link is immediately invalidated
  invite.token = randomUUID();
  if (parsed.data.role) invite.role = parsed.data.role;
  if (parsed.data.expiresHours) {
    invite.expiresAt = new Date(Date.now() + parsed.data.expiresHours * 60 * 60 * 1000);
  }
  await invite.save();

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${invite.token}`;
  return NextResponse.json({ message: "Invite updated", inviteUrl, expiresAt: invite.expiresAt });
}, "manager");

// DELETE /api/workspace/invites/[id] — delete invite, token immediately invalidated
export const DELETE = withAuth(async (req, ctx) => {
  if (ctx.role === "employee") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const inviteId = getInviteId(req);

  const invite = await WorkspaceInvite.findOne({
    _id: inviteId,
    workspaceId: ctx.workspaceId,
    status: "pending",
  });
  if (!invite) return NextResponse.json({ error: "Invite not found or not pending" }, { status: 404 });

  invite.status = "expired";
  await invite.save();

  return NextResponse.json({ message: "Invite deleted" });
}, "manager");
