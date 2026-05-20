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

    const email = clerkUser.emailAddresses[0]?.emailAddress || `${userId}@clerk.local`;
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() || clerkUser.username || email;
    const avatar = clerkUser.imageUrl;
    const accountType = (clerkUser.unsafeMetadata?.accountType as string) ?? "freelancer";

    // Find or create user — explicit flow avoids upsert E11000 issues
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update profile fields
      user.name = name;
      user.avatar = avatar;
      // Only update email if it changed and isn't taken by another account
      if (user.email !== email && email) {
        const emailTaken = await User.findOne({ email, clerkId: { $ne: userId } }).lean();
        if (!emailTaken) user.email = email;
      }
      await user.save();
    } else {
      // No user with this clerkId — check if a user with this email already exists
      // (e.g. account created via different auth method or previous session)
      const existingByEmail = await User.findOne({ email });
      if (existingByEmail) {
        // Merge: take over that doc with the current clerkId
        existingByEmail.clerkId = userId;
        existingByEmail.name = name;
        existingByEmail.avatar = avatar;
        await existingByEmail.save();
        user = existingByEmail;
      } else {
        user = await User.create({ clerkId: userId, email, name, avatar });
      }
    }

    // Auto-create workspace for freelancers on first login
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

    // Clean up any orphan tagged-email docs created by old E11000 fallback
    await User.deleteMany({ email: new RegExp(`^${userId}\\+`), clerkId: { $ne: userId } });

    let member = null;
    if (user.activeWorkspaceId) {
      member = await WorkspaceMember.findOne({ workspaceId: user.activeWorkspaceId, userId: user._id }).lean();

      // User was removed from workspace — clear their activeWorkspaceId
      if (!member) {
        user.activeWorkspaceId = undefined;
        await user.save();
      }
    }

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
    const e = err as { message?: string; code?: number; stack?: string };
    console.error("[POST /api/auth/sync] code:", e?.code, "message:", e?.message, "\n", e?.stack ?? err);
    return NextResponse.json({
      error: "Internal server error",
      detail: e?.message,
      code: e?.code,
    }, { status: 500 });
  }
}
