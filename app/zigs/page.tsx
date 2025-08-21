"use client";
import { upload } from "@imagekit/next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
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
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";

import { signOut, useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export default function Component() {
  const [applications, setApplications] = useState<any[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("applied");
  const [showFilter, setShowFilter] = useState(false);
  const [filterCompany, setFilterCompany] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");

  const router = useRouter();
  const { data: session, status } = useSession();

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  // Define filter tabs with dynamic counts
  const getFilterTabs = () => [
    { label: "Applied", status: "applied", active: activeFilter === "applied" },
    {
      label: "Shortlisted",
      status: "shortlisted",
      active: activeFilter === "shortlisted",
    },
    {
      label: "Accepted",
      status: "accepted",
      active: activeFilter === "accepted",
    },
    {
      label: "Rejected",
      status: "rejected",
      active: activeFilter === "rejected",
    },
    {
      label: "Completed",
      status: "completed",
      active: activeFilter === "completed",
    },
  ];

  // Define fetchApplications function outside useEffect for reuse
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
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications from API on component mount
  useEffect(() => {
    fetchApplications();
  }, [status, toast]); // Include toast in dependencies since fetchApplications uses it

  // Filter applications based on active filter
  useEffect(() => {
    if (applications.length === 0) {
      setFilteredApplications([]);
      return;
    }

    const parsePrice = (payment: string | undefined): number => {
      if (!payment) return 0;
      const num = Number(String(payment).replace(/[^0-9.]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    const normalizedCompany = filterCompany.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : undefined;
    const max = maxPrice ? Number(maxPrice) : undefined;
    const normalizedType = jobType.trim().toLowerCase();

    const filtered = applications.filter((app) => {
      // status filter
      const statusOk =
        activeFilter === "completed"
          ? [
              "completed",
              "work_accepted",
              "work_rejected",
              "withdrawal_requested",
              "withdrawal_processed",
            ].includes(app.status)
          : app.status === activeFilter;

      if (!statusOk) return false;

      const gig = app.gig || {};

      // company filter
      if (
        normalizedCompany &&
        !(gig.companyName || "").toLowerCase().includes(normalizedCompany)
      ) {
        return false;
      }

      // price filter
      const price = parsePrice(gig.payment);
      if (min !== undefined && price < min) return false;
      if (max !== undefined && price > max) return false;

      // type/category filter
      if (
        normalizedType &&
        !(gig.category || "").toLowerCase().includes(normalizedType)
      ) {
        return false;
      }

      return true;
    });

    setFilteredApplications(filtered);
  }, [applications, activeFilter, filterCompany, minPrice, maxPrice, jobType]);

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

  // Function to truncate description text
  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength);
  };

  const JobCard = ({ application }: { application: any }) => {
    const gig = application?.gig || {};
    const appliedAt = application?.appliedAt
      ? getRelativeTime(application.appliedAt)
      : "";
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [submissionTitle, setSubmissionTitle] = useState("");
    const [submissionDesc, setSubmissionDesc] = useState("");
    const [submissionFile, setSubmissionFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [withdrawUpiId, setWithdrawUpiId] = useState("");
    const [withdrawUpiName, setWithdrawUpiName] = useState("");
    const [withdrawAgree, setWithdrawAgree] = useState(false);

    async function handleSubmitSubmission(e: React.FormEvent) {
      e.preventDefault();
      if (!submissionFile) return;
      setIsSubmitting(true);
      try {
        // 1. Get ImageKit upload auth params
        const authRes = await fetch("/api/upload-auth");
        if (!authRes.ok) throw new Error("Failed to get upload auth params");
        const { signature, expire, token, publicKey } = await authRes.json();

        // 2. Upload file directly to ImageKit
        const uploadRes = await upload({
          expire,
          token,
          signature,
          publicKey,
          file: submissionFile,
          fileName: submissionFile.name,
        });
        const url = uploadRes.url;
        if (!url) throw new Error("File upload failed");

        // 3. Attach submission to gig application in waitlist.gigs
        const patchRes = await fetch("/api/applications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gigId: application.gigId,
            action: "submitWork",
            submission: {
              title: submissionTitle,
              description: submissionDesc,
              notes: submissionDesc,
              fileUrl: url,
              submittedAt: new Date().toISOString(),
            },
          }),
        });
        if (!patchRes.ok) throw new Error("Failed to save submission");
        setShowSubmitModal(false);
        setSubmissionTitle("");
        setSubmissionDesc("");
        setSubmissionFile(null);
        setIsSubmitting(false);
        toast.success("Work submitted!", {
          style: { background: "green", border: "none", color: "white" },
        });

        // Refresh applications data to update UI immediately
        await fetchApplications();
      } catch (err) {
        setIsSubmitting(false);
        toast.error((err as any).message, {
          style: { background: "red", border: "none", color: "white" },
        });
      }
    }

    

    const handleWithdraw = async () => {
      if (!withdrawAgree || !withdrawUpiId || !withdrawUpiName) {
        toast.error("Please fill all required fields and agree to the terms.", {
          style: { background: "red", border: "none", color: "white" },
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const response = await fetch("/api/applications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gigId: application.gigId,
            action: "withdraw",
            upiId: withdrawUpiId,
            upiName: withdrawUpiName,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to process withdrawal");
        }

        setShowWithdrawModal(false);
        setWithdrawUpiId("");
        setWithdrawUpiName("");
        setWithdrawAgree(false);

        toast.success("Withdrawal request submitted successfully!", {
          style: { background: "green", border: "none", color: "white" },
        });

        // Refresh applications data to update UI immediately
        await fetchApplications();
      } catch (error) {
        console.error("Error processing withdrawal:", error);
        toast.error("Failed to process withdrawal. Please try again.", {
          style: { background: "red", border: "none", color: "white" },
        });
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Card className="bg-white rounded-2xl shadow-sm h-[200px]">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
              <Avatar className="w-12 h-12 border-2 border-gray-200">
                <AvatarImage src={gig.companyLogo} alt={gig.companyName} />
                <AvatarFallback className="bg-yellow-400 text-black font-bold text-lg">
                  {gig.companyName.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {gig.companyName || "Company"}
              </h3>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-skill" />
                  <span>{gig.openings || 0} Openings</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-skill" />
                  <span>Applied {appliedAt}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-gray-700 text-sm h-[60px] overflow-hidden">
            <p className="leading-relaxed">
              {truncateDescription(
                gig.description || "No description available"
              )}
              {gig.description && gig.description.length > 100 && (
                <span className="inline-flex items-center ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                  ...
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1">
              <span className="text-skill text-lg">
                {gig.payment?.startsWith("$") ? "$" : "₹"}
              </span>
              <span className="text-skill font-semibold text-lg">
                {gig.payment?.replace(/[^0-9]/g, "") || "0"}
              </span>
            </div>
            {application.status === "applied" ? (
              <Button
                className="px-6 py-2 rounded-full bg-gray-300 text-gray-600 cursor-not-allowed"
                disabled
              >
                Applied
              </Button>
            ) : application.status === "accepted" ? (
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                onClick={() => setShowSubmitModal(true)}
              >
                Submit
              </Button>
            ) : application.status === "completed" ? (
              <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                Under Review
              </div>
            ) : application.status === "work_accepted" ? (
              <Button
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
                onClick={() => setShowWithdrawModal(true)}
              >
                Withdraw
              </Button>
            ) : application.status === "work_rejected" ? (
              <div className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full">
                Work Rejected
              </div>
            ) : application.status === "withdrawal_requested" ? (
              <div className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full">
                Withdrawal Requested
              </div>
            ) : application.status === "withdrawal_processed" ? (
              <div className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                Withdrawal Completed
              </div>
            ) : (
              <Button
                className="bg-skill hover:bg-purple-700 text-white px-6 py-2 rounded-full"
                disabled={application.status !== "selected"}
              >
                {application.status === "selected" ? "Start Work" : "Applied"}
              </Button>
            )}

            {/* Submit Work Modal */}
            {showSubmitModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative">
                  <button
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowSubmitModal(false)}
                    aria-label="Back"
                  >
                    &lt; Back
                  </button>
                  <h2 className="text-center font-semibold text-lg mb-6 mt-2">
                    Submit Task
                  </h2>
                  <form onSubmit={handleSubmitSubmission}>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold mb-1">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 min-h-[100px]"
                        placeholder="Add any additional notes or comments..."
                        value={submissionDesc}
                        onChange={(e) => setSubmissionDesc(e.target.value)}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-semibold mb-1">
                        File Upload
                      </label>
                      <div className="relative border-2 border-gray-300 border-dashed rounded flex flex-col items-center justify-center py-7 cursor-pointer hover:border-purple-400 transition-all">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          className="opacity-0 absolute inset-0 h-full w-full cursor-pointer"
                          onChange={(e) =>
                            setSubmissionFile(e.target.files?.[0] || null)
                          }
                          required
                        />
                        <span className="text-gray-400 text-2xl mb-2">
                          &#8682;
                        </span>
                        <span className="text-gray-500 text-sm">
                          Upload File
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center mb-6">
                      <input
                        type="checkbox"
                        id="agreement"
                        className="mr-2 accent-skill"
                        required
                      />
                      <label
                        htmlFor="agreement"
                        className="text-xs text-gray-700"
                      >
                        I agree that all information given above is genuine.
                      </label>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="bg-skill hover:bg-purple-700 text-white flex-1"
                        disabled={isSubmitting}
                      >
                        Submit
                      </Button>
                      <button
                        type="button"
                        onClick={() => setShowSubmitModal(false)}
                        className="border border-gray-400 rounded flex-1 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Withdraw Modal */}
            {showWithdrawModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
                <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm w-full relative">
                  <button
                    className="absolute top-3 left-3 text-gray-400 hover:text-gray-700"
                    onClick={() => setShowWithdrawModal(false)}
                    aria-label="Back"
                  >
                    &lt; Back
                  </button>
                  <h2 className="text-center font-semibold text-lg mb-6 mt-2">
                    Withdraw Earnings
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        UPI ID *
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="Enter UPI ID"
                        value={withdrawUpiId}
                        onChange={(e) => setWithdrawUpiId(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        UPI Name *
                      </label>
                      <input
                        type="text"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        placeholder="Enter Name as per UPI"
                        value={withdrawUpiName}
                        onChange={(e) => setWithdrawUpiName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="withdrawAgree"
                        checked={withdrawAgree}
                        onChange={(e) => setWithdrawAgree(e.target.checked)}
                        className="mt-1 mr-2"
                        required
                      />
                      <label
                        htmlFor="withdrawAgree"
                        className="text-xs text-gray-700"
                      >
                        I agree that all information given above is genuine.
                      </label>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={handleWithdraw}
                        className="bg-red-600 hover:bg-red-700 text-white flex-1"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Confirm Withdraw"}
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setShowWithdrawModal(false)}
                        className="border border-gray-400 rounded flex-1 py-2 text-gray-700 hover:bg-gray-100"
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
      <div className="min-h-screen bg-gray-100 flex flex-col lg:hidden">
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-screen relative">
          <div className="fixed bottom-1 inset-x-0 z-50">
            <Navbar />
          </div>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                Good morning, {session?.user?.name || "User"}!
              </p>
              <p className="text-skill text-xl font-semibold">My Zigs</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-12 h-12 bg-gray-300">
                  <AvatarImage
                    src={session?.user?.image || ""}
                    alt={session?.user?.name || "User"}
                    className="bg-gray-300"
                  />
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleLogout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

          {/* Job Cards - Scrollable area */}
          <div className="px-4 space-y-4 pb-[100px] flex-1 overflow-y-auto">
            {loading ? (
              <div className="w-full flex items-center justify-center min-h-[300px]">
                <Ripples size={45} speed={2} color="#B4E140" />
              </div>
            ) : filteredApplications.length > 0 ? (
              filteredApplications.map((application, index) => (
                <JobCard
                  key={application._id || index}
                  application={application}
                />
              ))
            ) : (
              // Show empty state
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No {activeFilter} applications found
                  </p>
                  {activeFilter === "applied" && (
                    <Button
                      className="mt-4 bg-skill hover:bg-purple-700 text-white"
                      onClick={() => (window.location.href = "/home")}
                    >
                      Browse Jobs
                    </Button>
                  )}
                </div>
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
          {/* Filter Tabs */}
          <div className="flex items-center justify-between mb-8 relative">
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
            <div className="relative">
              <Button
                variant="outline"
                className="bg-transparent border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={() => setShowFilter((s) => !s)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              {showFilter && (
                <div className="absolute right-0 mt-2 w-80 bg-white text-black rounded-xl shadow-xl p-4 z-10">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={filterCompany}
                        onChange={(e) => setFilterCompany(e.target.value)}
                        placeholder="e.g., Acme Corp"
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Min Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">
                          Max Price
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="5000"
                          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">
                        Job Type
                      </label>
                      <input
                        type="text"
                        value={jobType}
                        onChange={(e) => setJobType(e.target.value)}
                        placeholder="e.g., design, marketing, ..."
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        className="bg-skill hover:bg-purple-700 text-white flex-1"
                        onClick={() => setShowFilter(false)}
                      >
                        Apply
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setFilterCompany("");
                          setMinPrice("");
                          setMaxPrice("");
                          setJobType("");
                        }}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center min-h-[400px]">
                <Ripples size={90} speed={2} color="#B4E140" />
              </div>
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
              <div className="col-span-3 flex items-center justify-center min-h-[400px]">
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No {activeFilter} applications found
                  </p>
                  {activeFilter === "applied" && (
                    <Button
                      className="mt-4 bg-skill hover:bg-purple-700 text-white"
                      onClick={() => (window.location.href = "/home")}
                    >
                      Browse Jobs
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
