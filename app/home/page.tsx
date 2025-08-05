"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bookmark,
  Clock,
  Users,
  Home,
  MessageCircle,
  Bell,
  Building2,
  User,
  FileText,
  Clock3,
  CheckCircle,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ClickSpark from "@/utils/ClickSpark/ClickSpark";
import { useEffect, useState } from "react";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";
import { useToast } from "@/hooks/use-toast";
import { useSession, signOut } from "next-auth/react";

export default function Component() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [userGigs, setUserGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState<"all" | "bookmarked">("all");

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Fetch gigs from API
  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await fetch("/api/gigs");
        if (!response.ok) {
          throw new Error("Failed to fetch gigs");
        }
        const data = await response.json();
        setGigs(data.gigs);
      } catch (error) {
        console.error("Error fetching gigs:", error);
        toast({
          title: "Error",
          description: "Failed to load gigs. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchUserGigs = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/gigs");
          if (response.ok) {
            const data = await response.json();
            setUserGigs(data.gigs);
          }
        } catch (error) {
          console.error("Error fetching user gigs:", error);
        }
      }
    };

    fetchGigs();
    fetchUserGigs();
  }, [toast, session]);

  // Fallback job card for loading state
  const fallbackJobCard = {
    company: "Loading...",
    openings: "...",
    timeAgo: "...",
    description: "Loading gig details...",
    payment: "...",
  };

  // Format date to relative time (e.g., "2 days ago")
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "1d ago";
    return `${diffInDays}d ago`;
  };

  // Transform API gig data to match JobCard props
  const transformGigToJobCard = (gig: any) => ({
    id: gig._id,
    company: gig.companyName,
    openings: `${gig.openings}`,
    timeAgo: getRelativeTime(gig.datePosted),
    description: gig.description,
    payment: gig.payment,
    skills: gig.skills || [],
  });

  // Handle applying for a gig
  const handleApply = async (gigId: string) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to apply for this gig",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ gigId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply");
      }

      toast({
        title: "Success!",
        description: "Your application has been submitted",
      });

      // Redirect to My Zigs page
      window.location.href = "/zigs";
    } catch (error: any) {
      console.error("Error applying for gig:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to apply for this gig",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle bookmarking a gig
  const handleBookmark = async (gigId: string, isBookmarked: boolean) => {
    if (!session) {
      toast({
        title: "Login Required",
        description: "Please login to bookmark gigs",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/applications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gigId,
          action: "bookmark",
          value: !isBookmarked
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Only show error if it's not about not having applied
        const errorMsg = (data.error || "").toLowerCase();
        if (
          !errorMsg.includes("apply") &&
          !errorMsg.includes("not applied") &&
          !errorMsg.includes("haven't applied")
        ) {
          throw new Error(data.error || "Failed to update bookmark");
        }
        // If error is about not having applied, ignore and just update UI
      }

      toast({
        title: "Success!",
        description: isBookmarked
          ? "Gig removed from bookmarks"
          : "Gig added to bookmarks",
      });

      // Refresh user gigs data
      const userGigsResponse = await fetch("/api/user/gigs");
      if (userGigsResponse.ok) {
        const userGigsData = await userGigsResponse.json();
        setUserGigs(userGigsData.gigs);
      }
    } catch (error: any) {
      // Only show error if it's not about not having applied
      const errorMsg = (error.message || "").toLowerCase();
      if (
        !errorMsg.includes("apply") &&
        !errorMsg.includes("not applied") &&
        !errorMsg.includes("haven't applied")
      ) {
        console.error("Error updating bookmark:", error);
        toast({
          title: "Error",
          description: error.message || "Failed to update bookmark",
          variant: "destructive",
        });
      }
      // Otherwise, ignore error
    }
  };

  const JobCard = ({ job }: { job: any }) => {
    // Check if user has applied to this gig
    const userGig = userGigs.find((userGig: any) => userGig.gigId === job.id);
    const hasApplied = !!userGig && userGig.status !== "bookmarked";
    const isBookmarked = userGig?.bookmarked || false;
    const isBookmarkedStatus = userGig?.status === "bookmarked";

    return (
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">
                {job.company.substring(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {job.company}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{job.openings}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.timeAgo}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {job.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-purple-600 text-lg">
                {job.payment.startsWith("$") ? "$" : "₹"}
              </span>
              <span className="text-purple-600 font-semibold text-lg">
                {job.payment.replace(/[^0-9]/g, "")}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleBookmark(job.id, isBookmarked)}
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked
                      ? "text-purple-600 fill-current"
                      : "text-gray-400"
                  }`}
                />
              </Button>
              <Button
                className={`px-6 py-2 rounded-full ${
                  hasApplied
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
                onClick={() => !hasApplied && handleApply(job.id)}
                disabled={hasApplied}
              >
                {hasApplied ? "Applied" : "Apply"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Filtered gigs for bookmarked tab
  const bookmarkedGigs = gigs.filter((gig) =>
    userGigs.some((userGig) => userGig.gigId === gig._id && userGig.bookmarked)
  );

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex flex-col lg:hidden">
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen relative">
          <Navbar />
          {/* Tabs for All/Bookmarked */}
          <div className="flex gap-2 px-4 pt-4 pb-2">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("all")}
            >
              All Gigs
            </Button>
            <Button
              variant={activeTab === "bookmarked" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("bookmarked")}
            >
              Bookmarked
            </Button>
          </div>
          {/* Header - Fixed at top */}
          <div className="flex items-center justify-between p-4 pt-8 bg-gradient-to-b from-purple-100 to-purple-200 sticky top-0 z-10">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                Good morning, {session?.user?.name || "Guest"}!
              </p>
              <p className="text-purple-600 text-xl font-semibold">
                You Earned ₹0
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-red-600 hover:bg-red-50 px-2 py-1 text-xs"
              >
                Logout
              </Button>
              <Avatar className="w-12 h-12 bg-gray-300">
                {session?.user?.image ? (
                  <AvatarImage
                    src={session.user.image}
                    alt={session.user.name || "User"}
                  />
                ) : (
                  <AvatarFallback className="bg-gray-300">
                    {session?.user?.name
                      ? session.user.name.substring(0, 2).toUpperCase()
                      : "GT"}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
          {/* Job Cards - Scrollable area */}
          <div className="px-4 space-y-4 pb-4 flex-1 overflow-y-auto">
            {loading ? (
              <div className="w-full flex items-center justify-center min-h-[300px]">
                <Ripples size={45} speed={2} color="#5E17EB" />
              </div>
            ) : activeTab === "all" ? (
              gigs.map((gig, index) => (
                <JobCard
                  key={gig._id || index}
                  job={transformGigToJobCard(gig)}
                />
              ))
            ) : bookmarkedGigs.length > 0 ? (
              bookmarkedGigs.map((gig, index) => (
                <JobCard
                  key={gig._id || index}
                  job={transformGigToJobCard(gig)}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No bookmarked gigs found.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <Navbar />
        {/* Main Content */}
        <div className="flex-1 p-8 lg:ml-64">
          {/* Tabs for All/Bookmarked */}
          <div className="flex gap-2 mb-8">
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
            >
              All Gigs
            </Button>
            <Button
              variant={activeTab === "bookmarked" ? "default" : "outline"}
              onClick={() => setActiveTab("bookmarked")}
            >
              Bookmarked
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6 max-w-6xl">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center min-h-[400px]">
                <Ripples size={90} speed={2} color="#5E17EB" />
              </div>
            ) : activeTab === "all" ? (
              gigs.map((gig, index) => (
                <JobCard
                  key={gig._id || index}
                  job={transformGigToJobCard(gig)}
                />
              ))
            ) : bookmarkedGigs.length > 0 ? (
              bookmarkedGigs.map((gig, index) => (
                <JobCard
                  key={gig._id || index}
                  job={transformGigToJobCard(gig)}
                />
              ))
            ) : (
              <div className="col-span-3 text-center text-gray-500 py-8">
                No bookmarked gigs found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}