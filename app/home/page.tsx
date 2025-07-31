"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";

export default function Component() {
  const [gigs, setGigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { data: session, status } = useSession();

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

    fetchGigs();
  }, [toast]);

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

  const JobCard = ({ job }: { job: any }) => (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">
              {job.company.substring(0, 2)}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{job.company}</h3>
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
            <ClickSpark
              sparkColor="#000"
              sparkSize={5}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Bookmark className="w-4 h-4 text-gray-400" />
              </Button>
            </ClickSpark>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
              onClick={() => handleApply(job.id)}
            >
              Apply
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex flex-col lg:hidden">
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen relative">
          <Navbar />
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

          {/* Job Cards - Scrollable area */}
          <div className="px-4 space-y-4 pb-4 flex-1 overflow-y-auto">
            {loading
              ? Array(3)
                  .fill(fallbackJobCard)
                  .map((job, index) => <JobCard key={index} job={job} />)
              : gigs.map((gig, index) => (
                  <JobCard
                    key={gig._id || index}
                    job={transformGigToJobCard(gig)}
                  />
                ))}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <Navbar />
        {/* Main Content */}
        <div className="flex-1 p-8">
          <div className="grid grid-cols-3 gap-6 max-w-6xl">
            {loading
              ? Array(9)
                  .fill(fallbackJobCard)
                  .map((job, index) => <JobCard key={index} job={job} />)
              : gigs.map((gig, index) => (
                  <JobCard
                    key={gig._id || index}
                    job={transformGigToJobCard(gig)}
                  />
                ))}
          </div>
        </div>
      </div>
    </>
  );
}
