"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Home,
  MessageCircle,
  Bell,
  Building2,
  User,
  FileText,
  Clock3,
  CheckCircle,
  Star,
  Copy,
  Github,
  Linkedin,
  File,
  Check,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

interface CompanyData {
  _id: string;
  email: string;
  googleId: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  businessEmail: string;
  companyName: string;
  companyWebsite: string;
  contactName: string;
  logoUrl: string;
}

interface ProfileComponentProps {
  userId?: string;
  hideEditButton?: boolean;
  companyData?: CompanyData | null;
}

export default function ProfileComponent({
  userId,
  hideEditButton,
  companyData,
}: ProfileComponentProps) {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [referralLink, setReferralLink] = useState("");
  const [userData, setUserData] = useState({
    name: companyData?.contactName || "",
    email: companyData?.email || "",
    image: companyData?.logoUrl || "",
    description: "",
    status: "available",
    skills: [] as string[],
    gender: "",
    dateOfBirth: "",
    phone: "",
    institution: "",
    department: "",
    graduationYear: "",
    state: "",
    referredPeople: [],
    referredBy: null as any,
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
  });
  const [referrals, setReferrals] = useState<any[]>([]);
  const [referredBy, setReferredBy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [copiedType, setCopiedType] = useState<"link" | "code" | null>(null);

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
  // Update user data when companyData changes
  useEffect(() => {
    if (companyData) {
      setUserData((prev) => ({
        ...prev,
        name: companyData.contactName,
        email: companyData.email,
        image: companyData.logoUrl,
      }));
    }
  }, [companyData]);

  // Fetch user data when session is available
  useEffect(() => {
    const fetchUserData = async () => {
      if (userId) {
        // Fetch user data by userId (public profile)
        try {
          setIsLoading(true);
          const response = await fetch(`/api/user/${userId}`);
          if (!response.ok) throw new Error("Failed to fetch user profile");
          const profileData = await response.json();
          const defaultedFields = [
            "description",
            "status",
            "skills",
            "gender",
            "dateOfBirth",
            "phone",
            "institution",
            "githubUrl",
            "linkedinUrl",
            "resumeUrl",
          ].filter((field) => {
            if (field === "skills") {
              return (
                !Array.isArray(profileData?.skills) ||
                profileData.skills.length === 0
              );
            }
            return !profileData?.[field];
          });
          console.log("Public profile data fetched", {
            userId,
            receivedKeys: Object.keys(profileData || {}),
            defaultedFields,
          });
          setUserData((prev) => ({
            ...prev,
            name: profileData.name || prev.name,
            email: profileData.email || prev.email,
            image: profileData.profileImage || prev.image,
            description: profileData.description || "",
            status: profileData.status || "available",
            skills: profileData.skills || [],
            gender: profileData.gender || "",
            dateOfBirth: profileData.dateOfBirth || "",
            phone: profileData.phone || "+91 8008000988",
            institution: profileData.institution || "",
            department: profileData.department || profileData.branch || "",
            graduationYear: profileData.graduationYear || "",
            state: profileData.state || "",
            githubUrl: profileData.githubUrl || "",
            linkedinUrl: profileData.linkedinUrl || "",
            resumeUrl: profileData.resumeUrl || "",
          }));
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else if (status === "authenticated" && session?.user) {
        try {
          // Set basic data from session
          setUserData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
            image: session.user.image || "",
          }));

          // Fetch complete profile data from API
          const response = await fetch("/api/user/profile");

          if (!response.ok) {
            throw new Error("Failed to fetch profile data");
          }

          const profileData = await response.json();

          // Update user data with profile information
          setUserData((prev) => ({
            ...prev,
            name: profileData.name || prev.name,
            description: profileData.description || "",
            status: profileData.status || "available",
            skills: profileData.skills || [],
            gender: profileData.gender || "",
            dateOfBirth: profileData.dateOfBirth || "",
            phone: profileData.phone || "+91 8008000988",
            institution: profileData.institution,
            graduationYear: profileData.graduationYear || prev.graduationYear,
            department:
              profileData.department || profileData.branch || prev.department,
            state: profileData.state || prev.state,
            githubUrl: profileData.githubUrl || "",
            linkedinUrl: profileData.linkedinUrl || "",
            resumeUrl: profileData.resumeUrl || "",
          }));

          // Generate referral link based on referral code or email
          if (profileData.referralCode) {
            setReferralLink(
              `${window.location.origin}/login?ref=${profileData.referralCode}`
            );
          } else if (profileData.email) {
            const encodedEmail = encodeURIComponent(profileData.email);
            setReferralLink(
              `${window.location.origin}/login?ref=${encodedEmail}`
            );
          }

          // Fetch referrals data
          const referralsResponse = await fetch("/api/user/referrals");

          if (referralsResponse.ok) {
            const referralsData = await referralsResponse.json();
            console.log("Referrals data:", referralsData);
            setReferrals(referralsData.referredPeople || []);
            setReferredBy(referralsData.referredByUser || null);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, session, status, toast]);

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!userData.name) return "GT";
    return userData.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedType("link");
    toast({
      title: "Referral Link Copied!",
      description:
        "Share this link with friends to refer them. When they use this link and sign up, their referral code will be automatically filled.",
      variant: "default",
    });
    setTimeout(() => setCopiedType(null), 2000); // reset after 2s
  };

  const copyReferralCode = () => {
    const code =
      new URLSearchParams(referralLink.split("?")[1] || "").get("ref") || "";
    navigator.clipboard.writeText(code);
    setCopiedType("code");
    toast({
      title: "Referral Code Copied!",
      description:
        "When they use this code and sign up, they will be automatically referred by you.",
      variant: "default",
    });
    setTimeout(() => setCopiedType(null), 2000); // reset after 2s
  };

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center lg:hidden">
        <div className="w-full bg-gradient-to-b from-purple-100 to-purple-200 flex flex-col relative">
          <div className="fixed bottom-1 inset-x-0 z-50">
            <Navbar />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 sticky top-0 z-10 bg-gradient-to-b from-purple-100 to-purple-200">
            <div>
              <p className="text-gray-600 text-sm mb-1">
                Hello, {userData.name?.split(" ")[0] || "Guest"}!
              </p>
              <p className="text-purple-600 text-xl font-semibold">Profile</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
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
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleLogout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Profile Content - Mobile - Scrollable */}
          <div
            className={`px-4 space-y-4 pb-[100px] pt-2 flex-1 overflow-y-auto ${
              userId ? "max-w-xl mx-auto" : ""
            }`}
          >
            {/* Profile Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4 text-center">
                <Avatar className="w-20 h-20 mx-auto mb-4 bg-gray-300">
                  {userData.image ? (
                    <AvatarImage
                      src={userData.image}
                      alt={userData.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-300">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <h2 className="text-xl font-semibold mb-1">
                  {userData.name || "User Name"}
                </h2>
                {/* email under name for parity */}
                <p className="text-xs text-gray-500 mb-2">
                  {userData.email || ""}
                </p>

                <Badge className="bg-skillText text-skill mb-3">
                  {userData.status === "available"
                    ? "Available for Zigs"
                    : userData.status === "busy"
                    ? "Busy"
                    : "Offline"}
                </Badge>
                {/* Social Links - Mobile */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  {userData.linkedinUrl && (
                    <a
                      href={userData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-5 h-5 text-blue-600 hover:opacity-80" />
                    </a>
                  )}
                  {userData.githubUrl && (
                    <a
                      href={userData.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <Github className="w-5 h-5 text-gray-800 hover:opacity-80" />
                    </a>
                  )}
                </div>
                {!hideEditButton && (
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit Profile
                    </Button>
                  </Link>
                )}
                {userData.resumeUrl && (
                  <a
                    href={userData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full mt-2 bg-skill text-skillText">
                      View Resume
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Skills and Expertise</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex flex-wrap gap-2">
                  {userData.skills && userData.skills.length > 0 ? (
                    userData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100"
                      >
                        {skill}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Connect card removed */}

            {/* Description Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {userData.description ? (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {userData.description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No description added yet. Add a description to tell others
                    about yourself.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Education + Personal Details side-by-side on PUBLIC profile (centered via wrapper above) */}
            {userId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Education Card */}
                <Card className="bg-white rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <span className="inline-flex gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.15s]"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.3s]"></span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-yellow-400 flex items-center justify-center">
                            <AvatarFallback className="bg-yellow-400 text-black text-xs font-bold">
                              {(userData.institution || "-")
                                .toString()
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {userData.institution === "other"
                                ? "Other Institution"
                                : userData.institution || "—"}
                            </h3>
                            <div className="text-xs text-gray-600 space-y-0.5">
                              {userData.department && (
                                <div>Department: {userData.department}</div>
                              )}
                              {userData.graduationYear && (
                                <div>
                                  Graduation year: {userData.graduationYear}
                                </div>
                              )}
                              {userData.state && (
                                <div>State: {userData.state}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal Details Card */}
                <Card className="bg-white rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Mobile Number:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.phone || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.email || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.gender || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.dateOfBirth
                          ? new Date(userData.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* Education Card (OWN profile default stacking) */}
                <Card className="bg-white rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Education</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    {isLoading ? (
                      <div className="flex items-center justify-center py-6">
                        <span className="inline-flex gap-1">
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.15s]"></span>
                          <span className="inline-block w-2 h-2 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.3s]"></span>
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10 bg-yellow-400 flex items-center justify-center">
                            <AvatarFallback className="bg-yellow-400 text-black text-xs font-bold">
                              {(userData.institution || "-")
                                .toString()
                                .slice(0, 2)
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm truncate">
                              {userData.institution === "other"
                                ? "Other Institution"
                                : userData.institution || "—"}
                            </h3>
                            <div className="text-xs text-gray-600 space-y-0.5">
                              {userData.department && (
                                <div>Department: {userData.department}</div>
                              )}
                              {userData.graduationYear && (
                                <div>
                                  Graduation year: {userData.graduationYear}
                                </div>
                              )}
                              {userData.state && (
                                <div>State: {userData.state}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Personal Details Card (OWN profile default stacking) */}
                <Card className="bg-white rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Details</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Mobile Number:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.phone || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Email:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.email || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Gender:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.gender || "Not provided"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Date of Birth:</span>
                      <span className="ml-2 text-gray-600">
                        {userData.dateOfBirth
                          ? new Date(userData.dateOfBirth).toLocaleDateString()
                          : "Not provided"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Referral Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">
                  Refer Friends and Earn 10% of their earning for life.
                </h3>

                {/* Link + Code pills stacked */}
                <div className="flex flex-col gap-3 mb-6">
                  {/* Referral Link pill */}
                  <button
                    type="button"
                    onClick={copyReferralLink}
                    className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-skill text-skillText font-medium shadow-md ring-2 ring-black/40 transition"
                  >
                    <span className="truncate max-w-[260px]">
                      {referralLink}
                    </span>
                    {copiedType === "link" ? (
                      <Check className="w-4 h-4 text-skillText" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Referral Code pill */}
                  {referralLink && (
                    <button
                      type="button"
                      onClick={copyReferralCode}
                      className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-medium shadow-md ring-2 ring-black/40 hover:bg-lime-500 transition"
                    >
                      <span>
                        {new URLSearchParams(
                          referralLink.split("?")[1] || ""
                        ).get("ref") || ""}
                      </span>
                      {copiedType === "code" ? (
                        <Check className="w-4 h-4 text-skill" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Referred By Card - Added to mobile */}
            {referredBy && (
              <Card className="bg-white rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Referred By</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      {referredBy.image ? (
                        <AvatarImage
                          src={referredBy.image}
                          alt={referredBy.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-green-400">
                          {referredBy.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{referredBy.name}</p>
                      <p className="text-xs text-gray-500">{referredBy.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Referrals Card - Added to mobile */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">
                  My Referrals ({referrals.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {referrals.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {referrals.map((referral, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          {referral.image ? (
                            <AvatarImage
                              src={referral.image}
                              alt={referral.name}
                            />
                          ) : (
                            <AvatarFallback className="bg-yellow-400 text-xs">
                              {referral.name
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase() || "U"}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{referral.name}</p>
                          <p className="text-xs text-gray-500">
                            {referral.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    You haven't referred anyone yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation - Fixed at bottom */}
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar: hide on PUBLIC profile to remove left gap */}
        {!userId && <Navbar />}

        {/* Main Content */}
        <div className={`flex-1 p-8 ${!userId ? "lg:ml-64" : ""}`}>
          <div
            className={`grid gap-6 ${
              userId ? "grid-cols-2 max-w-4xl mx-auto" : "grid-cols-3 max-w-6xl"
            }`}
          >
            {/* Profile Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-6 text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4 bg-gray-300">
                  {userData.image ? (
                    <AvatarImage
                      src={userData.image}
                      alt={userData.name || "User"}
                    />
                  ) : (
                    <AvatarFallback className="bg-gray-300 text-3xl">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-2xl font-semibold mb-1">
                  {userData.name || "User Name"}
                </h2>
                {/* email under name for parity */}
                <p className="text-sm text-gray-500 mb-3">
                  {userData.email || ""}
                </p>
                <Badge
                  className={`${
                    userData.status === "available"
                      ? "bg-skillText"
                      : userData.status === "busy"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  } text-skill mb-4`}
                >
                  {userData.status === "available"
                    ? "Available for Zigs"
                    : userData.status === "busy"
                    ? "Busy"
                    : "Offline"}
                </Badge>

                {/* Icons below status chip (no resume icon on desktop) */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  {userData.linkedinUrl && (
                    <a
                      href={userData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="w-6 h-6 text-blue-600 hover:opacity-80" />
                    </a>
                  )}
                  {userData.githubUrl && (
                    <a
                      href={userData.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="GitHub"
                    >
                      <Github className="w-6 h-6 text-gray-800 hover:opacity-80" />
                    </a>
                  )}
                </div>
                {!hideEditButton && (
                  <Link href="/profile/edit">
                    <Button variant="outline" className="w-full bg-transparent">
                      Edit Profile
                    </Button>
                  </Link>
                )}
                {userData.resumeUrl && (
                  <a
                    href={userData.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button className="w-full mt-2 bg-skill text-skillText">
                      View Resume
                    </Button>
                  </a>
                )}
              </CardContent>
            </Card>

            {/* Skills Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Skills and Expertise</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {userData.skills && userData.skills.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {userData.skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-100 py-2 justify-center"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No skills added yet. Add skills to showcase your expertise.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Referral Card - Desktop (3rd column spanning 3 rows, hidden on public profile) */}
            {!userId && (
              <Card className="bg-white rounded-2xl shadow-sm col-start-3 row-span-3">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Refer Friends and Earn 10% of their earning for life.
                  </h3>

                  {/* Link + Code pills stacked */}
                  <div className="flex flex-col gap-3 mb-6">
                    {/* Referral Link pill */}
                    <button
                      type="button"
                      onClick={copyReferralLink}
                      className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-skill text-skillText font-medium shadow-md ring-2 ring-black/40 transition"
                    >
                      <span className="truncate max-w-[260px]">
                        {referralLink}
                      </span>
                      {copiedType === "link" ? (
                        <Check className="w-4 h-4 text-skillText" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {/* Referral Code pill */}
                    {referralLink && (
                      <button
                        type="button"
                        onClick={copyReferralCode}
                        className="w-full inline-flex items-center justify-between gap-2 px-4 py-2 rounded-full bg-lime-400 text-black font-medium shadow-md ring-2 ring-black/40 hover:bg-lime-500 transition"
                      >
                        <span>
                          {new URLSearchParams(
                            referralLink.split("?")[1] || ""
                          ).get("ref") || ""}
                        </span>
                        {copiedType === "code" ? (
                          <Check className="w-4 h-4 text-skill" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Referrals list */}
                  <div className="space-y-4">
                    <h4 className="font-semibold">
                      My Referrals ({referrals.length})
                    </h4>
                    {referrals.length > 0 ? (
                      <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                        {referrals.map((referral, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              {referral.image ? (
                                <AvatarImage
                                  src={referral.image}
                                  alt={referral.name}
                                />
                              ) : (
                                <AvatarFallback className="bg-yellow-400">
                                  {referral.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("")
                                    .toUpperCase() || "U"}
                                </AvatarFallback>
                              )}
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {referral.name}
                              </p>
                              <p className="text-sm text-gray-500 truncate">
                                {referral.email}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        You haven't referred anyone yet.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Description Card */}
            <Card
              className={`bg-white rounded-2xl shadow-sm ${
                !userId ? "col-span-2" : "col-span-2"
              }`}
            >
              <CardHeader>
                <CardTitle className="text-xl">Description</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {userData.description ? (
                  <p className="text-gray-700 leading-relaxed">
                    {userData.description}
                  </p>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No description added yet. Add a description to tell others
                    about yourself.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Education Card */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Education</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <span className="inline-flex gap-2">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B4E140] animate-pulse"></span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.15s]"></span>
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B4E140] animate-pulse [animation-delay:.3s]"></span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12 bg-yellow-400 flex items-center justify-center">
                      <AvatarFallback className="bg-yellow-400 text-black font-bold">
                        {(userData.institution || "-")
                          .toString()
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {userData.institution === "other"
                          ? "Other Institution"
                          : userData.institution || "—"}
                      </h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        {userData.department && (
                          <div>Department: {userData.department}</div>
                        )}
                        {userData.graduationYear && (
                          <div>Graduation year: {userData.graduationYear}</div>
                        )}
                        {userData.state && <div>State: {userData.state}</div>}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Personal Details Card - Desktop (now shown for both own & public) */}
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Personal Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0 space-y-3">
                <div>
                  <span className="font-medium">Mobile Number:</span>
                  <span className="ml-2 text-gray-600">
                    {userData.phone || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Email:</span>
                  <span className="ml-2 text-gray-600">
                    {userData.email || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Gender:</span>
                  <span className="ml-2 text-gray-600">
                    {userData.gender || "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Date of Birth:</span>
                  <span className="ml-2 text-gray-600">
                    {userData.dateOfBirth
                      ? new Date(userData.dateOfBirth).toLocaleDateString()
                      : "Not provided"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Referred By Card - Desktop (hide on public profile) */}
            {referredBy && !userId && (
              <Card className="bg-white rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Referred By</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      {referredBy.image ? (
                        <AvatarImage
                          src={referredBy.image}
                          alt={referredBy.name}
                        />
                      ) : (
                        <AvatarFallback className="bg-green-400">
                          {referredBy.name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .toUpperCase() || "U"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{referredBy.name}</p>
                      <p className="text-sm text-gray-500">
                        {referredBy.email}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* My Referrals Card - Desktop Extended (hide on public profile) */}
          </div>
        </div>
      </div>
    </>
  );
}
