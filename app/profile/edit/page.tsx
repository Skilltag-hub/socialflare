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
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function Component() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    phone: "+91 8008000988",
    email: "",
    status: "available",
    gender: "",
    dateOfBirth: "",
    githubUrl: "",
    linkedinUrl: "",
    resumeUrl: "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([
    "UI Designer",
    "UX Designer",
    "User Research",
  ]);

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
  const removeSkill = (skillToRemove) => {
    setSelectedSkills((prev) =>
      prev.filter((skill) => skill !== skillToRemove)
    );
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
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
        <div className="w-full max-w-sm mx-auto bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative overflow-y-auto">
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
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, gender: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="prefer-not-to-say">
                            Prefer not to say
                          </SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <Label htmlFor="githubUrl">GitHub Profile</Label>
                      <Input
                        id="githubUrl"
                        type="url"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedinUrl">LinkedIn Profile</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        value={formData.linkedinUrl}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resumeUrl">Resume/CV Link</Label>
                      <Input
                        id="resumeUrl"
                        type="url"
                        value={formData.resumeUrl}
                        onChange={handleChange}
                        placeholder="https://example.com/resume.pdf"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        disabled={!!session?.user?.email}
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">About</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <Label htmlFor="skills">Skills</Label>
                      <div className="flex gap-2">
                        <Input
                          id="skills"
                          placeholder="Add a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        />
                        <Button type="button" onClick={addSkill}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedSkills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-gray-100 flex items-center gap-1"
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
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                      onClick={handleSubmit}
                    >
                      Save
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
                      className="bg-white border-gray-700 text-gray-700 mt-1"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender-desktop" className="text-black">
                      Gender
                    </Label>
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

                  <div>
                    <Label htmlFor="dateOfBirth-desktop" className="text-black">
                      Date of Birth
                    </Label>
                    <Input
                      id="dateOfBirth-desktop"
                      type="date"
                      className="bg-white border-gray-700 text-gray-700 mt-1"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </div>

                  <div>
                    <Label htmlFor="status-desktop" className="text-black">
                      Status
                    </Label>
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

                  <div>
                    <Label htmlFor="phone-desktop" className="text-black">
                      Phone Number
                    </Label>
                    <Input
                      id="phone-desktop"
                      className="bg-white border-gray-700 text-gray-700 mt-1"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email-desktop" className="text-black">
                      Email Address
                    </Label>
                    <Input
                      id="email-desktop"
                      className="bg-white border-gray-700 text-gray-700 mt-1 disabled:opacity-50"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                      disabled={!!session?.user?.email}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description-desktop" className="text-black">
                    About
                  </Label>
                  <Textarea
                    id="description-desktop"
                    className="bg-white border-gray-700 text-gray-700 mt-1 min-h-[120px]"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-800 mb-6">
              <CardHeader>
                <CardTitle className="text-black">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      className="bg-white border-gray-700 text-gray-700 flex-1"
                      placeholder="Add a skill"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button
                      type="button"
                      onClick={addSkill}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
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
                    className="bg-white border-gray-700 text-gray-700 mt-1"
                    value={formData.githubUrl}
                    onChange={handleChange}
                    placeholder="https://github.com/username"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedinUrl-desktop" className="text-black">
                    LinkedIn Profile
                  </Label>
                  <Input
                    id="linkedinUrl-desktop"
                    type="url"
                    className="bg-white border-gray-700 text-gray-700 mt-1"
                    value={formData.linkedinUrl}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <Label htmlFor="resumeUrl-desktop" className="text-black">
                    Resume/CV Link
                  </Label>
                  <Input
                    id="resumeUrl-desktop"
                    type="url"
                    className="bg-white border-gray-700 text-gray-700 mt-1"
                    value={formData.resumeUrl}
                    onChange={handleChange}
                    placeholder="https://example.com/resume.pdf"
                  />
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
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleSubmit}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
