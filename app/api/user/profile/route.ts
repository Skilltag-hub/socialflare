import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

function isNonEmpty(value: any): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function isProfileComplete(user: any): boolean {
  // Define the fields required to consider a profile complete
  return (
    isNonEmpty(user?.name) &&
    isNonEmpty(user?.description) &&
    isNonEmpty(user?.phone) &&
    isNonEmpty(user?.gender) &&
    isNonEmpty(user?.dateOfBirth) &&
    isNonEmpty(user?.githubUrl) &&
    isNonEmpty(user?.linkedinUrl) &&
    isNonEmpty(user?.resumeUrl) &&
    Array.isArray(user?.skills) &&
    user.skills.length > 0
  );
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const client = await clientPromise;
    const db = client.db("waitlist");
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Remove sensitive information
    const { pin, ...userProfile } = user;

    return new Response(JSON.stringify(userProfile), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch user profile" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const profileData = await req.json();

    // Validate the data
    const {
      name,
      description,
      status,
      skills,
      gender,
      dateOfBirth,
      phone,
      institution,
      state,
      graduationYear,
      idImageUrl,
      referredBy,
      referredPeople,
      githubUrl,
      linkedinUrl,
      resumeUrl,
    } = profileData;

    // Create update object with only provided fields
    const updateData: Record<string, any> = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (skills !== undefined && Array.isArray(skills))
      updateData.skills = skills;
    if (gender !== undefined) updateData.gender = gender;
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth;
    if (phone !== undefined) updateData.phone = phone;
    if (institution !== undefined) updateData.institution = institution;
    if (state !== undefined) updateData.state = state;
    if (graduationYear !== undefined) updateData.graduationYear = graduationYear;
    if (idImageUrl !== undefined) updateData.idImageUrl = idImageUrl;
    if (referredBy !== undefined) updateData.referredBy = referredBy;
    if (referredPeople !== undefined && Array.isArray(referredPeople)) {
      updateData.referredPeople = referredPeople;
    }
    if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
    if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;
    if (resumeUrl !== undefined) updateData.resumeUrl = resumeUrl;
    const client = await clientPromise;
    const db = client.db("waitlist");

    // Load existing user to compute profile completeness after this update
    const existingUser = await db
      .collection("users")
      .findOne({ email: session.user.email });

    if (!existingUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const mergedUser = { ...existingUser, ...updateData } as any;
    const profileFilled = isProfileComplete(mergedUser);
    (updateData as any).profileFilled = profileFilled;

    const result = await db
      .collection("users")
      .updateOne({ email: session.user.email }, { $set: updateData });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        message: "Profile updated successfully",
        updated: result.modifiedCount > 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating user profile:", error);
    return new Response(JSON.stringify({ error: "Failed to update profile" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
