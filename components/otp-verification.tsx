"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";

export default function OTPVerification() {
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
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
              Confirm OTP
            </h1>
            <p className="text-gray-600 text-sm mb-2">
              Enter the password sent on{" "}
              <span className="font-medium">dummy_username@gmail.com</span>
            </p>
            <Link href="#" className="text-blue-600 hover:underline text-sm">
              Change email
            </Link>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                One-time password
              </label>
              <div className="flex space-x-3">
                {otp.map((digit, index) => (
                  <Input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-14 h-14 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              style={{ color: "#c4f542" }}
            >
              Continue
            </Button>

            <div className="text-center">
              <Link href="#" className="text-sm text-blue-600 hover:underline">
                Resent OTP
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
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
    </div>
  );
}
