"use client";

import { ArrowLeft, Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Clock, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface Gig {
  _id: string;
  companyName: string;
  title: string;
  description: string;
  payment: number;
  openings: number;
  datePosted: string;
  skills: string[];
  aboutCompany: string;
  companyLogo?: string;
}

interface UserGig {
  gigId: string;
  bookmarked: boolean;
  applied: boolean;
  status: string;
}

export default function GigDescription({ gig }: { gig: Gig }) {
  console.log("Gig ID:", gig._id);
  const { data: session } = useSession();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userGig, setUserGig] = useState<UserGig | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Fetch user's gig application status
  useEffect(() => {
    const fetchUserGig = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/gigs");
          if (response.ok) {
            const data = await response.json();
            const userGig = data.gigs.find((g: any) => g.gigId === gig._id);
            if (userGig) {
              setUserGig(userGig);
              setIsBookmarked(userGig.bookmarked || false);
            }
          }
        } catch (error) {
          console.error("Error fetching user gig status:", error);
        }
      }
    };

    fetchUserGig();
  }, [session, gig._id]);

  // Handle applying for a gig
  const handleApply = async () => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to apply for this gig",
        variant: "destructive",
      });
      return;
    }

    if (userGig?.applied) return;

    try {
      setIsSubmitting(true);
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId: gig._id,
          action: "apply", // ✅ Add this line
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply");
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted",
      });

      setUserGig((prev) => ({
        ...prev,
        applied: true,
        gigId: gig._id,
        bookmarked: prev?.bookmarked || false,
      }));
    } catch (error: any) {
      console.error("Error applying for gig:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply for this gig",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle bookmarking a gig
  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to bookmark gigs",
        variant: "destructive",
      });
      return;
    }

    if (!gig?._id) {
      toast({
        title: "Error",
        description: "Gig ID is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBookmarkState = !isBookmarked;
      setIsBookmarked(newBookmarkState);

      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId: gig._id,
          action: "bookmark", // ✅ Add this line
          value: newBookmarkState, // ✅ Add this line
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to update bookmark status"
        );
      }

      // Optional: update userGig if needed
      setUserGig((prev) => ({
        ...prev,
        gigId: gig._id,
        bookmarked: newBookmarkState,
        applied: prev?.applied || false,
      }));
    } catch (error: any) {
      console.error("Error toggling bookmark:", error);
      setIsBookmarked((prev) => !prev); // Revert
      toast({
        title: "Error",
        description: error.message || "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen">
      {/* Header */}
      <Link href="/home" className="block">
        <div className="bg-black text-white py-4 -mx-8 px-2 flex items-center gap-3">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </div>
      </Link>

      {/* Content */}
      <div className="py-4 space-y-4">
        {/* Company Info */}
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12 border-2 border-gray-200">
            <AvatarImage
              src={gig.companyLogo}
              alt={gig.companyName}
              className="object-cover"
            />
            <AvatarFallback className="bg-yellow-400 text-black font-bold text-lg">
              {gig.companyName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="font-semibold text-lg text-black">
              {gig.companyName}
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{gig.openings}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(gig.datePosted).toLocaleDateString()}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Job Description */}

        {/* Salary and Actions */}
        <div className="flex items-center justify-between pt-2 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-600 font-medium">₹</span>
            <span className="font-semibold text-lg">{gig.payment}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${isBookmarked ? "text-skillText" : ""}`}
              onClick={handleBookmark}
              disabled={!session || isSubmitting}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4 fill-skillText" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </Button>
            <Button
              className={`px-6 py-2 rounded-full text-sm ${
                userGig?.status === "applied"
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-skill text-skillText hover:bg-skillText hover:text-skill"
              }`}
              onClick={handleApply}
              disabled={isSubmitting || userGig?.status === "applied"}
            >
              {isSubmitting ? (
                "Applying..."
              ) : userGig?.status === "applied" ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Applied
                </span>
              ) : (
                "Apply"
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-3 ">
          <h2 className="font-semibold text-black">Job Description</h2>
          <p className="text-sm text-gray-700">{gig.description}</p>
        </div>
        {/* Skills Required */}
        <div className="space-y-3">
          <h2 className="font-semibold text-black">Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(gig.skills) && gig.skills.length > 0 ? (
              gig.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 border border-gray-300 rounded-full text-sm text-gray-700"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-500">
                No specific skills required
              </span>
            )}
          </div>
        </div>

        {/* About Company */}
        <div className="space-y-2">
          <h2 className="font-semibold text-black">About Company</h2>
          <p className="text-sm text-gray-700">{gig.aboutCompany}</p>
        </div>
      </div>
    </div>
  );
}
