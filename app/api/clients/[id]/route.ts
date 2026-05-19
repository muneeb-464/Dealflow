import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User, Client, WorkspaceMember } from "@/models";

const UpdateClientSchema = z.object({
  name: z.string().min(1).max(100).trim().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  platform: z.string().optional(),
  status: z.enum(["active", "inactive", "churned"]).optional(),
  currency: z.string().optional(),
  totalRevenue: z.number().min(0).optional(),
  notes: z.string().optional(),
});

async function getAuthContext(userId: string) {
  const user = await User.findOne({ clerkId: userId });
  if (!user?.activeWorkspaceId) return null;
  const member = await WorkspaceMember.findOne({
    workspaceId: user.activeWorkspaceId,
    userId: user._id,
  }).lean() as { role: string } | null;
  if (!member) return null; // removed from workspace
  return { user, role: member.role };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateClientSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const ctx = await getAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const client = await Client.findOne({ _id: id, workspaceId: ctx.user.activeWorkspaceId });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    if (ctx.role === "employee" && !client.createdBy.equals(ctx.user._id)) {
      return NextResponse.json({ error: "You can only edit clients you created" }, { status: 403 });
    }

    Object.assign(client, parsed.data);
    await client.save();

    return NextResponse.json({ client });
  } catch (err) {
    console.error("[PATCH /api/clients/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const ctx = await getAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const client = await Client.findOne({ _id: id, workspaceId: ctx.user.activeWorkspaceId });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    if (ctx.role === "employee" && !client.createdBy.equals(ctx.user._id)) {
      return NextResponse.json({ error: "You can only delete clients you created" }, { status: 403 });
    }

    await client.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/clients/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
