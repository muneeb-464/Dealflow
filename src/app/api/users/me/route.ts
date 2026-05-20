import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models";

// GET /api/users/me
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const user = await User.findOne({ clerkId: userId }).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/users/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const UpdateSchema = z.object({
  name: z.string().min(1).max(80).trim().optional(),
  avatar: z.string().url().optional(),
});

// PUT /api/users/me
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    await connectDB();
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: parsed.data },
      { new: true, runValidators: true }
    );
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[PUT /api/users/me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
