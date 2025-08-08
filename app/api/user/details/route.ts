import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";

function isNonEmpty(value: any): boolean {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value);
}

function isProfileComplete(user: any): boolean {
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

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }
  const details = await req.json();
  console.log(details);
  const client = await clientPromise;
  const db = client.db("waitlist");

  // Prepare the update data
  const updateData = { ...details };

  // Remove referredBy from the main update if it exists
  const { referredBy, ...otherDetails } = updateData;

  // Fetch existing user to compute profile completeness
  const existingUser = await db
    .collection("users")
    .findOne({ email: session.user.email });

  if (!existingUser) {
    return new Response("User not found", { status: 404 });
  }

  const mergedUser = { ...existingUser, ...otherDetails } as any;
  const profileFilled = isProfileComplete(mergedUser);

  // Start with the base update
  const update: any = {
    $set: { ...otherDetails, setupComplete: true, profileFilled },
  };

  // Only set referredBy if it's provided and not already set
  if (referredBy) {
    // Only set referredBy if it's not already present
    if (!existingUser?.referredBy) {
      update.$set.referredBy = referredBy;
    }
  }

  // Perform the update
  const result = await db
    .collection("users")
    .updateOne({ email: session.user.email }, update, { upsert: false });

  console.log(
    "Matched:",
    result.matchedCount,
    "Modified:",
    result.modifiedCount
  );
  return new Response("Details updated", { status: 200 });
}
