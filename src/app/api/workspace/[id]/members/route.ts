import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User, WorkspaceMember, Lead, Client } from "@/models";
import mongoose from "mongoose";

// GET /api/workspace/[id]/members — members of any workspace the current user belongs to
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: targetId } = await params;
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
      return NextResponse.json({ error: "Invalid workspace id" }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ clerkId: userId });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const targetOid = new mongoose.Types.ObjectId(targetId);

    // Verify current user is a member of that workspace
    const membership = await WorkspaceMember.findOne({ userId: user._id, workspaceId: targetOid });
    if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

    const [members, leadCounts, clientCounts] = await Promise.all([
      WorkspaceMember.find({ workspaceId: targetOid })
        .populate("userId", "name email avatar")
        .lean(),
      Lead.aggregate([
        { $match: { workspaceId: targetOid } },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      ]),
      Client.aggregate([
        { $match: { workspaceId: targetOid } },
        { $group: { _id: "$assignedTo", count: { $sum: 1 } } },
      ]),
    ]);

    const leadMap: Record<string, number> = {};
    for (const l of leadCounts) leadMap[String(l._id)] = l.count;

    const clientMap: Record<string, number> = {};
    for (const c of clientCounts) clientMap[String(c._id)] = c.count;

    const formatted = members.map((m) => {
      const u = m.userId as unknown as { _id: string; name: string; email: string; avatar?: string };
      const uid = String(u._id);
      return {
        id: String(m._id),
        userId: uid,
        name: u.name,
        email: u.email,
        avatar: u.avatar ?? null,
        role: m.role,
        leadCount: leadMap[uid] ?? 0,
        clientCount: clientMap[uid] ?? 0,
      };
    });

    return NextResponse.json({ members: formatted });
  } catch (err) {
    console.error("[GET /api/workspace/[id]/members]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
