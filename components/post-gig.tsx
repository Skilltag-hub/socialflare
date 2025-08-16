"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { SkillsCombobox } from "./skills-combobox";

export default function PostGig() {
  const { toast } = useToast();
  // Form data interface
  interface FormData {
    gigTitle: string;
    category: string;
    description: string;
    duration: string;
    stipend: string;
    location: string;
    skills: string[];
    numberOfPositions: string;
    additionalRequirements: string;
    applicationDeadline: string;
    agreeToTerms: boolean;
  }

  // Get query params for pre-fill
  const getInitialFormData = (): FormData => {
    if (typeof window === "undefined") {
      return {
        gigTitle: "",
        category: "",
        description: "",
        duration: "",
        stipend: "",
        location: "",
        skills: [],
        numberOfPositions: "",
        additionalRequirements: "",
        applicationDeadline: "",
        agreeToTerms: false,
      };
    }
    const params = new URLSearchParams(window.location.search);
    return {
      gigTitle: params.get("title") || "",
      category: "",
      description: params.get("description") || "",
      duration: "",
      stipend: "",
      location: "",
      skills: [],
      numberOfPositions: "",
      additionalRequirements: "",
      applicationDeadline: "",
      agreeToTerms: false,
    };
  };
  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  const handleSkillsChange = (skills: string[]) => {
    setFormData(prev => ({ ...prev, skills }));
  };

  const validateFields = () => {
    const requiredFields = [
      "gigTitle",
      "category",
      "description",
      "duration",
      "stipend",
      "location",
      "numberOfPositions",
      "applicationDeadline",
    ];
    const newErrors: { [key: string]: boolean } = {};
    requiredFields.forEach((field) => {
      if (!formData[field as keyof FormData]) newErrors[field] = true;
    });
    if (formData.skills.length === 0) newErrors["skills"] = true;
    if (!formData.agreeToTerms) newErrors["agreeToTerms"] = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateFields()) return;

    try {
      // Fetch company details using the /api/companies/me endpoint which uses the session
      const companyRes = await fetch('/api/companies/me');
      if (!companyRes.ok) {
        throw new Error('Failed to fetch company details');
      }
      const company = await companyRes.json();
      
      if (!company) {
        throw new Error('Company details not found');
      }

      // If company exists but is not approved, redirect to pending approval page
      if (company && company.approved === false) {
        toast({
          title: "Approval pending",
          description: "Your company account is pending approval. You will be redirected.",
          variant: "destructive",
        });
        window.location.href = "/pending-approval?type=company";
        return;
      }

      // Format the data to match the API's expected format
      const gigData = {
        companyName: company?.name || formData.gigTitle,
        companyLogo: company?.logoUrl || '',
        aboutCompany: company?.about || formData.additionalRequirements,
        openings: parseInt(formData.numberOfPositions) || 1,
        description: formData.description,
        payment: formData.stipend,
        skills: formData.skills,
        datePosted: new Date().toISOString(),
        status: "active",
        // Additional fields from the form
        category: formData.category,
        duration: formData.duration,
        location: formData.location,
        applicationDeadline: formData.applicationDeadline,
      };

      // Post job to MongoDB
      const res = await fetch("/api/gigs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gigData),
      });

      if (!res.ok) {
        // Try to parse error details to handle approval errors
        let err: any = null;
        try { err = await res.json(); } catch {}
        if (err?.code === "COMPANY_NOT_APPROVED") {
          toast({
            title: "Approval pending",
            description: "Your company account is pending approval. You will be redirected.",
            variant: "destructive",
          });
          window.location.href = "/pending-approval?type=company";
          return;
        }
        throw new Error(err?.error || "Failed to post gig");
      }

      const data = await res.json();

      toast({
        title: "Success",
        description: "Gig posted successfully",
      });

      // Redirect to companies page after a short delay
      setTimeout(() => {
        window.location.href = "/companies";
      }, 1500);
    } catch (error) {
      console.error("Error posting gig:", error);
      toast({
        title: "Error",
        description: "Failed to post gig. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* Header with enhanced back button */}
      <div className="mb-6">
        <Link
          href="/companies"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors mb-6 p-3 rounded-lg bg-gray-800 w-fit hover:bg-gray-700"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Companies</span>
        </Link>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-white text-black rounded-xl shadow-lg">
          <CardContent className="p-8">
            <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Post a Gig
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gig Title and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gig Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. UI UX Designer"
                    value={formData.gigTitle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        gigTitle: e.target.value,
                      }))
                    }
                    className={`w-full ${
                      errors.gigTitle ? "border-red-500" : ""
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="content">Content Creation</SelectItem>
                      <SelectItem value="video">Video Production</SelectItem>
                      <SelectItem value="photography">Photography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Describe the gig responsibilities and what you're looking for..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className={`w-full h-24 resize-none ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  required
                />
              </div>

              {/* Duration, Stipend, Location Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 3 months"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    className={errors.duration ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stipend
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 25,000"
                    value={formData.stipend}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        stipend: e.target.value,
                      }))
                    }
                    className={errors.stipend ? "border-red-500" : ""}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, location: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="mumbai">Mumbai</SelectItem>
                      <SelectItem value="delhi">Delhi</SelectItem>
                      <SelectItem value="bangalore">Bangalore</SelectItem>
                      <SelectItem value="pune">Pune</SelectItem>
                      <SelectItem value="hyderabad">Hyderabad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills <span className="text-red-500">*</span>
                </label>
                <div className={`${errors.skills ? 'ring-2 ring-red-500 rounded-md' : ''}`}>
                  <SkillsCombobox
                    value={formData.skills}
                    onChange={handleSkillsChange}
                    placeholder="Select required skills..."
                  />
                </div>
                {errors.skills && (
                  <p className="mt-1 text-sm text-red-500">
                    Please select at least one skill
                  </p>
                )}
              </div>

              {/* Number of Positions */}
              <div className="grid grid-cols-1">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Positions
                  </label>
                  <Select
                    value={formData.numberOfPositions}
                    onValueChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        numberOfPositions: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4">4</SelectItem>
                      <SelectItem value="5+">5+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <Textarea
                  placeholder="Any specific requirements..."
                  value={formData.additionalRequirements}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      additionalRequirements: e.target.value,
                    }))
                  }
                  className="w-full h-20 resize-none"
                />
              </div>

              {/* Application Deadline */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Application Deadline
                </label>
                <Input
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      applicationDeadline: e.target.value,
                    }))
                  }
                  className={`w-full md:w-1/3 ${
                    errors.applicationDeadline ? "border-red-500" : ""
                  }`}
                />
              </div>

              {/* Agreement Checkbox */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="agree"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      agreeToTerms: checked as boolean,
                    }))
                  }
                  className={errors.agreeToTerms ? "border-red-500" : ""}
                />
                {errors.agreeToTerms && (
                  <span className="text-red-500 text-xs ml-2">
                    You must agree to the terms
                  </span>
                )}
                <label
                  htmlFor="agree"
                  className="text-sm text-gray-600 leading-relaxed"
                >
                  I agree that all information given above is genuine.
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-center gap-4 pt-6">
                <Link href="/companies">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-8 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 bg-transparent"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-[#5E17EB] hover:bg-[#4A12C4] text-white px-8 py-2"
                  disabled={!formData.agreeToTerms}
                >
                  Post Gig
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
