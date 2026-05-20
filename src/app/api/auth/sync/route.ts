import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User, Workspace, WorkspaceMember } from "@/models";

function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const clerkUser = await currentUser();
    if (!clerkUser) return NextResponse.json({ error: "Clerk user not found" }, { status: 404 });

    await connectDB();

    const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || email;
    const avatar = clerkUser.imageUrl;
    const accountType = (clerkUser.unsafeMetadata?.accountType as string) ?? "freelancer";

    // Upsert user
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: { email, name, avatar } },
      { upsert: true, new: true, runValidators: true }
    );

    // Auto-create workspace for freelancers if they don't have one
    if (accountType === "freelancer" && !user.activeWorkspaceId) {
      const workspaceName = `${name}'s Workspace`;
      let slug = toSlug(workspaceName);
      const existing = await Workspace.findOne({ slug });
      if (existing) slug = `${slug}-${Date.now()}`;

      const workspace = await Workspace.create({
        name: workspaceName,
        slug,
        currency: "USD",
        timezone: "Asia/Karachi",
        ownerId: user._id,
      });

      await WorkspaceMember.create({
        workspaceId: workspace._id,
        userId: user._id,
        role: "owner",
      });

      user.activeWorkspaceId = workspace._id;
      await user.save();
    }

    const member = user.activeWorkspaceId
      ? await WorkspaceMember.findOne({ workspaceId: user.activeWorkspaceId, userId: user._id }).lean()
      : null;

    return NextResponse.json({
      user: {
        id: String(user._id),
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        accountType,
        activeWorkspaceId: user.activeWorkspaceId ?? null,
        role: (member as { role?: string } | null)?.role ?? "employee",
      },
    });
  } catch (err) {
    console.error("[POST /api/auth/sync]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
