import GigDescription from "@/components/gig-description";
import { notFound } from "next/navigation";

async function getGigDetails(gigId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || "";
    const apiUrl = new URL(
      `/api/gigs/${gigId}`,
      baseUrl || "http://localhost:3000"
    ).toString();

    const response = await fetch(apiUrl, {
      cache: "no-store",
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Gig not found
      }
      throw new Error("Failed to fetch gig");
    }

    const data = await response.json();
    return data.gig || null;
  } catch (error) {
    console.error("Error fetching gig details:", error);
    return null;
  }
}

interface Gig {
  _id: string;
  companyName: string;
  title: string;
  description: string;
  payment: string | number;
  openings: number;
  datePosted: string;
  skills?: string[];
  requirements?: string[];
  responsibilities?: string[];
  location?: string;
  duration?: string;
  category?: string;
  status?: string;
}

export default async function GigDetailsPage({
  params,
}: {
  params: Promise<{ gigId: string }>;
}) {
  // Await the params promise
  const { gigId } = await params;

  // Then fetch the gig details
  const gig = await getGigDetails(gigId);

  if (!gig) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <GigDescription gig={gig} />
      </div>
    </div>
  );
}
