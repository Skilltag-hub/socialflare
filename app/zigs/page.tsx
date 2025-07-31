"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Users,
  Home,
  Bell,
  User,
  Building2,
  Filter,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TransitionLink } from "@/components/transition-link";

export default function Component() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("applied");
  const { toast } = useToast();
  const { data: session, status } = useSession();

  // Define filter tabs with dynamic counts
  const getFilterTabs = () => [
    { label: "Applied", status: "applied", active: activeFilter === "applied" },
    {
      label: "Shortlisted",
      status: "shortlisted",
      active: activeFilter === "shortlisted",
    },
    {
      label: "Selected",
      status: "selected",
      active: activeFilter === "selected",
    },
    {
      label: "Completed",
      status: "completed",
      active: activeFilter === "completed",
    },
  ];

  // Fetch applications from API
  useEffect(() => {
    const fetchApplications = async () => {
      if (status !== "authenticated") return;

      try {
        setLoading(true);
        const response = await fetch("/api/applications");
        if (!response.ok) {
          throw new Error("Failed to fetch applications");
        }
        const data = await response.json();
        setApplications(data.applications || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast({
          title: "Error",
          description:
            "Failed to load your applications. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [toast, status]);

  // Filter applications based on active filter
  useEffect(() => {
    if (applications.length > 0) {
      const filtered = applications.filter(
        (app) => app.status === activeFilter
      );
      setFilteredApplications(filtered);
    }
  }, [applications, activeFilter]);

  // Handle filter tab click
  const handleFilterClick = (status: string) => {
    setActiveFilter(status);
  };

  // Fallback job card for loading state
  const fallbackJobCard = {
    company: "Loading...",
    openings: "...",
    timeAgo: "...",
    description: "Loading application details...",
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

  const JobCard = ({ application }: { application: any }) => {
    const gig = application?.gig || {};
    const appliedAt = application?.appliedAt
      ? getRelativeTime(application.appliedAt)
      : "";

    return (
      <Card className="bg-white rounded-2xl shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">
                {gig.companyName ? gig.companyName.substring(0, 2) : "JS"}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {gig.companyName || "Company"}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-purple-500" />
                  <span>{gig.openings || 0} Openings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Applied {appliedAt}</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-4 leading-relaxed">
            {gig.description || "No description available"}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-purple-600 text-lg">
                {gig.payment?.startsWith("$") ? "$" : "₹"}
              </span>
              <span className="text-purple-600 font-semibold text-lg">
                {gig.payment?.replace(/[^0-9]/g, "") || "0"}
              </span>
            </div>
            <Button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-full"
              disabled={application.status !== "selected"}
            >
              {application.status === "selected" ? "Start Work" : "Applied"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Get count of applications by status
  const getStatusCount = (status: string) => {
    return applications.filter((app) => app.status === status).length;
  };

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 lg:hidden">
        <div className="w-full max-w-sm bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden relative">
          <Navbar />
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">Good morning, Luke!</p>
              <p className="text-purple-600 text-xl font-semibold">My Zigs</p>
            </div>
            <Avatar className="w-12 h-12 bg-gray-300">
              <AvatarFallback className="bg-gray-300"></AvatarFallback>
            </Avatar>
          </div>

          {/* Filter Tabs - Mobile */}
          <div className="px-4 mb-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {getFilterTabs().map((tab, index) => (
                <Button
                  key={index}
                  variant={tab.active ? "default" : "outline"}
                  size="sm"
                  className={`whitespace-nowrap ${
                    tab.active
                      ? "bg-black text-white hover:bg-gray-800"
                      : "bg-transparent border-gray-400 text-gray-600 hover:bg-gray-100"
                  }`}
                  onClick={() => handleFilterClick(tab.status)}
                >
                  {tab.label} {getStatusCount(tab.status)}
                </Button>
              ))}
            </div>
          </div>

          {/* Job Cards */}
          <div className="px-4 space-y-4 pb-4">
            {loading ? (
              // Show loading state
              Array(3)
                .fill(fallbackJobCard)
                .map((_, index) => (
                  <Card
                    key={index}
                    className="bg-white rounded-2xl shadow-sm animate-pulse"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : filteredApplications.length > 0 ? (
              // Show applications
              filteredApplications.map((application, index) => (
                <JobCard
                  key={application._id || index}
                  application={application}
                />
              ))
            ) : (
              // Show empty state
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No {activeFilter} applications found
                </p>
                {activeFilter === "applied" && (
                  <Button
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => (window.location.href = "/home")}
                  >
                    Browse Jobs
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        <Navbar />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex gap-4">
              {getFilterTabs().map((tab, index) => (
                <Button
                  key={index}
                  variant={tab.active ? "default" : "outline"}
                  className={`${
                    tab.active
                      ? "bg-black text-white hover:bg-gray-800 border-gray-600"
                      : "bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                  onClick={() => handleFilterClick(tab.status)}
                >
                  {tab.label} {getStatusCount(tab.status)}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {loading ? (
              // Show loading state
              Array(6)
                .fill(fallbackJobCard)
                .map((_, index) => (
                  <Card
                    key={index}
                    className="bg-white rounded-2xl shadow-sm animate-pulse"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-5 bg-gray-200 rounded w-1/2 mb-2"></div>
                          <div className="flex items-center gap-4">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                      <div className="flex items-center justify-between">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-8 bg-gray-200 rounded w-24"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : filteredApplications.length > 0 ? (
              // Show applications
              filteredApplications.map((application, index) => (
                <JobCard
                  key={application._id || index}
                  application={application}
                />
              ))
            ) : (
              // Show empty state
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">
                  No {activeFilter} applications found
                </p>
                {activeFilter === "applied" && (
                  <Button
                    className="mt-4 bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={() => (window.location.href = "/home")}
                  >
                    Browse Jobs
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
