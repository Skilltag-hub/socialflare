"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import CompaniesLoginPage from "@/components/companies-login";

export default function CompanyLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      // Check if company exists and is onboarded
      const checkCompanyStatus = async () => {
        try {
          const response = await fetch('/api/auth/companies');
          if (response.ok) {
            const { company } = await response.json();
            if (company.isOnboarded) {
              router.replace('/companies');
            } else {
              router.replace('/companies/details');
            }
          }
        } catch (error) {
          console.error('Error checking company status:', error);
        }
      };
      
      checkCompanyStatus();
    }
  }, [session, status, router]);

  // Show loading state while checking session
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-[#ADFF00] text-xl">Loading...</div>
      </div>
    );
  }

  // If not authenticated, show the login component
  if (status === "unauthenticated") {
    return <CompaniesLoginPage />;
  }

  // If authenticated, the useEffect will handle redirection
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-[#ADFF00] text-xl">Redirecting...</div>
    </div>
  );
}
