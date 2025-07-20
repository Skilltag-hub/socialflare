"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function SetPin() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      setError("PINs do not match");
      return;
    }
    const res = await fetch("/api/user/set-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      setSuccess("PIN set successfully!");
      setTimeout(() => router.push("/login/details"), 1000);
    } else {
      setError("Failed to set PIN");
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
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Set Your PIN
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              Please set a 4-6 digit PIN for secure logins.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="pin"
                className="text-sm font-medium text-gray-700"
              >
                PIN
              </Label>
              <Input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                minLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="confirm-pin"
                className="text-sm font-medium text-gray-700"
              >
                Confirm PIN
              </Label>
              <Input
                id="confirm-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                minLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, ""))
                }
                autoComplete="new-password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && <div className="text-green-600 text-sm">{success}</div>}
            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              style={{ color: "#c4f542" }}
            >
              Set PIN
            </Button>
          </form>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-6 text-sm text-gray-600">
            <a href="/support" className="hover:text-gray-900">
              Support
            </a>
            <span>•</span>
            <a href="/privacy" className="hover:text-gray-900">
              Privacy Policy
            </a>
            <span>•</span>
            <a href="/terms" className="hover:text-gray-900">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
