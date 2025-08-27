import GigDescription from "@/components/gig-description";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

async function getBaseUrlFromHeaders(): Promise<string> {
  const hdrs = await headers();
  const protocol = hdrs.get("x-forwarded-proto") ?? "https";
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? "skilltag.in";
  return `${protocol}://${host}`;
}

async function getGigDetails(gigId: string) {
  try {
    const baseUrl = await getBaseUrlFromHeaders();
    const apiUrl = new URL(`/api/gigs/${gigId}`, baseUrl).toString();

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
  params: { gigId: string };
}) {
  const { gigId } = params;

  // Then fetch the gig details
  const gig = await getGigDetails(gigId);

  if (!gig) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <div className="bg-black text-white py-4 px-4 sm:px-6">
          <Link href="/home" className="flex items-center gap-3">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Link>
        </div>
        <GigDescription gig={gig} />
      </div>
    </div>
  );
}
