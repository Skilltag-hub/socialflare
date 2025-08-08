"use client";
import Link from "next/link";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PhoneInput } from "./phone-input";
import { Ripples } from "ldrs/react";
import "ldrs/react/Ripples.css";
import collegesData from "../telangana_colleges.json";
import { upload } from "@imagekit/next";

export default function AdditionalDetails() {
  const [institution, setInstitution] = useState("cbit");
  const [state, setState] = useState("telangana");
  const [graduationYear, setGraduationYear] = useState("2025");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [idImageUrl, setIdImageUrl] = useState("");
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [referralCode, setReferralCode] = useState("");
  const [isReferralCodeFromUrl, setIsReferralCodeFromUrl] = useState(false);
  const [originalReferralCode, setOriginalReferralCode] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Check for referral code in URL parameters or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      // First check URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get("ref");

      if (refCode) {
        // Store in localStorage for persistence across auth redirects
        localStorage.setItem("referralCode", refCode);
        setReferralCode(refCode);
        setOriginalReferralCode(refCode);
        setIsReferralCodeFromUrl(true);
      } else {
        // Check localStorage for stored referral code
        const storedRefCode = localStorage.getItem("referralCode");
        if (storedRefCode) {
          setReferralCode(storedRefCode);
          setOriginalReferralCode(storedRefCode);
          setIsReferralCodeFromUrl(true);
          // Clear from localStorage after retrieving
          localStorage.removeItem("referralCode");
        }
      }
    }
  }, []);

  // Check if user has already completed setup
  useEffect(() => {
    const checkUserStatus = async () => {
      if (status === "authenticated") {
        setIsCheckingStatus(true);
        try {
          const response = await fetch("/api/user/status");
          const data = await response.json();

          if (data.setupComplete) {
            // User has completed setup, redirect to home
            router.push("/home");
          } else {
            // User needs to complete setup, show the form
            setIsCheckingStatus(false);
          }
        } catch (error) {
          console.error("Error checking user status:", error);
          setIsCheckingStatus(false);
        }
      } else if (status === "unauthenticated") {
        // Not logged in
        router.push("/login");
      } else {
        // Status is "loading", keep the loading state active
        setIsCheckingStatus(true);
      }
    };

    checkUserStatus();
  }, [status, router]);

  // Get ImageKit upload auth params from your API
  const getAuthParams = async () => {
    const res = await fetch("/api/upload-auth");
    if (!res.ok) throw new Error("Failed to get upload auth params");
    return res.json();
  };

  // Helper to validate phone number (basic check)
  function isValidPhone(phone: string) {
    return phone && phone.length >= 10 && phone.startsWith("+");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPhone(phone)) {
      setError("Please enter a valid phone number");
      return;
    }

    // If referral code is provided, validate it
    let referrerInfo = null;
    if (referralCode.trim() !== "") {
      try {
        console.log("Validating referral code:", referralCode);
        const response = await fetch(
          `/api/user/validate-referral?code=${encodeURIComponent(referralCode)}`
        );
        console.log("Referral validation response status:", response.status);
        if (response.ok) {
          referrerInfo = await response.json();
          console.log("Referrer info:", referrerInfo);
        } else if (response.status === 404) {
          // Invalid referral code - show warning but allow submission to continue
          setError(
            "Invalid referral code. You can continue without it or check the code and try again."
          );
          // Clear the referral code so it doesn't get submitted
          setReferralCode("");
          setIsReferralCodeFromUrl(false);
        } else {
          // Server error - don't block submission, just log it
          console.error("Error validating referral code:", response.status);
        }
      } catch (err) {
        console.error("Error validating referral code:", err);
        // Don't block submission on network errors
      }
    }
    setIsUploading(true);

    let imageUrl = idImageUrl;
    if (
      fileInputRef.current &&
      fileInputRef.current.files &&
      fileInputRef.current.files[0] &&
      !idImageUrl
    ) {
      try {
        const { signature, expire, token, publicKey } = await getAuthParams();
        const file = fileInputRef.current.files[0];
        const uploadRes = await upload({
          expire,
          token,
          signature,
          publicKey,
          file,
          fileName: file.name,
        });
        imageUrl = uploadRes.url || "";
        setIdImageUrl(imageUrl);
      } catch (err) {
        setError("Failed to upload image");
        setIsUploading(false);
        return;
      }
    }

    // Now submit the details with the image URL and referral info
    const res = await fetch("/api/user/details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        institution,
        state,
        graduationYear,
        phone,
        idImageUrl: imageUrl,
        ...(referrerInfo && { referredBy: referrerInfo.userId }),
      }),
    });

    // If submission was successful and there was a valid referrer, update the referrer's record
    if (res.ok && referrerInfo) {
      try {
        console.log("Updating referrer record for:", referrerInfo.userId);
        const updateResponse = await fetch("/api/user/update-referrer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrerId: referrerInfo.userId,
            referredUser: {
              email: session?.user?.email,
              name: session?.user?.name,
              image: session?.user?.image,
              joinedAt: new Date().toISOString(),
            },
          }),
        });
        console.log("Update referrer response status:", updateResponse.status);
        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          console.error("Update referrer error:", errorData);
        }
      } catch (err) {
        console.error("Error updating referrer's record:", err);
        // Don't fail the whole submission if this fails
      }
    }
    setIsUploading(false);
    if (res.ok) {
      router.push("/home");
    } else {
      setError("Failed to save details");
    }
  };

  // Loading spinner component removed and replaced with Ripples from ldrs/react

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at 20% -20%, #c4f542 0%, #c4f542 15%, rgba(196, 245, 66, 0.6) 35%, rgba(196, 245, 66, 0.2) 50%, transparent 70%),
          radial-gradient(circle at 80% -10%, #c4f542 0%, #c4f542 8%, rgba(196, 245, 66, 0.4) 20%, rgba(196, 245, 66, 0.1) 35%, transparent 50%),
          #f8f9fa
        `,
      }}
    >
      {isCheckingStatus ? (
        <div
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 flex items-center justify-center"
          style={{ minHeight: "400px" }}
        >
          <div className="flex flex-col items-center justify-center">
            <Ripples size={45} speed={2} color="#B4E140" />
            <p className="mt-4 text-lg font-medium">Loading...</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">One More Step!</h1>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  htmlFor="institution"
                  className="text-sm font-medium text-gray-700"
                >
                  Institution*
                </Label>
                <Select
                  value={institution}
                  onValueChange={setInstitution}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {collegesData.colleges.map((college, index) => (
                      <SelectItem key={index} value={college}>
                        {college}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other Institution</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="state"
                  className="text-sm font-medium text-gray-700"
                >
                  State*
                </Label>
                <Select value={state} onValueChange={setState} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="telangana">Telangana</SelectItem>
                    <SelectItem value="andhra-pradesh">
                      Andhra Pradesh
                    </SelectItem>
                    <SelectItem value="karnataka">Karnataka</SelectItem>
                    <SelectItem value="tamil-nadu">Tamil Nadu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="graduation-year"
                  className="text-sm font-medium text-gray-700"
                >
                  Graduation Year*
                </Label>
                <Select
                  value={graduationYear}
                  onValueChange={setGraduationYear}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your graduation year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Phone number field */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-gray-700"
                >
                  Phone Number*
                </Label>
                <PhoneInput
                  id="phone"
                  value={phone}
                  onChange={setPhone}
                  defaultCountry="IN"
                  international
                  countryCallingCodeEditable={false}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>

              {/* Referral code field */}
              <div className="space-y-2">
                <Label
                  htmlFor="referral-code"
                  className="text-sm font-medium text-gray-700"
                >
                  Referral Code (Optional)
                  {isReferralCodeFromUrl && (
                    <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      Pre-filled from link
                    </span>
                  )}
                </Label>
                <input
                  id="referral-code"
                  type="text"
                  value={referralCode}
                  onChange={(e) => {
                    setReferralCode(e.target.value);
                    // If user manually changes the code, remove the "pre-filled" indicator
                    if (
                      isReferralCodeFromUrl &&
                      e.target.value !== originalReferralCode
                    ) {
                      setIsReferralCodeFromUrl(false);
                    }
                  }}
                  placeholder="Enter referral code if you have one"
                  className={`w-full border rounded-lg px-3 py-2 ${
                    isReferralCodeFromUrl
                      ? "border-green-300 bg-green-50"
                      : "border-gray-300"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="id-image"
                  className="text-sm font-medium text-gray-700"
                >
                  Upload ID Image*
                </Label>
                <input
                  id="id-image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
                {idImageUrl && (
                  <div className="mt-2 text-xs text-green-600">
                    Image uploaded!
                  </div>
                )}
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
                style={{ color: "#c4f542" }}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Continue"}
              </Button>

              {/* Removed 'Skip For Now' option since details are required */}
            </div>
          </form>
          {/* ...footer... */}
          <div className="mt-8 pt-6 border-t border-gray-200 font-sans font-bold">
            <div className="flex justify-center space-x-6 text-sm text-gray-600">
              <Link href="/support" className="hover:text-gray-900">
                Support
              </Link>
              <span>•</span>
              <Link href="/privacy" className="hover:text-gray-900">
                Privacy Policy
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-900">
                Terms & Conditions
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
