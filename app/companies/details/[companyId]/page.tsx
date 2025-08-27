"use client";
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompanyDetails {
  _id: string;
  companyName: string;
  email: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  foundedYear?: string;
  address?: string;
  phone?: string;
  contactName?: string;
  businessEmail?: string;
  certificateUrl?: string;
  isOnboarded: boolean;
  approved: boolean;
  createdAt: string;
}

export default function CompanyDetailsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const response = await fetch(`/api/companies/${companyId}`);
        if (!response.ok) {
          throw new Error('Company not found');
        }
        const data = await response.json();
        setCompany(data.company);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch company details');
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompanyDetails();
    }
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading company details...</div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Company Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The requested company could not be found.'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Button variant="outline" onClick={() => window.history.back()}>
            ← Back
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={company.logoUrl} alt={company.companyName} />
              <AvatarFallback className="text-2xl">
                {company.companyName?.slice(0, 2)?.toUpperCase() || 'CO'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{company.companyName || 'Unnamed Company'}</CardTitle>
              <p className="text-gray-600">{company.email}</p>
              <div className="flex gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  company.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {company.approved ? 'Approved' : 'Pending Approval'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  company.isOnboarded ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {company.isOnboarded ? 'Onboarded' : 'Not Onboarded'}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Industry:</span>
                <span className="ml-2 text-gray-600">{company.industry || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium">Company Size:</span>
                <span className="ml-2 text-gray-600">{company.size || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium">Founded:</span>
                <span className="ml-2 text-gray-600">{company.foundedYear || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium">Website:</span>
                {company.website ? (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:underline">
                    {company.website}
                  </a>
                ) : (
                  <span className="ml-2 text-gray-600">Not specified</span>
                )}
              </div>
              <div>
                <span className="font-medium">Address:</span>
                <span className="ml-2 text-gray-600">{company.address || 'Not specified'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium">Contact Person:</span>
                <span className="ml-2 text-gray-600">{company.contactName || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium">Business Email:</span>
                <span className="ml-2 text-gray-600">{company.businessEmail || company.email}</span>
              </div>
              <div>
                <span className="font-medium">Phone:</span>
                <span className="ml-2 text-gray-600">{company.phone || 'Not specified'}</span>
              </div>
              <div>
                <span className="font-medium">Created:</span>
                <span className="ml-2 text-gray-600">
                  {company.createdAt ? new Date(company.createdAt).toLocaleDateString() : 'Not specified'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {company.description && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{company.description}</p>
            </CardContent>
          </Card>
        )}

        {company.certificateUrl && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Company Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <img 
                  src={company.certificateUrl} 
                  alt="Company Certificate" 
                  className="max-w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
