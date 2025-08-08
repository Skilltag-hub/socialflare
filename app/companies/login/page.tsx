"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CompaniesLoginPage from "@/components/companies-login";

export default function CompanyLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleAuthRedirect = async () => {
      if (status === "authenticated" && session?.user?.email) {
        try {
          // First, ensure the company record exists
          const createResponse = await fetch('/api/companies/auth', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!createResponse.ok) {
            throw new Error('Failed to initialize company');
          }

          // Then get the company details
          const response = await fetch('/api/companies/auth');
          if (response.ok) {
            const { company } = await response.json();
            if (company?.isOnboarded) {
              router.replace('/companies');
            } else {
              router.replace('/companies/details');
            }
          } else {
            console.error('Failed to fetch company details');
          }
        } catch (error) {
          console.error('Error handling company authentication:', error);
        }
      } else {
        // No session; desktop view will show login component
      }
    };
    
    handleAuthRedirect();
  }, [session, status, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      {/* Mobile/Tablet message */}
      <div className="block lg:hidden text-center space-y-3">
        <h1 className="text-white text-3xl font-semibold tracking-tight">Skilltag</h1>
        <p className="text-[#ADFF00] text-base leading-relaxed">
          Companies are requested to log in on a desktop for the best experience.
        </p>
      </div>

      {/* Desktop content */}
      <div className="hidden lg:block w-full">
        {status === "loading" && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-[#ADFF00] text-xl">Loading...</div>
          </div>
        )}

        {status === "unauthenticated" && <CompaniesLoginPage />}

        {status === "authenticated" && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-[#ADFF00] text-xl">Redirecting...</div>
          </div>
        )}
      </div>
    </div>
  );
}
