"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { signIn } from "next-auth/react";

export default function CompaniesLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Handle Google OAuth login
  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signIn("google", {
        redirect: false,
      });
      
      if (result?.ok) {
        // After successful Google sign-in, get session and create/update company in MongoDB
        // Wait a moment for session to be established
        setTimeout(async () => {
          try {
            const response = await fetch('/api/auth/companies', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                // Session will be available in the API route
              }),
            });
            
            if (response.ok) {
              const { company } = await response.json();
              
              // Redirect based on onboarding status
              if (company.isOnboarded) {
                router.push("/companies");
              } else {
                router.push("/companies/details");
              }
            } else {
              setError("Failed to create company profile");
            }
          } catch (error) {
            console.error('Company creation error:', error);
            setError("Failed to create company profile");
          }
        }, 1000);
      } else if (result?.error) {
        setError("Failed to sign in with Google");
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError("Failed to sign in with Google");
    } finally {
      setLoading(false);
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
      <div className="w-full max-w-md bg-white rounded-md shadow-lg overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Company Sign In
          </h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <Button
            onClick={handleGoogleSignIn}
            variant="outline"
            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 h-[45px]"
            disabled={loading}
          >
            <svg
              className="w-5 h-5 mr-2"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path
                  fill="#4285F4"
                  d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.28426 53.749 C -8.52426 55.229 -9.244 56.479 -10.464 57.329 L -10.464 60.989 L -6.024 60.989 C -4.564 59.509 -3.264 55.859 -3.264 51.509 Z"
                />
                <path
                  fill="#34A853"
                  d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.024 60.989 L -10.464 57.329 C -11.744 58.049 -13.314 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.464 53.529 L -25.994 53.529 L -25.994 57.189 C -23.514 62.169 -18.464 63.239 -14.754 63.239 Z"
                />
                <path
                  fill="#FBBC05"
                  d="M -21.464 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.464 48.949 L -21.464 45.289 L -25.984 45.289 C -26.924 47.159 -27.284 49.179 -27.004 51.239 C -26.724 53.299 -25.814 55.199 -24.404 56.729 L -19.994 61.239 L -24.404 56.729 C -22.944 58.099 -21.124 59.019 -19.154 59.519 L -19.154 53.519 L -21.464 53.529 Z"
                />
                <path
                  fill="#EA4335"
                  d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.684 40.589 -11.514 39.739 -14.754 39.739 C -18.464 39.739 -22.514 41.579 -24.404 45.289 L -19.154 49.239 C -18.114 46.889 -15.694 43.989 -14.754 43.989 Z"
                />
              </g>
            </svg>
            {loading ? "Signing in with Google..." : "Sign in with Google"}
          </Button>
          
          <div className="mt-8 pt-6 border-t border-gray-200">
            
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
    </div>
  );
}