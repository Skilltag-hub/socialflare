"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import {
  BarChart3,
  User,
  Home,
  Zap,
  Filter,
  Bookmark,
  X,
  Save,
  Loader2,
} from "lucide-react";
import JobCard from "./JobCard";
import Image from "next/image";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";
import { Badge } from "@/components/ui/badge";
import { SkillsCombobox } from "./skills-combobox";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
export default function MyZigs() {
  const { data: session, status } = useSession();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [isPopulating, setIsPopulating] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Initialize the Ripple loader

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

  const router = useRouter();

  // Fetch jobs only after companyId is set
  useEffect(() => {
    const fetchJobs = async () => {
      if (!companyId) return;
      // Implementation will be handled by the fetchJobs function below
    };
    fetchJobs();
  }, [companyId]);

  async function fetchJobs() {
    try {
      setIsLoading(true);
      setError(null);
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
        // Create a formatted job object that matches our frontend expectations
        const jobTitle = job.gigTitle || job.title || "Untitled Gig";

        const formattedJob = {
          _id: job._id?.toString() || `job-${Date.now()}-${index}`,
          // Ensure we don't mix up title and company name
          title: jobTitle,
          gigTitle: jobTitle,
          description: job.description || "No description provided",
          datePosted: job.datePosted || new Date().toISOString(),
          status: job.status || "active",
          // Company data
          company:
            job.company ||
            (job.companyId
              ? {
                  _id: job.companyId,
                  companyName: job.companyName,
                  logoUrl: job.companyLogo,
                }
              : null),
          companyName: job.companyName,
          companyId: job.companyId || null,
          companyLogo: job.companyLogo,
          // Job details
          openings: job.openings || 1,
          payment: job.payment || "Not specified",
          stipend: job.stipend,
          skills: Array.isArray(job.skills) ? job.skills : [],
          aboutCompany: job.aboutCompany || "",
          // Additional fields from the database
          category: job.category,
          duration: job.duration,
          location: job.location,
          requiredExperience: job.requiredExperience,
          applicationDeadline: job.applicationDeadline,
          // Include applications if they exist
          applications: Array.isArray(job.applications) ? job.applications : [],
        };

        console.log(`Formatted job ${index}:`, formattedJob);
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
      setError(error.message || "Failed to load jobs");
      setJobs([]); // Ensure jobs is always an array
    } finally {
      setIsLoading(false);
    }
  }

  // Fetch applications for all jobs
  const fetchApplications = async (jobIds) => {
    if (!jobIds || jobIds.length === 0) return {};

    try {
      console.log("Fetching applications for job IDs:", jobIds);
      const response = await fetch(
        `/api/applications?jobIds=${jobIds.join(",")}`
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch applications: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      console.log("Applications API response:", data);

      // Handle different response formats
      let appsData = {};
      if (data.applications) {
        // Format: { applications: { [jobId]: [...] } }
        appsData = data.applications;
      } else if (Array.isArray(data)) {
        // Format: [{ jobId: '...', applications: [...] }]
        data.forEach((item) => {
          if (item.jobId && Array.isArray(item.applications)) {
            appsData[item.jobId] = item.applications;
          }
        });
      }

      console.log("Processed applications data:", appsData);
      return appsData;
    } catch (error) {
      console.error("Error fetching applications:", error);
      // Return an object with empty arrays for each job ID to prevent errors
      const emptyApps = {};
      jobIds.forEach((id) => (emptyApps[id] = []));
      return emptyApps;
    }
  };

  // Update jobs and fetch applications when jobs change
  useEffect(() => {
    const updateJobsAndApplications = async () => {
      if (jobs.length > 0) {
        const jobIds = jobs.map((job) => job._id);
        const appsData = await fetchApplications(jobIds);

        // Ensure we have an entry for each job, even if no applications
        const updatedApps = { ...applications };
        jobIds.forEach((id) => {
          if (!updatedApps[id]) {
            updatedApps[id] = [];
          }
        });

        setApplications({
          ...updatedApps,
          ...appsData,
        });
      }
    };

    updateJobsAndApplications();
  }, [jobs]);

  // Initial fetch of jobs
  useEffect(() => {
    fetchJobs();
  }, [companyId]);

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

  const markCompleted = async (jobId, e) => {
    e.stopPropagation();
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

      toast({
        title: "Success",
        description: "Job marked as completed",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job status",
        variant: "destructive",
      });
    }
  };

  const handleEditJob = (job, e) => {
    e.stopPropagation();
    setEditingJob(job);
    setIsEditModalOpen(true);
  };

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this job?")) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/gigs`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: jobId }),
      });

      if (!response.ok) throw new Error("Failed to delete job");

      setJobs((prev) => prev.filter((job) => job._id !== jobId));

      toast({
        title: "Success",
        description: "Job deleted successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingJob) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/gigs`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingJob),
      });

      if (!response.ok) throw new Error("Failed to update job");

      setJobs((prev) =>
        prev.map((job) =>
          job._id === editingJob._id ? { ...editingJob } : job
        )
      );

      setIsEditModalOpen(false);
      toast({
        title: "Success",
        description: "Job updated successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating job:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditingJob((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  console.log("Rendering with jobs:", jobs, "Filtered jobs:", filteredJobs);

  return (
    <div className="min-h-screen text-white overflow-hidden p-6 bg-transparent lg:ml-64">
      <div className="flex justify-between items-center mb-4">
        <div className="h-[34px]"></div>
      </div>
      <div className="flex h-[calc(100vh-120px)] gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden py-0">
          <div className="flex items-center justify-between mb-6 mt-0">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setActiveFilter("all")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "all"
                    ? "bg-black text-white hover:bg-gray-800 border-gray-600 hover:text-white"
                    : "bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                All Jobs {counts.all}
              </Button>
              <Button
                onClick={() => setActiveFilter("active")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "active"
                    ? "bg-black text-white hover:bg-gray-800 border-gray-600 hover:text-white"
                    : "bg-transparent border-gray-600 text-black hover:bg-gray-800 hover:text-white"
                }`}
              >
                Active {counts.active}
              </Button>
              <Button
                onClick={() => setActiveFilter("completed")}
                variant="outline"
                className={`px-8 py-2 rounded-lg text-sm font-extralight transition-colors ${
                  activeFilter === "completed"
                    ? "bg-black text-white hover:bg-gray-800 border-gray-600 hover:text-white"
                    : "bg-transparent border-gray-600 text-black hover:bg-gray-800 hover:text-white"
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
          <div className="grid grid-cols-3 gap-4 overflow-y-auto scrollbar-hide h-[calc(100vh-10vh-140px)] content-start items-start auto-rows-max">
            {isLoading ? (
              <div className="col-span-3 flex flex-col items-center justify-center min-h-[300px] space-y-4">
                <Ripples size={60} speed={2} color="#000000" />
                <p className="text-gray-400">Loading your zigs...</p>
              </div>
            ) : error ? (
              <div className="col-span-3 flex flex-col items-center justify-center min-h-[300px] space-y-4 p-6 text-center">
                <div className="bg-red-500/10 p-4 rounded-full">
                  <Zap className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-medium text-white">
                  Something went wrong
                </h3>
                <p className="text-gray-400 max-w-md">{error}</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-2 bg-[#5E17EB] hover:bg-[#5E17EB]/90"
                >
                  Try Again
                </Button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-3 flex flex-col items-center justify-center min-h-[300px] space-y-4 p-6 text-center">
                <div className="bg-skill p-4 rounded-full">
                  <Zap className="w-8 h-8 text-skillText" />
                </div>
                <h3 className="text-xl font-bold text-skill">No zigs yet</h3>
                <p className="text-skill max-w-md">
                  You haven't posted any zigs yet. Create your first zig to get
                  started.
                </p>
                <Button
                  onClick={() => router.push("/companies/post-gig")}
                  className="mt-2 bg-skill hover:bg-skill/90 text-skillText font-bold"
                >
                  Post Your First Zig
                </Button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                // Ensure job has the correct company name structure
                const jobWithCompany = {
                  ...job,
                  companyName:
                    job.company?.companyName ||
                    job.company?.name ||
                    job.companyName,
                  company:
                    job.company ||
                    (job.companyId
                      ? { _id: job.companyId, companyName: job.companyName }
                      : null),
                };

                // Debug log
                console.log(`Rendering job ${job._id}:`, {
                  job,
                  applications: job.applications,
                  companyName: jobWithCompany.companyName,
                  company: jobWithCompany.company,
                });
                console.log("smack test", job);

                return (
                  <JobCard
                    key={job._id}
                    job={jobWithCompany}
                    applications={applications[job._id] || []}
                    handleEditJob={handleEditJob}
                    handleDeleteJob={handleDeleteJob}
                    markCompleted={markCompleted}
                    isDeleting={isDeleting}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Edit Job Modal */}
      {isEditModalOpen && editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Edit Job</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <Input
                  name="gigTitle"
                  value={editingJob.gigTitle}
                  onChange={handleInputChange}
                  className="w-full text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  name="description"
                  value={editingJob.description}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment
                  </label>
                  <Input
                    name="payment"
                    value={editingJob.payment}
                    readOnly
                    className="w-full text-gray-500 bg-gray-100 hover:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Openings
                  </label>
                  <Input
                    name="openings"
                    type="number"
                    value={editingJob.openings}
                    onChange={handleInputChange}
                    className="w-full text-black"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skills
                </label>
                <SkillsCombobox
                  value={
                    Array.isArray(editingJob.skills) ? editingJob.skills : []
                  }
                  onChange={(skills) => {
                    setEditingJob((prev) => ({
                      ...prev,
                      skills: skills,
                    }));
                  }}
                  placeholder="Select required skills..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSaving}
                  className="text-black"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className="bg-[#5E17EB] hover:bg-[#4A12C4]"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
