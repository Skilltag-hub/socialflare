import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import clientPromise from "@/lib/mongodb";
import PostGig from "@/components/post-gig";

export default async function CompaniesPostGig() {
  // Server-side check: ensure company is approved before accessing the page
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    // Not logged in as a company user; send to companies hub/login
    redirect("/companies");
  }

  const client = await clientPromise;
  const db = client.db("waitlist");
  const company = await db.collection("companies").findOne({ email: session.user.email });

  if (!company) {
    // Not onboarded as a company yet
    redirect("/companies");
  }

  if (!company.approved) {
    // Redirect unapproved companies to pending approval page
    redirect("/pending-approval?type=company");
  }

  return <PostGig />;
}