"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
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
  CheckCircle,
  DollarSign,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type ApplicationStatus =
  | "applied"
  | "pending"
  | "shortlisted"
  | "accepted"
  | "rejected"
  | "completed"
  | "withdrawal_requested"
  | "withdrawal_processed"
  | "work_accepted"
  | "work_rejected";

interface Applicant {
  _id: string;
  email: string;
  name?: string;
  status: ApplicationStatus;
  appliedAt: string;
  profileImage?: string;
  upiId?: string;
  upiName?: string;
  // Add any other applicant fields from waitlist.gigs
}

interface Company {
  _id: string;
  companyName: string;
  // Add other company fields as needed
}

interface Job {
  _id: string;
  companyId?: string;
  company?: Company | null;
  companyName?: string;
  gigTitle?: string;
  title?: string;
  description: string;
  datePosted: string;
  status: string;
  applicants: Applicant[];
  openings?: number;
  payment?: string;
  stipend?: string;
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
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [applicationState, setApplicationState] = useState<Record<string, ApplicationStatus>>({});
  const [userDataMap, setUserDataMap] = useState<
    Record<string, UserData | null>
  >({});
  const [jobId, setJobId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<{
    applicantId: string;
    upiId?: string;
    upiName?: string;
    name?: string;
  }>({
    applicantId: "",
    upiId: "",
    upiName: "",
    name: "",
  });

  useEffect(() => {
    async function initializeParams() {
      const resolvedParams = await params;
      setJobId(resolvedParams.jobId);
    }
    initializeParams();
  }, [params]);

  // Define fetchJob outside of useEffect so it can be called from other functions
  const fetchCompanyDetails = async (companyId: string) => {
    if (!companyId) return null;
    
    try {
      const res = await fetch(`/api/companies/${companyId}`);
      if (!res.ok) {
        console.error(`Failed to fetch company details: ${res.status} ${res.statusText}`);
        return null;
      }
      const data = await res.json();
      return data.company || data; // Handle both { company: {...} } and direct response
    } catch (error) {
      console.error('Error fetching company details:', error);
      return null;
    }
  };

  const fetchJob = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/gigs/${jobId}`);
      if (!res.ok)
        throw new Error(`Failed to fetch job: ${res.status} ${res.statusText}`);

      const response = await res.json();
      console.log('Raw API Response:', JSON.stringify(response, null, 2));
      
      // The API now returns { gig: {...} } with company data included
      const gigData = response.gig || response;
      console.log('Raw gig data:', JSON.stringify(gigData, null, 2));
      
      // The API now handles the special case where companyName is the job title
      const jobTitle = gigData.title || gigData.gigTitle || "Untitled Gig";
      console.log('Using job title:', jobTitle);
      
      // Log company data for debugging
      console.log('Company data from API:', gigData.company);
      console.log('Company name from API:', gigData.company?.companyName);

      console.log("Raw API Response:", JSON.stringify(response, null, 2));
      console.log("Processed Gig Data:", JSON.stringify(gigData, null, 2));
      console.log(
        "Applications array:",
        JSON.stringify(gigData.applications || [], null, 2)
      );

      // Transform the data to match our Job interface
      const jobData: Job = {
        _id: gigData._id,
        title: jobTitle,
        gigTitle: jobTitle,
        companyId: gigData.company?._id || gigData.companyId,
        company: gigData.company || null,
        companyName: gigData.company?.companyName || "",
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
              upiId:
                app.withdrawals && app.withdrawals.length > 0
                  ? app.withdrawals[0].upiId
                  : "",
              upiName:
                app.withdrawals && app.withdrawals.length > 0
                  ? app.withdrawals[0].upiName
                  : "",
            };

            applicantsWithUserData.push(applicant);

            // Store user data in map using email as key
            if (applicant.email) {
              newUserDataMap[applicant.email] = userData;
            }
          } catch (error) {
            console.error(`Error fetching user data for ${app.userId}:`, error);

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
              upiId:
                app.withdrawals && app.withdrawals.length > 0
                  ? app.withdrawals[0].upiId
                  : "",
              upiName:
                app.withdrawals && app.withdrawals.length > 0
                  ? app.withdrawals[0].upiName
                  : "",
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
  };

  useEffect(() => {
    if (!jobId) return;
    fetchJob();
  }, [jobId]);

  // Debug: Log job data and filtered applicants
  useEffect(() => {
    if (job) {
      console.log("Job data:", job);
      if (job.applicants) {
        console.log(
          "All applicants with statuses:",
          job.applicants.map((app) => ({
            id: app._id,
            email: app.email,
            status: app.status,
            name: app.name,
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
            `Applicant ${applicant._id} (${applicant.name || 'No name'}) status: ${
              applicant.status
            }, matches active tab: ${applicant.status === activeTab}`
          );
        });
      } else {
        console.log("No applicants array in job data");
      }
    } else {
      console.log("Job data not loaded yet");
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

  // Show toast notification
  const showToast = (
    message: string,
    type: "success" | "error" | "info" = "info"
  ) => {
    const style = {
      success: { background: "green", color: "white" },
      error: { background: "red", color: "white" },
      info: { background: "blue", color: "white" },
    }[type];

    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "4px";
    toast.style.color = style.color;
    toast.style.backgroundColor = style.background;
    toast.style.zIndex = "1000";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    toast.style.transition = "opacity 0.3s ease-in-out";

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  // Filter applicants based on active tab and merge with persisted state
  const filteredApplicants = job?.applicants?.length 
    ? job.applicants
        .map((applicant) => {
          const persistedStatus = applicationState[`${job._id}_${applicant._id}`];
          return {
            ...applicant,
            // Use persisted status if available, otherwise fallback to server status
            status: persistedStatus || applicant.status,
          };
        })
        .filter((applicant) => applicant.status === activeTab)
    : [];

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
    if (!job?.applicants?.length) return 0;
    return (
      job.applicants.filter(
        (applicant) => applicant.status === getStatusForTab(status)
      ).length || 0
    );
  };

  const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});

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

  // Handle status updates for applications
  const handleStatusUpdate = async (
    applicantId: string,
    newStatus: ApplicationStatus
  ) => {
    if (!job) return;

    try {
      // Update local state immediately for better UX
      const updatedApplicants = job.applicants.map((applicant) =>
        applicant._id === applicantId
          ? { ...applicant, status: newStatus }
          : applicant
      );

      setJob({
        ...job,
        applicants: updatedApplicants,
      });

      // Update application state in localStorage
      setApplicationState((prev) => ({
        ...prev,
        [`${job._id}_${applicantId}`]: newStatus,
      }));

      // Send API request to update status
      const response = await fetch(`/api/jobs/${job._id}/applications`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update application status");
        // Revert local state if API call fails
        setJob(job);
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      // Revert local state on error
      setJob(job);
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

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  async function handlePaymentProcess(applicantId: string) {
    try {
      setIsProcessingPayment(true);

      // Update the status to withdrawal_processed
      const res = await fetch(`/api/gigs/${jobId}/applications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: applicantId,
          status: "withdrawal_processed",
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to process payment: ${res.statusText}`
        );
      }

      // Show success message
      showToast("Payment processed successfully", "success");

      // Close the payment modal
      setShowPaymentModal(false);

      // Refresh the job data to get updated applicant statuses
      await fetchJob();
    } catch (error) {
      console.error("Error processing payment:", error);
      showToast(
        error instanceof Error ? error.message : "Failed to process payment",
        "error"
      );
    } finally {
      setIsProcessingPayment(false);
    }
  }

  function handleShowPaymentModal(applicant: Applicant) {
    // Get user data from userDataMap
    const email = applicant.email || "";
    const userData = userDataMap[email] || {
      _id: applicant._id,
      email,
      name: applicant.name,
    };
    const displayName = userData.name || applicant.name || "Unknown User";

    // Set the selected payment data
    setSelectedPayment({
      applicantId: applicant._id,
      upiId: applicant.upiId || "",
      upiName: applicant.upiName || "",
      name: displayName,
    });

    // Show the payment modal
    setShowPaymentModal(true);
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
        <div className="animate-pulse flex flex-col items-center space-y-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist or has been removed.</p>
          <Link 
            href="/companies/my-zigs" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to My Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">  
          <Link
            href="/companies/my-zigs"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
        <Card className="bg-white text-black rounded-xl shadow-lg">
          <CardContent className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {job.title || 'Job Details'}
                  </h2>
                  <p className="text-lg font-medium text-gray-700">
                    {job.company?.companyName || job.companyName || 'Company not specified'}
                  </p>
                  {(job.payment || job.stipend) && (
                    <p className="text-green-600 font-medium mt-1">
                      {job.stipend
                        ? `Stipend: ₹${job.stipend}`
                        : `Stipend: ₹${job.payment}`}
                    </p>
                  )}
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Posted:</span>{" "}
                    {new Date(job.datePosted).toLocaleDateString()}
                  </p>
                  {job.openings && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Openings:</span> {job.openings}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="font-medium text-gray-900 mb-2">Job Description:</h3>
                <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
              </div>
              {job.skills && job.skills.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Skills Required:</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
              {!job ? (
                <div className="text-center py-8 text-gray-500">
                  Loading job details...
                </div>
              ) : filteredApplicants.length === 0 ? (
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
                        {/* Show different buttons based on application status */}
                        {activeTab === "submitted" &&
                        applicant.status === "completed" ? (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              className="text-sm px-3 py-1 border-blue-300 text-blue-700 hover:bg-blue-50 bg-transparent"
                              onClick={() =>
                                handleViewSubmission(applicant._id)
                              }
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant._id,
                                        "work_accepted"
                                      )
                                    }
                                    className="bg-white hover:bg-green-500 text-green-500 hover:text-white transition-colors p-1.5 rounded-full"
                                    aria-label="Accept Work"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Accept Work</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    onClick={() =>
                                      handleStatusUpdate(
                                        applicant._id,
                                        "work_rejected"
                                      )
                                    }
                                    variant="outline"
                                    className="bg-white hover:bg-red-500 text-red-500 hover:text-white transition-colors p-1.5 rounded-full"
                                    aria-label="Reject Work"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Reject Work</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        ) : activeTab === "submitted" &&
                          applicant.status === "withdrawal_requested" ? (
                          <Button
                            variant="outline"
                            className="text-sm px-4 py-1 border-green-300 text-green-700 hover:bg-green-50 bg-transparent"
                            onClick={() => handleShowPaymentModal(applicant)}
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Process Payment
                          </Button>
                        ) : activeTab === "submitted" &&
                          applicant.status === "withdrawal_processed" ? (
                          <Button
                            variant="outline"
                            disabled
                            className="text-sm px-4 py-1 border-gray-300 text-gray-500 bg-gray-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Payment Processed
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
                              <p className="text-sm text-gray-900">
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

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          style={{ zIndex: 9999 }}
        >
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Process Payment
              </h2>
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Payment Details
                    </h3>
                    <p className="text-sm text-gray-500">
                      For {selectedPayment.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedPayment.upiId && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        UPI ID
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedPayment.upiId}
                      </p>
                    </div>
                  )}

                  {selectedPayment.upiName && (
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        UPI Name
                      </p>
                      <p className="text-base text-gray-900">
                        {selectedPayment.upiName}
                      </p>
                    </div>
                  )}

                  {!selectedPayment.upiId && !selectedPayment.upiName && (
                    <div className="bg-yellow-50 p-3 rounded text-yellow-700">
                      <p>No payment details available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                className="border-gray-300"
              >
                Cancel
              </Button>
              <Button
                onClick={() =>
                  handlePaymentProcess(selectedPayment.applicantId)
                }
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={!selectedPayment.upiId && !selectedPayment.upiName}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Confirm Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
