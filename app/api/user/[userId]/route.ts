import { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return new Response("User ID is required", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("waitlist");

    // Try to find user by ObjectId first, then by string ID if that fails
    let user;
    try {
      // First try to find by ObjectId
      user = await db
        .collection("users")
        .findOne({ _id: new ObjectId(userId) });
    } catch (error) {
      // If ObjectId conversion fails, try finding by other fields (not _id as string)
      user = await db.collection("users").findOne({
        $or: [
          { userId: userId },
          { id: userId },
          { email: userId }, // In case userId is actually an email
        ],
      });
    }

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Return public profile data
    const userData = {
      _id: user._id.toString(),
      email: user.email ?? null,
      name: user.name || user.firstName || null,
      profileImage: user.image || user.avatar || null,
      description: user.description ?? null,
      status: user.status ?? null,
      skills: Array.isArray(user.skills) ? user.skills : [],
      gender: user.gender ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      phone: user.phone ?? null,
      institution: user.institution ?? null,
      graduationYear: user.graduationYear ?? null,
      state: user.state ?? null,
      department: user.department ?? user.branch ?? null,
      githubUrl: user.githubUrl ?? null,
      linkedinUrl: user.linkedinUrl ?? null,
      resumeUrl: user.resumeUrl ?? null,
    };

    return Response.json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
