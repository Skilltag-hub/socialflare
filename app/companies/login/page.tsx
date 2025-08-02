"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import CompaniesLoginPage from "@/components/companies-login";

export default function CompanyLogin() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);

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
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    handleAuthRedirect();
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
