"use client";

import { useState, useRef } from "react";
import { gsap } from "gsap";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";

export default function CompaniesDetailsPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Document upload states
  const [gstCertificate, setGstCertificate] = useState<{
    uploaded: boolean;
    url: string;
  }>({ uploaded: false, url: "" });
  const [cinDocument, setCinDocument] = useState<{
    uploaded: boolean;
    url: string;
  }>({ uploaded: false, url: "" });
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const gstInputRef = useRef<HTMLInputElement>(null);
  const cinInputRef = useRef<HTMLInputElement>(null);

  // Handle logo upload
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setLogoFile(file);
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      // Get upload auth params from API
      const authRes = await fetch("/api/upload-auth");
      if (!authRes.ok) throw new Error("Failed to get upload auth params");
      const { signature, expire, token, publicKey } = await authRes.json();
      // Use imagekit upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        setLogoUrl(uploadData.url);
        setSuccess("Logo uploaded!");
      } else {
        setError("Failed to upload logo");
      }
    } catch (err) {
      setError("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "gst" | "cin"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadingDoc(docType);
    setError("");
    setSuccess("");
    try {
      // Get upload auth params from API
      const authRes = await fetch("/api/upload-auth");
      if (!authRes.ok) throw new Error("Failed to get upload auth params");
      const { signature, expire, token, publicKey } = await authRes.json();
      // Use imagekit upload
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("publicKey", publicKey);
      formData.append("signature", signature);
      formData.append("expire", expire);
      formData.append("token", token);
      const uploadRes = await fetch(
        "https://upload.imagekit.io/api/v1/files/upload",
        {
          method: "POST",
          body: formData,
        }
      );
      const uploadData = await uploadRes.json();
      if (uploadData.url) {
        if (docType === "gst") {
          setGstCertificate({ uploaded: true, url: uploadData.url });
        } else {
          setCinDocument({ uploaded: true, url: uploadData.url });
        }
        setSuccess(
          `${
            docType === "gst" ? "GST Certificate" : "CIN Document"
          } uploaded successfully!`
        );
      } else {
        setError(
          `Failed to upload ${
            docType === "gst" ? "GST Certificate" : "CIN Document"
          }`
        );
      }
    } catch (err) {
      setError(
        `Failed to upload ${
          docType === "gst" ? "GST Certificate" : "CIN Document"
        }`
      );
    } finally {
      setUploadingDoc(null);
    }
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    // Validate required fields and set inline errors
    const req: { [k: string]: boolean } = {
      companyName: !companyName,
      companyWebsite: !companyWebsite,
      contactName: !contactName,
      businessEmail: !businessEmail,
      logoUrl: !logoUrl,
    };
    setErrors(req);
    const valid = Object.values(req).every((v) => v === false);
    if (!valid) {
      setError("Please fill all required fields and upload a logo.");
      return;
    }

    try {
      const res = await fetch("/api/companies/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          companyWebsite,
          contactName,
          businessEmail,
          logoUrl,
          gstCertificate,
          cinDocument
        })
      });

      if (!res.ok) throw new Error("Failed to save details");

      setSuccess("Company details saved successfully!");
      // Redirect to companies dashboard after successful save
      setTimeout(() => {
        router.push("/companies");
      }, 1000); // Small delay to show success message
    } catch (err) {
      setError("Failed to save company details. Please try again.");
    }
  };

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
      <div className="w-full max-w-md bg-white rounded-md shadow-lg overflow-hidden p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Company Details
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="company-name"
              className="text-sm font-medium text-gray-700"
            >
              Company Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company-name"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className={`w-full h-[45px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${errors.companyName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              required
            />
            {errors.companyName && (
              <p className="text-xs text-red-600">Company name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="company-website"
              className="text-sm font-medium text-gray-700"
            >
              Company Website <span className="text-red-500">*</span>
            </Label>
            <Input
              id="company-website"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              className={`w-full h-[45px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${errors.companyWebsite ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              required
            />
            {errors.companyWebsite && (
              <p className="text-xs text-red-600">Company website is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="contact-name"
              className="text-sm font-medium text-gray-700"
            >
              Contact Person Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact-name"
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className={`w-full h-[45px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${errors.contactName ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              required
            />
            {errors.contactName && (
              <p className="text-xs text-red-600">Contact person name is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="business-email"
              className="text-sm font-medium text-gray-700"
            >
              Business Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="business-email"
              type="email"
              value={businessEmail}
              onChange={(e) => setBusinessEmail(e.target.value)}
              className={`w-full h-[45px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent ${errors.businessEmail ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"}`}
              required
            />
            {errors.businessEmail && (
              <p className="text-xs text-red-600">Business email is required</p>
            )}
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="company-logo"
              className="text-sm font-medium text-gray-700"
            >
              Company Logo <span className="text-red-500">*</span>
            </Label>
            <label htmlFor="company-logo" className="block cursor-pointer">
              <div className={`flex flex-col items-center justify-center w-full h-32 bg-[#f8fcff] border-2 border-dashed rounded-2xl transition hover:bg-[#f0f6fa] focus-within:ring-2 ${errors.logoUrl ? "border-red-500 focus-within:ring-red-500" : "border-[#1a2b3c] focus-within:ring-blue-500"}`}>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#1a2b3c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mb-2"
                >
                  <path d="M12 19V6M5 12l7-7 7 7" />
                </svg>
                <span className="text-[#1a2b3c] text-sm">
                  Upload (jpg, png & pdf, Max 5mb)
                </span>
              </div>
              <input
                id="company-logo"
                type="file"
                accept="image/png,image/jpeg,application/pdf"
                ref={fileInputRef}
                onChange={handleLogoUpload}
                className="hidden"
                required
              />
            </label>
            {errors.logoUrl && !logoUrl && (
              <p className="text-xs text-red-600 mt-1">Company logo is required</p>
            )}
            {uploading && (
              <div className="text-blue-600 text-sm">Uploading...</div>
            )}
            {logoUrl && (
              <div className="mt-2">
                <img
                  src={logoUrl}
                  alt="Company Logo"
                  className="h-16 rounded"
                />
                <div className="text-green-600 text-xs">Logo uploaded!</div>
              </div>
            )}
          </div>

          {/* Optional Documents Section */}
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Optional Documents
            </h3>

            {/* GST Certificate */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="gst-certificate"
                checked={gstCertificate.uploaded}
                disabled={true}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex-1">
                <Label
                  htmlFor="gst-certificate"
                  className="text-sm font-medium text-gray-700"
                >
                  GST Certificate
                </Label>
                {!gstCertificate.uploaded && (
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={gstInputRef}
                      onChange={(e) => handleDocumentUpload(e, "gst")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => gstInputRef.current?.click()}
                      disabled={uploadingDoc === "gst"}
                      className="text-xs"
                    >
                      {uploadingDoc === "gst"
                        ? "Uploading..."
                        : "Upload GST Certificate"}
                    </Button>
                  </div>
                )}
                {gstCertificate.uploaded && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ GST Certificate uploaded
                  </div>
                )}
              </div>
            </div>

            {/* CIN Document */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="cin-document"
                checked={cinDocument.uploaded}
                disabled={true}
                className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
              />
              <div className="flex-1">
                <Label
                  htmlFor="cin-document"
                  className="text-sm font-medium text-gray-700"
                >
                  CIN Document
                </Label>
                {!cinDocument.uploaded && (
                  <div className="mt-1">
                    <input
                      type="file"
                      ref={cinInputRef}
                      onChange={(e) => handleDocumentUpload(e, "cin")}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => cinInputRef.current?.click()}
                      disabled={uploadingDoc === "cin"}
                      className="text-xs"
                    >
                      {uploadingDoc === "cin"
                        ? "Uploading..."
                        : "Upload CIN Document"}
                    </Button>
                  </div>
                )}
                {cinDocument.uploaded && (
                  <div className="text-xs text-green-600 mt-1">
                    ✓ CIN Document uploaded
                  </div>
                )}
              </div>
            </div>
          </div>

          {error && <div className="text-red-500 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <Button
            className="w-full h-[45px] bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
            style={{ color: "#c4f542" }}
            type="submit"
            disabled={uploading}
          >
            Save Details
          </Button>
        </form>
        <div className="pt-6 border-t border-gray-200 mt-8">
          <div className="flex justify-center space-x-6 text-sm text-gray-600 font-sans">
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
    </div>
  );
}
