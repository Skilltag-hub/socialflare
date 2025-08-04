"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  Users,
  BarChart3,
  User,
  Home,
  Clock,
  Zap,
  Filter,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";

export default function MyZigs() {
  const { data: session, status } = useSession();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [isPopulating, setIsPopulating] = useState(false);

  // Fetch companyId after session loads
  useEffect(() => {
    const fetchCompanyId = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          const res = await fetch("/api/auth/companies");
          if (res.ok) {
            const data = await res.json();
            setCompanyId(data.company?.id?.toString() || null); // Use 'id' as returned by backend
          } else {
            setCompanyId(null);
          }
        } catch {
          setCompanyId(null);
        }
      }
    };
    fetchCompanyId();
  }, [session, status]);

  // Fetch jobs only after companyId is set
  useEffect(() => {
    if (companyId) {
      fetchJobs();
    } else {
      setJobs([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  async function fetchJobs() {
    try {
      console.log("Fetching jobs from /api/gigs...");
      const res = await fetch("/api/gigs");
      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(
          `Failed to fetch jobs: ${res.status} ${res.statusText}`
        );
      }

      const response = await res.json();
      console.log("Raw API response:", response);

      // Extract the gigs array from the response object
      const gigs = response.gigs || [];

      if (!Array.isArray(gigs)) {
        console.error("Expected gigs to be an array but got:", typeof gigs);
        setJobs([]);
        return;
      }

      // Transform the data to match the expected format
      let formattedJobs = gigs.map((job, index) => {
        const formattedJob = {
          _id: job._id?.toString() || `job-${Date.now()}-${index}`,
          gigTitle: job.companyName || "Untitled Gig",
          description: job.description || "No description provided",
          datePosted: job.datePosted || new Date().toISOString(),
          status: job.status || "active",
          companyName: job.companyName,
          openings: job.openings || 1,
          payment: job.payment || "Not specified",
          skills: Array.isArray(job.skills) ? job.skills : [],
          aboutCompany: job.aboutCompany || "",
          companyId: job.companyId || null,
        };
        console.log(`Formatted job ${index}:`, formattedJob);
        return formattedJob;
      });

      // Filter jobs by companyId
      if (companyId) {
        console.log("Filtering jobs by companyId:", companyId);
        formattedJobs = formattedJobs.filter((job) => {
          console.log(
            "Comparing job.companyId:",
            job.companyId,
            "with companyId:",
            companyId
          );
          return job.companyId?.toString() === companyId?.toString();
        });
      } else {
        formattedJobs = [];
      }

      console.log("Filtered jobs:", formattedJobs);
      setJobs(formattedJobs);
    } catch (error) {
      console.error("Error in fetchJobs:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      setJobs([]); // Ensure jobs is always an array
    }
  }

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs =
    activeFilter === "all"
      ? jobs
      : jobs.filter((job) => job.status === activeFilter);

  const getJobCounts = () => {
    return {
      all: jobs.length,
      active: jobs.filter((job) => job.status === "active").length,
      completed: jobs.filter((job) => job.status === "completed").length,
    };
  };
  const counts = getJobCounts();

  const markCompleted = async (jobId) => {
    try {
      const response = await fetch(`/api/gigs`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: jobId,
          status: "completed",
        }),
      });

      if (!response.ok) throw new Error("Failed to update job status");

      setJobs((prev) =>
        prev.map((job) =>
          job._id === jobId ? { ...job, status: "completed" } : job
        )
      );
    } catch (error) {
      console.error("Error updating job status:", error);
      // Optionally show an error message to the user
    }
  };

  console.log("Rendering with jobs:", jobs, "Filtered jobs:", filteredJobs);

  return (
    <div className="h-screen bg-black text-white overflow-hidden p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="h-[34px]"></div>
      </div>
      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Left Sidebar (Navbar) */}
        <div className="w-64 pl-8 pr-6 py-0 flex flex-col">
          <div className="flex flex-col items-center mb-12 mt-4">
            <img
              src="/zigwork-logo.svg"
              alt="Zigwork Logo"
              width={64}
              height={64}
              className="w-16 h-16 mb-2"
            />
            <span className="text-xl font-bold">zigwork</span>
          </div>
          <nav className="space-y-2 mb-auto">
            <a
              href="/companies"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span className="font-medium text-sm">Home</span>
            </a>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#5E17EB]/20 text-[#5E17EB] border border-[#5E17EB]/30">
              <BarChart3 className="w-4 h-4" />
              <span className="font-medium text-sm">My Zigs</span>
            </div>
            <a
              href="/shortlist"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span className="font-medium text-sm">Shortlist</span>
            </a>
            <a
              href="/companies/profile"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="font-medium text-sm">Profile</span>
            </a>
          </nav>
          <div className="space-y-2 text-xs text-gray-400 px-3 mb-4">
            <div className="hover:text-white cursor-pointer transition-colors">
              Support
            </div>
            <div className="hover:text-white cursor-pointer transition-colors">
              Privacy Policy
            </div>
            <div className="hover:text-white cursor-pointer transition-colors">
              Terms & Conditions
            </div>
            <div className="text-xs mt-4 text-gray-500">
              ©All Rights Reserved Zigwork
            </div>
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden py-0">
          <div className="flex items-center justify-between mb-6 mt-0">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveFilter("all")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "all"
                    ? "bg-[#5E17EB] text-white border-[#5E17EB]"
                    : "bg-transparent border-white text-gray-300 hover:bg-gray-800"
                }`}
              >
                All Jobs {counts.all}
              </Button>
              <Button
                onClick={() => setActiveFilter("active")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "active"
                    ? "bg-[#5E17EB] text-white border-[#5E17EB]"
                    : "bg-transparent border-white text-gray-300 hover:bg-gray-800"
                }`}
              >
                Active {counts.active}
              </Button>
              <Button
                onClick={() => setActiveFilter("completed")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "completed"
                    ? "bg-[#5E17EB] text-white border-[#5E17EB]"
                    : "bg-transparent border-white text-gray-300 hover:bg-gray-800"
                }`}
              >
                Completed {counts.completed}
              </Button>
            </div>
            <Button
              variant="outline"
              className="bg-transparent border-white text-gray-300 hover:bg-gray-800 px-8 py-2 rounded-lg text-sm font-extralight flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 overflow-y-auto scrollbar-hide h-[calc(100vh-10vh-140px)]">
            {jobs.length === 0 ? (
              <div className="col-span-3 flex items-center justify-center min-h-[300px]">
                <Ripples size={60} speed={2} color="#5E17EB" />
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white text-black rounded-xl shadow-sm h-[220px] flex flex-col hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/companies/job-applications/${job._id}`)
                  }
                >
                  <div className="p-3 flex flex-col h-full">
                    <div className="mb-3 flex-1">
                      <h3 className="font-normal text-gray-700 leading-relaxed text-sm line-clamp-1">
                        {job.gigTitle}
                      </h3>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {job.description}
                      </p>
                      {job.payment && (
                        <p className="text-xs font-medium text-gray-700 mt-1">
                          Payment: {job.payment}
                        </p>
                      )}
                      {job.skills && job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {job.skills.slice(0, 3).map((skill, i) => (
                            <span
                              key={i}
                              className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                          {job.skills.length > 3 && (
                            <span className="text-xs text-gray-400">
                              +{job.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#5E17EB]" />
                        <span>
                          {applications[job._id]?.length || 0} Applicants
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {new Date(job.datePosted).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {applications[job._id]?.map((app) => (
                        <div
                          key={app._id}
                          className="flex items-center justify-between text-xs bg-gray-100 rounded px-2 py-1"
                        >
                          <span>{app.applicantEmail}</span>
                          <span
                            className={`px-2 py-1 rounded ${
                              app.status === "accepted"
                                ? "bg-green-200 text-green-800"
                                : app.status === "rejected"
                                ? "bg-red-200 text-red-800"
                                : "bg-yellow-200 text-yellow-800"
                            }`}
                          >
                            {app.status}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <Button
                        className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-3 py-1 rounded-lg font-normal text-xs"
                        onClick={() => markCompleted(job._id)}
                        disabled={job.status === "completed"}
                      >
                        {job.status === "completed"
                          ? "Completed"
                          : "Mark Completed"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
