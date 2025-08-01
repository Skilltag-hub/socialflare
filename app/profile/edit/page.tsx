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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 lg:hidden">
        <div className="w-full max-w-sm bg-gradient-to-b from-purple-100 to-purple-200 rounded-3xl shadow-2xl overflow-hidden">
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
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter Your Thought Process"
                    className="min-h-[100px] resize-none"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skills Required</Label>
                  <Input
                    id="skills"
                    placeholder="Skills Required"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addSkill()}
                  />
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

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select DropDown" />
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

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="Enter Your Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    placeholder="Enter Your Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!!session?.user?.email}
                  />
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
              </CardContent>
            </Card>
          </div>

          {/* Bottom Navigation */}
          <div className="bg-purple-600 px-4 py-4 mt-4 rounded-t-3xl">
            <div className="flex items-center justify-around">
              <Link href="/home">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-purple-500 h-12 w-12"
                >
                  <Home className="w-6 h-6" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <MessageCircle className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <Bell className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-purple-500 h-12 w-12"
              >
                <Building2 className="w-6 h-6" />
              </Button>
              <Link href="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-purple-500 h-12 w-12 bg-purple-500"
                >
                  <User className="w-6 h-6 fill-current" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        {/* Sidebar */}
        <div className="w-64 bg-black p-6 flex flex-col">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <div className="w-8 h-12 bg-white transform rotate-12 rounded-sm"></div>
            </div>
            <span className="text-white text-2xl font-light text-center">
              zig<span className="font-normal">work</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 flex flex-col justify-center">
            <Link href="/home">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <FileText className="w-5 h-5 mr-3" />
              Applied
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <Clock3 className="w-5 h-5 mr-3" />
              Ongoing
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <CheckCircle className="w-5 h-5 mr-3" />
              Completed
            </Button>
            <Link href="/profile">
              <Button
                variant="ghost"
                className="w-full justify-start text-purple-400 bg-purple-900/20 hover:bg-purple-900/30"
              >
                <User className="w-5 h-5 mr-3" />
                Profile
              </Button>
            </Link>
          </nav>

          {/* Footer Links */}
          <div className="space-y-2 text-sm text-gray-500">
            <div className="flex gap-4">
              <button className="hover:text-gray-300">Support</button>
              <button className="hover:text-gray-300">Privacy Policy</button>
            </div>
            <button className="hover:text-gray-300">Terms & Conditions</button>
          </div>
        </div>

        {/* Main Content - Desktop Edit Form */}
        <div className="flex-1 flex items-center justify-center p-8 lg:ml-64">
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

            {/* Edit Form Card */}
            <Card className="bg-white rounded-2xl shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-semibold">
                  Edit Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name-desktop">Name</Label>
                    <Input
                      id="name-desktop"
                      placeholder="Name"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone-desktop">Phone Number</Label>
                    <Input
                      id="phone-desktop"
                      placeholder="Enter Your Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description-desktop">Description</Label>
                    <Textarea
                      id="description-desktop"
                      placeholder="Enter Your Thought Process"
                      className="min-h-[120px] resize-none"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="skills-desktop">Skills Required</Label>
                    <div className="flex gap-2">
                      <Input
                        id="skills-desktop"
                        placeholder="Skills Required"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addSkill()}
                      />
                      <Button onClick={addSkill}>
                        <Plus className="w-4 h-4 mr-1" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {selectedSkills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-gray-100 flex items-center gap-2 py-2 px-3"
                        >
                          {skill}
                          <X
                            className="w-4 h-4 cursor-pointer hover:text-red-500"
                            onClick={() => removeSkill(skill)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status-desktop">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select DropDown" />
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

                  <div className="space-y-2">
                    <Label htmlFor="email-desktop">Email Address</Label>
                    <Input
                      id="email-desktop"
                      placeholder="Enter Your Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!!session?.user?.email}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-8 justify-center">
                  <Button
                    className="px-12 bg-purple-600 hover:bg-purple-700"
                    onClick={handleSubmit}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="px-12 bg-transparent"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
