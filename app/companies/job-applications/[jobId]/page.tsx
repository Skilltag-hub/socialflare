"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Check,
  X,
  Eye,
  FileText,
  Send,
  Clock,
  ArrowLeft,
  FunnelPlus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ApplicationStatus =
  | "applied"
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "completed";

interface Applicant {
  _id: string;
  email: string;
  name?: string;
  status: ApplicationStatus;
  appliedAt: string;
  profileImage?: string;
  // Add any other applicant fields from waitlist.gigs
}

interface Job {
  _id: string;
  companyName: string;
  description: string;
  datePosted: string;
  status: string;
  applicants: Applicant[];
  // Additional fields from waitlist.gigs
  openings?: number;
  payment?: string;
  skills?: string[];
  aboutCompany?: string;
}

interface UserData {
  _id: string;
  email: string;
  name?: string;
  profileImage?: string;
}

type UserDataWithDefault =
  | UserData
  | { email: string; name?: undefined; profileImage?: undefined };

export default function CompaniesJobApplicationsPage({
  params,
}: {
  params: { jobId: string };
}) {
  const [activeTab, setActiveTab] = useState<ApplicationStatus>("pending");
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDataMap, setUserDataMap] = useState<
    Record<string, UserData | null>
  >({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      setJobId(resolvedParams.jobId);
    }
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (!jobId) return;

    async function fetchJob() {
      try {
        setLoading(true);
        const res = await fetch(`/api/gigs/${jobId}`);
        if (!res.ok)
          throw new Error(
            `Failed to fetch job: ${res.status} ${res.statusText}`
          );

        const response = await res.json();
        const gigData = response.gig || response; // Handle both { gig: {...} } and direct response

        console.log("Raw API Response:", JSON.stringify(response, null, 2));
        console.log("Processed Gig Data:", JSON.stringify(gigData, null, 2));
        console.log(
          "Applications array:",
          JSON.stringify(gigData.applications || [], null, 2)
        );

        // Transform the data to match our Job interface
        const jobData: Job = {
          _id: gigData._id,
          companyName: gigData.companyName,
          description: gigData.description,
          datePosted: gigData.datePosted,
          status: gigData.status || "applied",
          // Map applications to applicants format with real user data
          applicants: [],
          openings: gigData.openings,
          payment: gigData.payment,
          skills: gigData.skills || [],
          aboutCompany: gigData.aboutCompany || "",
        };

        // Fetch real user data for each applicant
        const newUserDataMap: Record<string, UserData | null> = {};
        const applicantsWithUserData: Applicant[] = [];

        if (gigData.applications && gigData.applications.length > 0) {
          for (const app of gigData.applications) {
            try {
              // Fetch user data by userId
              const userRes = await fetch(`/api/user/${app.userId}`);
              let userData: UserData | null = null;

              if (userRes.ok) {
                userData = await userRes.json();
                console.log(`Fetched user data for ${app.userId}:`, userData);
              } else {
                console.warn(
                  `Failed to fetch user data for ${app.userId}:`,
                  userRes.status
                );
              }

              // Create applicant with real user data or fallback
              const appId =
                app._id?.toString() ||
                `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const applicant: Applicant = {
                _id: app.userId,
                email: userData?.email || `user-${app.userId}@example.com`,
                name: userData?.name || "Unknown User",
                status: app.status || "applied",
                appliedAt: app.timeApplied
                  ? new Date(app.timeApplied).toISOString()
                  : new Date().toISOString(),
                profileImage: userData?.profileImage || "",
              };

              applicantsWithUserData.push(applicant);

              // Store user data in map using email as key
              if (applicant.email) {
                newUserDataMap[applicant.email] = userData;
              }
            } catch (error) {
              console.error(
                `Error fetching user data for ${app.userId}:`,
                error
              );

              // Add applicant with fallback data if user fetch fails
              const appId =
                app._id?.toString() ||
                `app-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
              const fallbackApplicant: Applicant = {
                _id: app.userId,
                email: `user-${app.userId}@example.com`,
                name: "Unknown User",
                status: app.status || "applied",
                appliedAt: app.timeApplied
                  ? new Date(app.timeApplied).toISOString()
                  : new Date().toISOString(),
                profileImage: "",
              };

              applicantsWithUserData.push(fallbackApplicant);
              newUserDataMap[fallbackApplicant.email] = null;
            }
          }
        }

        jobData.applicants = applicantsWithUserData;
        setJob(jobData);
        setUserDataMap(newUserDataMap);
      } catch (error) {
        console.error("Error fetching job:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [jobId]);

  // Debug: Log job data and filtered applicants
  useEffect(() => {
    if (job?.applicants) {
      console.log("Job data:", job);
      console.log(
        "All applicants with statuses:",
        job.applicants.map((app) => ({
          id: app._id,
          email: app.student?.email,
          status: app.status,
          studentStatus: app.student?.status,
          appliedAt: app.appliedAt,
        }))
      );
      console.log("Active tab:", activeTab);

      const filtered = job.applicants.filter(
        (applicant) => applicant.status === activeTab
      );
      console.log("Filtered applicants:", filtered);

      // Log why applicants might be filtered out
      job.applicants.forEach((applicant) => {
        console.log(
          `Applicant ${applicant._id} status: ${
            applicant.status
          }, matches active tab: ${applicant.status === activeTab}`
        );
      });
    }
  }, [job, activeTab]);

  // Debug: Log all status values
  useEffect(() => {
    if (job?.applicants) {
      console.log(
        "All applicants with statuses:",
        job.applicants.map((app) => ({
          id: app._id,
          email: app.student?.email,
          status: app.status,
          studentStatus: app.student?.status,
          appliedAt: app.appliedAt,
        }))
      );
      console.log("Active tab:", activeTab);
    }
  }, [job, activeTab]);

  // Map UI status to database status
  const getStatusForTab = (tab: ApplicationStatus): string => {
    // Map 'applied' tab to 'pending' status in the database
    if (tab === "applied") return "pending";
    return tab;
  };

  // Filter applicants based on active tab
  const filteredApplicants =
    job?.applicants?.filter((applicant) => {
      const matches =
        (activeTab === "applied" && applicant.status === "applied") ||
        (activeTab === "shortlisted" && applicant.status === "shortlisted") ||
        (activeTab === "accepted" && applicant.status === "accepted") ||
        (activeTab === "rejected" && applicant.status === "rejected") ||
        (activeTab === "submitted" && applicant.status === "completed");

      console.log("Applicant:", {
        id: applicant._id,
        status: applicant.status,
        activeTab,
        matches,
        name: applicant.name || "No name",
        email: applicant.email || "No email",
      });

      return matches;
    }) || [];

  console.log("Filtered Applicants:", {
    activeTab,
    count: filteredApplicants.length,
    allApplicants:
      job?.applicants?.map((a) => ({
        id: a._id,
        status: a.status,
        name: a.name || "No name",
        email: a.email || "No email",
      })) || [],
  });

  const getTabCount = (status: ApplicationStatus) => {
    return (
      job?.applicants?.filter(
        (applicant) => applicant.status === getStatusForTab(status)
      ).length || 0
    );
  };

  const handleViewApplication = async (userId: string) => {
    try {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user profile");
      const userData = await res.json();
      if (userData?._id) {
        window.location.href = `/profile/${userData._id}`;
      }
    } catch (error) {
      console.error("Error viewing application:", error);
    }
  };

  async function handleStatusUpdate(
    applicantId: string,
    newStatus: ApplicationStatus
  ) {
    try {
      const res = await fetch(`/api/gigs/${jobId}/applications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: applicantId,
          status: newStatus,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to update status: ${res.statusText}`);
      }

      // Refresh the job data to get updated applicant statuses
      await fetchJob();
    } catch (error) {
      console.error("Error updating applicant status:", error);
      // You might want to show a toast notification here
    }
  }

  async function handleViewSubmission(applicantId: string) {
    try {
      console.log("handleViewSubmission called with applicantId:", applicantId);
      console.log("Current jobId:", jobId);

      // Fetch the gig data to get the submission from the applications array
      const res = await fetch(`/api/gigs/${jobId}`);
      console.log("API response status:", res.status);

      if (!res.ok) {
        throw new Error(`Failed to fetch gig data: ${res.statusText}`);
      }

      const response = await res.json();
      const gigData = response.gig || response;
      console.log("Gig data received:", gigData);
      console.log("Applications array:", gigData.applications);

      // Find the application for this applicant
      const application = gigData.applications?.find(
        (app: any) => app.userId === applicantId
      );
      console.log("Found application:", application);

      if (
        application &&
        application.submissions &&
        Array.isArray(application.submissions) &&
        application.submissions.length > 0
      ) {
        console.log("Submissions found:", application.submissions);

        // Get user name from userDataMap using userId
        const userData = Object.values(userDataMap).find(
          (user) => user?._id === applicantId
        );
        const applicantName = userData?.name || "Unknown User";

        const submissionData = {
          applicantId,
          submission: application.submissions, // Keep as array
          applicantName,
        };
        console.log("Setting submission data:", submissionData);
        setSelectedSubmission(submissionData);
        setShowSubmissionModal(true);
        console.log("Modal should now be visible");
      } else {
        console.warn("No submissions found for this applicant");
        console.log("Application object:", application);
        console.log("Submissions field:", application?.submissions);

        // Get user name from userDataMap using userId
        const userData = Object.values(userDataMap).find(
          (user) => user?._id === applicantId
        );
        const applicantName = userData?.name || "Unknown User";

        // Show modal anyway for debugging
        setSelectedSubmission({
          applicantId,
          submission: [],
          applicantName,
        });
        setShowSubmissionModal(true);
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    }
  }

  function handleSendTask(applicantId: string) {
    // Implement task sending logic here
    console.log("Sending task to applicant:", applicantId);
    // You might want to open a modal or navigate to a task creation page
  }
  const tabs = [
    { key: "applied" as const, label: "Applied" }, // more accurate labeling
    { key: "shortlisted" as const, label: "Shortlisted" },
    { key: "accepted" as const, label: "Accepted" },
    { key: "rejected" as const, label: "Rejected" },
    { key: "submitted" as const, label: "Submitted" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen">
        Job not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="mb-6">
        <Link
          href="/companies/my-zigs"
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-white text-black rounded-xl shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold mb-2">{job.gigTitle}</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            <div className="flex items-center gap-6 mb-8">
              <div className="flex items-center gap-1 text-[#5E17EB]">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {job.applicants?.length || 0} Applicants
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {new Date(job.datePosted).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab.key
                      ? "text-[#5E17EB] border-b-2 border-[#5E17EB]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                  {getTabCount(tab.key) > 0 && (
                    <span className="ml-1 text-xs">
                      ({getTabCount(tab.key)})
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto mb-6">
              {filteredApplicants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No applicants in this category yet.
                </div>
              ) : (
                filteredApplicants.map((applicant, index) => {
                  const email = applicant.email || "";
                  const userData =
                    userDataMap[email] ||
                    ({
                      _id: applicant._id,
                      email,
                      name: applicant.name,
                    } as UserData);
                  const displayName =
                    userData.name || applicant.name || "Unknown User";
                  const profileImage =
                    userData.profileImage || applicant.profileImage || "";
                  const appliedDate = applicant.appliedAt
                    ? new Date(applicant.appliedAt).toLocaleDateString()
                    : "N/A";

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {profileImage ? (
                          <Image
                            src={profileImage}
                            alt={displayName}
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            {displayName?.[0]?.toUpperCase() || "?"}
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {displayName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Applied {appliedDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          className="text-sm px-4 py-1 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                          onClick={() => handleViewApplication(applicant._id)}
                        >
                          View Profile
                        </Button>
                        {/* Show View Submission button for completed applications under submitted tab */}
                        {activeTab === "submitted" &&
                        applicant.status === "completed" ? (
                          <Button
                            variant="outline"
                            className="text-sm px-4 py-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                            onClick={() => handleViewSubmission(applicant._id)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Submission
                          </Button>
                        ) : activeTab === "accepted" &&
                          applicant.status === "accepted" ? (
                          /* Show Send Task button for accepted applications */
                          <Button
                            variant="outline"
                            className="text-sm px-4 py-1 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                            onClick={() => handleSendTask(applicant._id)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Task
                          </Button>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      applicant._id,
                                      "shortlisted"
                                    )
                                  }
                                  variant="outline"
                                  className="bg-white hover:bg-yellow-500 text-yellow-500 hover:text-white transition-colors p-2 rounded-full"
                                  aria-label="Shortlist"
                                >
                                  <FunnelPlus className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Shortlist</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      applicant._id,
                                      "accepted"
                                    )
                                  }
                                  className="bg-white hover:bg-green-500 text-green-500 hover:text-white transition-colors p-2 rounded-full"
                                  aria-label="Accept"
                                >
                                  <Check className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Accept</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger>
                                <Button
                                  onClick={() =>
                                    handleStatusUpdate(
                                      applicant._id,
                                      "rejected"
                                    )
                                  }
                                  variant="outline"
                                  className="bg-white hover:bg-red-500 text-red-500 hover:text-white transition-colors p-2 rounded-full"
                                  aria-label="Reject"
                                >
                                  <X className="w-5 h-5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submission Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Submission by {selectedSubmission.applicantName}
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowSubmissionModal(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {/* Display first submission only */}
              {Array.isArray(selectedSubmission.submission) &&
              selectedSubmission.submission.length > 0 ? (
                (() => {
                  const firstSubmission = selectedSubmission.submission[0];
                  const fileUrl = firstSubmission.fileUrl;
                  const isImage =
                    fileUrl && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileUrl);
                  const isPdf = fileUrl && /\.pdf$/i.test(fileUrl);
                  const submittedDate = firstSubmission.submittedAt
                    ? new Date(firstSubmission.submittedAt).toLocaleString()
                    : "Unknown";

                  return (
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                      {/* Submission Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {firstSubmission.title || "Untitled Submission"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Submitted on {submittedDate}
                          </p>
                        </div>
                        {selectedSubmission.submission.length > 1 && (
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            +{selectedSubmission.submission.length - 1} more
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {firstSubmission.description && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Description:
                          </h4>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded">
                            {firstSubmission.description}
                          </p>
                        </div>
                      )}

                      {/* UPI Details */}
                      {(firstSubmission.upiId || firstSubmission.upiName) && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Payment Details:
                          </h4>
                          <div className="bg-gray-50 p-3 rounded space-y-1">
                            {firstSubmission.upiName && (
                              <p className="text-sm">
                                <span className="font-medium">UPI Name:</span>{" "}
                                {firstSubmission.upiName}
                              </p>
                            )}
                            {firstSubmission.upiId && (
                              <p className="text-sm">
                                <span className="font-medium">UPI ID:</span>{" "}
                                {firstSubmission.upiId}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* File Viewer */}
                      {fileUrl && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Submission File:
                          </h4>
                          <div className="border border-gray-200 rounded-lg overflow-hidden">
                            {isImage ? (
                              <div className="relative">
                                <img
                                  src={fileUrl}
                                  alt="Submission"
                                  className="w-full max-h-96 object-contain bg-gray-50"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                    (
                                      e.target as HTMLImageElement
                                    ).nextElementSibling?.classList.remove(
                                      "hidden"
                                    );
                                  }}
                                />
                                <div className="hidden p-4 text-center text-gray-500">
                                  Failed to load image
                                </div>
                              </div>
                            ) : isPdf ? (
                              <div className="bg-gray-50 p-4">
                                <iframe
                                  src={fileUrl}
                                  className="w-full h-96 border-0"
                                  title="PDF Viewer"
                                />
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                <p>File preview not available</p>
                              </div>
                            )}

                            {/* Download/View Link */}
                            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Full File
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No submissions available for this applicant
                </div>
              )}
            </div>

            <div className="flex justify-end mt-6">
              <Button
                onClick={() => setShowSubmissionModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
