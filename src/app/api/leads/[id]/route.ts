import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { getRouteAuthContext } from "@/lib/routeAuth";
import { closeLeadReminders } from "@/lib/leads";
import { LEAD_PLATFORMS, LEAD_STATUSES, CLOSED_STATUSES } from "@/constants/leads";
import { Lead } from "@/models";

const UpdateLeadSchema = z.object({
  clientName: z.string().min(1).max(100).trim().optional(),
  clientEmail: z.string().optional(),
  clientCompany: z.string().optional(),
  platform: z.enum(LEAD_PLATFORMS).optional(),
  serviceOffered: z.string().min(1).max(200).trim().optional(),
  proposedAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(LEAD_STATUSES).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = UpdateLeadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const ctx = await getRouteAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const lead = await Lead.findOne({ _id: id, workspaceId: ctx.workspaceId });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (ctx.role === "employee" && !lead.createdBy.equals(ctx.userId)) {
      return NextResponse.json({ error: "You can only edit leads you created" }, { status: 403 });
    }

    const wasClosed = CLOSED_STATUSES.includes(lead.status);
    Object.assign(lead, parsed.data);
    // Stamp pipeline dates the first time a lead reaches these stages (used for "won this month")
    if (lead.status === "replied" && !lead.repliedAt) lead.repliedAt = new Date();
    if (lead.status === "converted" && !lead.convertedAt) lead.convertedAt = new Date();
    await lead.save();

    if (!wasClosed && CLOSED_STATUSES.includes(lead.status)) {
      await closeLeadReminders(ctx.workspaceId, lead._id);
    }

    return NextResponse.json({ lead });
  } catch (err) {
    console.error("[PATCH /api/leads/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    await connectDB();
    const ctx = await getRouteAuthContext(userId);
    if (!ctx) return NextResponse.json({ error: "No active workspace" }, { status: 404 });

    const lead = await Lead.findOne({ _id: id, workspaceId: ctx.workspaceId });
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

    if (ctx.role === "employee" && !lead.createdBy.equals(ctx.userId)) {
      return NextResponse.json({ error: "You can only delete leads you created" }, { status: 403 });
    }

    await lead.deleteOne();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/leads/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
