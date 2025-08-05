"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

type CompanyData = {
  _id: string;
  email: string;
  googleId: string;
  isOnboarded: boolean;
  createdAt: string;
  updatedAt: string;
  businessEmail: string;
  companyName: string;
  companyWebsite: string;
  contactName: string;
  logoUrl: string;
};

export default function CompaniesProfile() {
  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Companies Profile</h1>
    </div>
  );
}

  const { data: session, status } = useSession();
  const router = useRouter();
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    companyWebsite: '',
    contactName: '',
    businessEmail: '',
    logoUrl: ''
  });

  const fetchCompanyData = async () => {
    if (!session?.user?.email) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/companies/me', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (response.status === 401) {
        router.push('/companies/login');
        return;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 403) {
          // User is not a company account
          setError('This account is not associated with a company. Please use a company account to access this page.');
        } else if (response.status === 404) {
          // Company not found
          setError('Company profile not found. Please contact support if you believe this is an error.');
        } else {
          // Other errors
          throw new Error(data.error || 'Failed to fetch company data');
        }
        return;
      }
      
      setCompanyData(data);
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err.message || 'Failed to load company data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/companies/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchCompanyData();
    }
  }, [session, status]);

  useEffect(() => {
    if (companyData) {
      setFormData({
        companyName: companyData.companyName,
        companyWebsite: companyData.companyWebsite,
        contactName: companyData.contactName,
        businessEmail: companyData.businessEmail,
        logoUrl: companyData.logoUrl
      });
    }
  }, [companyData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would call your API to update the company data
    console.log('Updating company data:', formData);
    // Mock update
    if (companyData) {
      setCompanyData({
        ...companyData,
        ...formData,
        updatedAt: new Date().toISOString()
      });
    }
    setIsEditing(false);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center max-w-md p-6 bg-gray-900 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Oops! Something went wrong</h2>
          <p className="text-red-400 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!companyData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black flex flex-col lg:ml-64">
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Company Profile</h1>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Edit Profile
              </Button>
            )}
          </div>

          <div className="bg-gray-900 rounded-lg p-8">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
                    {formData.logoUrl ? (
                      <Image
                        src={formData.logoUrl}
                        alt="Company Logo"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gray-700">
                        {formData.companyName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full max-w-md space-y-2">
                    <Label htmlFor="logoUrl" className="block text-sm font-medium text-gray-400">
                      Logo URL
                    </Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/logo.png"
                      className="bg-gray-800 border-gray-700 text-white w-full"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="companyName" className="block text-sm font-medium text-gray-400 mb-2">
                      Company Name
                    </Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactName" className="block text-sm font-medium text-gray-400 mb-2">
                      Contact Person
                    </Label>
                    <Input
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white w-full"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyWebsite" className="block text-sm font-medium text-gray-400 mb-2">
                      Company Website
                    </Label>
                    <Input
                      id="companyWebsite"
                      name="companyWebsite"
                      type="url"
                      value={formData.companyWebsite}
                      onChange={handleInputChange}
                      className="bg-gray-800 border-gray-700 text-white w-full"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      if (companyData) {
                        setFormData({
                          companyName: companyData.companyName,
                          companyWebsite: companyData.companyWebsite,
                          contactName: companyData.contactName,
                          businessEmail: companyData.businessEmail,
                          logoUrl: companyData.logoUrl
                        });
                      }
                    }}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col items-center text-center space-y-6">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-800 border-2 border-gray-700">
                    {companyData?.logoUrl ? (
                      <Image
                        src={companyData.logoUrl}
                        alt={companyData.companyName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl font-bold bg-gray-700">
                        {companyData?.companyName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h2 className="text-2xl font-bold text-white">{companyData?.companyName}</h2>
                    <p className="text-gray-400">Partner since {companyData ? new Date(companyData.createdAt).toLocaleDateString() : ''}</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Contact Person</span>
                    <span className="text-white">{companyData?.contactName}</span>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Company Website</span>
                    <a 
                      href={companyData?.companyWebsite} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {companyData?.companyWebsite?.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                  
                  <div className="flex justify-between border-b border-gray-800 pb-2">
                    <span className="text-gray-400">Business Email</span>
                    <span className="text-white">{companyData?.businessEmail}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}