"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Home,
  MessageCircle,
  Bell,
  Building2,
  User,
  FileText,
  Clock3,
  CheckCircle,
  ArrowLeft,
  X,
  Plus,
} from "lucide-react";
import { SkillsCombobox } from "@/components/skills-combobox";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { upload } from "@imagekit/next";
import collegesData from "../../../telangana_colleges.json";

export default function Component() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const idFileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "+91 8008000988",
    email: "",
    status: "available",
    gender: "",
    dateOfBirth: "",
    institution: "",
    state: "",
    graduationYear: "",
    idImageUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingIdImage, setIsUploadingIdImage] = useState(false);
  const [customInstitution, setCustomInstitution] = useState("");
  const [customGraduationYear, setCustomGraduationYear] = useState("");

  // Define required fields
  const requiredFields = [
    "name",
    "description",
    "phone",
    "gender",
    "dateOfBirth",
    "githubUrl",
    "linkedinUrl",
    "resumeUrl",
  ];

  // Validate form fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    requiredFields.forEach((field) => {
      if (!formData[field as keyof typeof formData]?.toString().trim()) {
        newErrors[field] = `${
          field.charAt(0).toUpperCase() + field.slice(1)
        } is required`;
        isValid = false;
      }
    });

    // Enforce minimum description length (100 chars)
    const descLen = (formData.description || "").trim().length;
    if (descLen < 100) {
      newErrors.description = "Description must be at least 100 characters";
      isValid = false;
    }

    // Validate skills
    if (selectedSkills.length === 0) {
      newErrors.skills = "At least one skill is required";
      isValid = false;
    }

    // Validate email if not from session
    if (!session?.user?.email && !formData.email) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!session?.user?.name) return "GT";
    return session.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Load user data when session is available
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (status === "loading") return;

      if (status === "authenticated" && session?.user) {
        try {
          // First set basic data from session
          setFormData((prev) => ({
            ...prev,
            name: session.user.name || "",
            email: session.user.email || "",
          }));

          // Then fetch complete profile data from API
          const response = await fetch("/api/user/profile");

          if (!response.ok) {
            throw new Error("Failed to fetch profile data");
          }

          const profileData = await response.json();

          // Update form data with profile information
          setFormData((prev) => ({
            ...prev,
            name: profileData.name || prev.name,
            description: profileData.description || "",
            phone: profileData.phone || "+91 8008000988",
            status: profileData.status || "available",
            gender: profileData.gender || "",
            dateOfBirth: profileData.dateOfBirth || "",
            institution: profileData.institution || "",
            state: profileData.state || "",
            graduationYear: profileData.graduationYear || "",
            idImageUrl: profileData.idImageUrl || "",
            githubUrl: profileData.githubUrl || "",
            linkedinUrl: profileData.linkedinUrl || "",
            resumeUrl: profileData.resumeUrl || "",
          }));

          // Update skills if available
          if (profileData.skills && Array.isArray(profileData.skills)) {
            setSelectedSkills(profileData.skills);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data. Using default values.",
            variant: "destructive",
          });
        }
      }
    };

    fetchUserProfile();
  }, [session, status, toast]);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    const fieldName = id.includes("-desktop") ? id.replace("-desktop", "") : id;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Handle status change
  const handleStatusChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      status: value,
    }));
  };

  // Add new skill
  const addSkill = () => {
    if (newSkill.trim() && !selectedSkills.includes(newSkill.trim())) {
      setSelectedSkills((prev) => [...prev, newSkill.trim()]);
      setNewSkill("");
    }
  };

  // Remove skill
  const removeSkill = (skillToRemove: string) => {
    setSelectedSkills(
      selectedSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return; // Don't proceed if validation fails
    }

    setIsSubmitting(true);
    try {
      // Resolve institution/year if 'other' selected
      const institutionToSubmit =
        formData.institution === "other" ? customInstitution.trim() : formData.institution;
      const graduationYearToSubmit =
        formData.graduationYear === "other" ? customGraduationYear.trim() : formData.graduationYear;
      if (formData.institution === "other" && !institutionToSubmit) {
        setErrors((prev) => ({ ...prev, institution: "Institution is required" }));
        setIsSubmitting(false);
        return;
      }
      if (formData.graduationYear === "other" && !graduationYearToSubmit) {
        setErrors((prev) => ({ ...prev, graduationYear: "Graduation year is required" }));
        setIsSubmitting(false);
        return;
      }
      // Upload ID image if selected and no URL set yet
      if (
        idFileInputRef.current &&
        idFileInputRef.current.files &&
        idFileInputRef.current.files[0] &&
        !formData.idImageUrl
      ) {
        setIsUploadingIdImage(true);
        const authRes = await fetch("/api/upload-auth");
        if (!authRes.ok) throw new Error("Failed to get upload auth params");
        const { signature, expire, token, publicKey } = await authRes.json();
        const file = idFileInputRef.current.files[0];
        const uploadRes = await upload({
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name,
        });
        const uploadedUrl = uploadRes.url || "";
        if (uploadedUrl) {
          setFormData((prev) => ({ ...prev, idImageUrl: uploadedUrl }));
        }
        setIsUploadingIdImage(false);
      }

      // Send the updated profile data to the API
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          status: formData.status,
          skills: selectedSkills,
          phone: formData.phone,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth,
          institution: institutionToSubmit,
          state: formData.state,
          graduationYear: graduationYearToSubmit,
          idImageUrl: formData.idImageUrl,
          githubUrl: formData.githubUrl,
          linkedinUrl: formData.linkedinUrl,
          resumeUrl: formData.resumeUrl,
          // Only include email if it's not from the session (to avoid overwriting)
          ...(!session?.user?.email && { email: formData.email }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });

      // Navigate back to profile page
      router.push("/profile");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/profile");
  };

  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen bg-black flex flex-col lg:hidden">
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 shadow-2xl overflow-hidden flex flex-col relative overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleCancel}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <p className="text-purple-600 text-xl font-semibold">
                Edit Profile
              </p>
            </div>
            <Avatar className="w-12 h-12 bg-gray-300">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={formData.name} />
              ) : (
                <AvatarFallback className="bg-gray-300">
                  {getUserInitials()}
                </AvatarFallback>
              )}
            </Avatar>
          </div>

          {/* Edit Form - Mobile */}
          <div className="px-4 pb-4">
            <Card className="bg-white rounded-2xl shadow-sm">
              <CardContent className="p-4 space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="institution">Institution</Label>
                      <Select
                        value={formData.institution}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, institution: value }));
                          if (value !== "other") setCustomInstitution("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your institution" />
                        </SelectTrigger>
                        <SelectContent>
                          {collegesData.colleges.map((c: string, idx: number) => (
                            <SelectItem key={idx} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.institution === "other" && (
                        <Input
                          id="institution-other"
                          className="mt-2"
                          value={customInstitution}
                          onChange={(e) => setCustomInstitution(e.target.value)}
                          placeholder="Enter your institution"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, state: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="telangana">Telangana</SelectItem>
                          <SelectItem value="andhra-pradesh">Andhra Pradesh</SelectItem>
                          <SelectItem value="karnataka">Karnataka</SelectItem>
                          <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="graduationYear">Graduation Year</Label>
                      <Select
                        value={formData.graduationYear}
                        onValueChange={(value) => {
                          setFormData((prev) => ({ ...prev, graduationYear: value }));
                          if (value !== "other") setCustomGraduationYear("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select graduation year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.graduationYear === "other" && (
                        <Input
                          id="graduationYear-other"
                          className="mt-2"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={customGraduationYear}
                          onChange={(e) => setCustomGraduationYear(e.target.value)}
                          placeholder="Enter graduation year (e.g., 2026)"
                        />
                      )}
                    </div>
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <div
                        className={
                          errors.gender
                            ? "border border-red-500 rounded-md"
                            : ""
                        }
                      >
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => {
                            setFormData((prev) => ({ ...prev, gender: value }));
                            // Clear error when selecting a value
                            if (errors.gender) {
                              setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.gender;
                                return newErrors;
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">
                              Non-binary
                            </SelectItem>
                            <SelectItem value="prefer-not-to-say">
                              Prefer not to say
                            </SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.gender && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.gender}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                        className={errors.dateOfBirth ? "border-red-500" : ""}
                      />
                      {errors.dateOfBirth && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.dateOfBirth}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="githubUrl">GitHub Profile</Label>
                      <Input
                        id="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className={errors.githubUrl ? "border-red-500" : ""}
                      />
                      {errors.githubUrl && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.githubUrl}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className={errors.linkedinUrl ? "border-red-500" : ""}
                      />
                      {errors.linkedinUrl && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.linkedinUrl}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="resumeUrl">Resume/CV Link</Label>
                      <Input
                        id="resumeUrl"
                        type="url"
                        value={formData.resumeUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/resume.pdf"
                        className={errors.resumeUrl ? "border-red-500" : ""}
                      />
                      {errors.resumeUrl && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.resumeUrl}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="idImageFile">Upload ID Image</Label>
                      <input
                        id="idImageFile"
                        type="file"
                        accept="image/*"
                        ref={idFileInputRef}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      />
                      {formData.idImageUrl && (
                        <div className="mt-2 text-xs text-green-600">
                          ID image uploaded
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                        className={errors.phone ? "border-red-500" : ""}
                      />
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={(e) => {
                          handleChange(e);
                          // Clear email error when typing
                          if (errors.email) {
                            setErrors((prev) => {
                              const newErrors = { ...prev };
                              delete newErrors.email;
                              return newErrors;
                            });
                          }
                        }}
                        placeholder="your.email@example.com"
                        disabled={!!session?.user?.email}
                        className={errors.email ? "border-red-500" : ""}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="description">About</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Skills</Label>
                      <div
                        className={
                          errors.skills
                            ? "border border-red-500 rounded-md p-1"
                            : ""
                        }
                      >
                        <SkillsCombobox
                          value={selectedSkills}
                          onChange={(skills) => {
                            setSelectedSkills(skills);
                            // Clear skills error when selecting a skill
                            if (errors.skills && skills.length > 0) {
                              setErrors((prev) => {
                                const newErrors = { ...prev };
                                delete newErrors.skills;
                                return newErrors;
                              });
                            }
                          }}
                          placeholder="Select your skills..."
                        />
                      </div>
                      {errors.skills && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.skills}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">
                            Available for Zigs
                          </SelectItem>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="offline">Offline</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.status && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className={`flex-1 bg-purple-600 hover:bg-purple-700 ${
                        isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting || isUploadingIdImage ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 bg-transparent"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation */}
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Main Content - Desktop Edit Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            {/* Back Button */}
            <div className="mb-6">
              <Button
                variant="ghost"
                className="text-white hover:bg-gray-800 p-0"
                onClick={handleCancel}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Button>
            </div>

            <Card className="bg-white border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-black">
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name-desktop" className="text-black">
                      Full Name
                    </Label>
                    <Input
                      id="name-desktop"
                      className={`bg-white border-gray-700 text-gray-700 mt-1 ${errors.name ? "border-red-500" : ""}`}
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gender-desktop" className="text-black">
                      Gender
                    </Label>
                    <div className={errors.gender ? "border border-red-500 rounded-md" : ""}>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger className="bg-white border-gray-700 text-gray-700 mt-1">
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="male" className="hover:bg-gray-700">
                            Male
                          </SelectItem>
                          <SelectItem
                            value="female"
                            className="hover:bg-gray-700"
                          >
                            Female
                          </SelectItem>
                          <SelectItem
                            value="non-binary"
                            className="hover:bg-gray-700"
                          >
                            Non-binary
                          </SelectItem>
                          <SelectItem
                            value="prefer-not-to-say"
                            className="hover:bg-gray-700"
                          >
                            Prefer not to say
                          </SelectItem>
                          <SelectItem value="other" className="hover:bg-gray-700">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.gender && (
                      <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth-desktop" className="text-black">
                      Date of Birth
                    </Label>
                    <div className={errors.dateOfBirth ? "border border-red-500 rounded-md" : ""}>
                      <Input
                        id="dateOfBirth-desktop"
                        type="date"
                        className={`bg-white border-gray-700 text-gray-700 mt-1`}
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="status-desktop" className="text-black">
                      Status
                    </Label>
                    <div className={errors.status ? "border border-red-500 rounded-md" : ""}>
                      <Select
                        value={formData.status}
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="bg-white border-gray-700 text-gray-700 mt-1">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem
                            value="available"
                            className="hover:bg-gray-700"
                          >
                            Available for Zigs
                          </SelectItem>
                          <SelectItem value="busy" className="hover:bg-gray-700">
                            Busy
                          </SelectItem>
                          <SelectItem
                            value="offline"
                            className="hover:bg-gray-700"
                          >
                            Offline
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {errors.status && (
                      <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone-desktop" className="text-black">
                      Phone Number
                    </Label>
                    <Input
                      id="phone-desktop"
                      className={`bg-white border-gray-700 text-gray-700 mt-1 ${errors.phone ? "border-red-500" : ""}`}
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email-desktop" className="text-black">
                      Email Address
                    </Label>
                    <Input
                      id="email-desktop"
                      className={`bg-white border-gray-700 text-gray-700 mt-1 disabled:opacity-50 ${errors.email ? "border-red-500" : ""}`}
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      disabled={!!session?.user?.email}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="description-desktop" className="text-black">
                    About
                  </Label>
                  <Textarea
                    id="description-desktop"
                    className={`bg-white border-gray-700 text-gray-700 mt-1 min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-black">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Label>Skills</Label>
                  <div className={`${errors.skills ? "border border-red-500 rounded-md p-1" : ""}`}>
                    <SkillsCombobox
                      value={selectedSkills}
                      onChange={(skills) => {
                        setSelectedSkills(skills);
                        if (errors.skills && skills.length > 0) {
                          setErrors((prev) => {
                            const ne = { ...prev };
                            delete ne.skills;
                            return ne;
                          });
                        }
                      }}
                      placeholder="Select your skills..."
                    />
                  </div>
                  {errors.skills && (
                    <p className="text-red-500 text-xs mt-1">{errors.skills}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {selectedSkills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-gray-800 text-white flex items-center gap-1 hover:bg-gray-700"
                      >
                        {skill}
                        <X
                          className="w-3 h-3 cursor-pointer"
                          onClick={() => removeSkill(skill)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-black">Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="institution-desktop" className="text-black">Institution</Label>
                    <Select
                      value={formData.institution}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, institution: value }));
                        if (value !== "other") setCustomInstitution("");
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-700 text-gray-700 mt-1">
                        <SelectValue placeholder="Select your institution" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        {collegesData.colleges.map((c: string, idx: number) => (
                          <SelectItem key={idx} value={c} className="hover:bg-gray-700">
                            {c}
                          </SelectItem>
                        ))}
                        <SelectItem value="other" className="hover:bg-gray-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.institution === "other" && (
                      <Input
                        id="institution-desktop-other"
                        className="mt-2 bg-white border-gray-700 text-gray-700"
                        value={customInstitution}
                        onChange={(e) => setCustomInstitution(e.target.value)}
                        placeholder="Enter your institution"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="state-desktop" className="text-black">State</Label>
                    <Select
                      value={formData.state}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, state: value }))
                      }
                    >
                      <SelectTrigger className="bg-white border-gray-700 text-gray-700 mt-1">
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="telangana" className="hover:bg-gray-700">Telangana</SelectItem>
                        <SelectItem value="andhra-pradesh" className="hover:bg-gray-700">Andhra Pradesh</SelectItem>
                        <SelectItem value="karnataka" className="hover:bg-gray-700">Karnataka</SelectItem>
                        <SelectItem value="tamil-nadu" className="hover:bg-gray-700">Tamil Nadu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="graduationYear-desktop" className="text-black">Graduation Year</Label>
                    <Select
                      value={formData.graduationYear}
                      onValueChange={(value) => {
                        setFormData((prev) => ({ ...prev, graduationYear: value }));
                        if (value !== "other") setCustomGraduationYear("");
                      }}
                    >
                      <SelectTrigger className="bg-white border-gray-700 text-gray-700 mt-1">
                        <SelectValue placeholder="Select graduation year" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="2025" className="hover:bg-gray-700">2025</SelectItem>
                        <SelectItem value="2024" className="hover:bg-gray-700">2024</SelectItem>
                        <SelectItem value="2023" className="hover:bg-gray-700">2023</SelectItem>
                        <SelectItem value="2022" className="hover:bg-gray-700">2022</SelectItem>
                        <SelectItem value="other" className="hover:bg-gray-700">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.graduationYear === "other" && (
                      <Input
                        id="graduationYear-desktop-other"
                        className="mt-2 bg-white border-gray-700 text-gray-700"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={customGraduationYear}
                        onChange={(e) => setCustomGraduationYear(e.target.value)}
                        placeholder="Enter graduation year (e.g., 2026)"
                      />
                    )}
                  </div>

                  <div>
                    <Label htmlFor="idImageFile-desktop" className="text-black">Upload ID Image</Label>
                    <input
                      id="idImageFile-desktop"
                      type="file"
                      accept="image/*"
                      ref={idFileInputRef}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 mt-1"
                    />
                    {formData.idImageUrl && (
                      <p className="text-green-600 text-xs mt-1">ID image uploaded</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-800">
              <CardHeader>
                <CardTitle className="text-black">Online Profiles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="githubUrl-desktop" className="text-black">
                    GitHub Profile
                  </Label>
                  <Input
                    id="githubUrl-desktop"
                    type="url"
                    className={`bg-white border-gray-700 text-gray-700 mt-1 ${errors.githubUrl ? "border-red-500" : ""}`}
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                  {errors.githubUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.githubUrl}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="linkedinUrl-desktop" className="text-black">
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinUrl-desktop"
                    type="url"
                    className={`bg-white border-gray-700 text-gray-700 mt-1 ${errors.linkedinUrl ? "border-red-500" : ""}`}
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                  {errors.linkedinUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.linkedinUrl}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="resumeUrl-desktop" className="text-black">
                    Resume/CV Link
                  </Label>
                  <Input
                    id="resumeUrl-desktop"
                    type="url"
                    className={`bg-white border-gray-700 text-gray-700 mt-1 ${errors.resumeUrl ? "border-red-500" : ""}`}
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/resume.pdf"
                  />
                  {errors.resumeUrl && (
                    <p className="text-red-500 text-xs mt-1">{errors.resumeUrl}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save and Cancel Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                className="px-6 py-2 text-purple-600 border-purple-600 hover:bg-purple-50"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                className={`px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white ${
                  isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting || isUploadingIdImage ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
