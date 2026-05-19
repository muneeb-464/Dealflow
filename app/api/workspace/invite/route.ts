import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { withAuth } from "@/lib/withAuth";
import { WorkspaceInvite, Workspace, User } from "@/models";
import { inviteEmailHtml } from "@/lib/emails/inviteEmail";

const resend = new Resend(process.env.RESEND_API_KEY!);

const InviteSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  role: z.enum(["manager", "employee"]),
});

export const POST = withAuth(async (req, ctx) => {
  // Only owner or manager can invite
  if (ctx.role === "employee") {
    return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = InviteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, role } = parsed.data;

  // Block inviting owner role
  if (role === "owner" as string) {
    return NextResponse.json({ error: "Cannot invite as owner" }, { status: 400 });
  }

  // Check no pending invite already exists
  const existing = await WorkspaceInvite.findOne({
    workspaceId: ctx.workspaceId,
    email,
    status: "pending",
  });
  if (existing) {
    return NextResponse.json({ error: "Pending invite already exists for this email" }, { status: 409 });
  }

  const workspace = await Workspace.findById(ctx.workspaceId);
  if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

  await WorkspaceInvite.create({
    workspaceId: ctx.workspaceId,
    invitedBy: ctx.user._id,
    email,
    role,
    token,
    expiresAt,
  });

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
  const inviterName = ctx.user.name;

  let emailDelivered = true;
  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: `You're invited to join ${workspace.name} on Dealflow`,
      html: inviteEmailHtml({ workspaceName: workspace.name, inviterName, role, inviteUrl }),
    });
  } catch (emailErr) {
    console.warn("[invite] Email send failed — invite still created:", emailErr);
    emailDelivered = false;
  }

  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json({
    message: emailDelivered ? "Invite sent" : "Invite created (email delivery failed)",
    expiresAt,
    ...(isDev && { inviteUrl }),
  });
}, "manager");
