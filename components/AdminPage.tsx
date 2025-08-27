"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type CompanyApproval = {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
  isOnboarded?: boolean;
  createdAt?: string;
  logoUrl?: string;
  certificateUrl?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  foundedYear?: string;
  address?: string;
  phone?: string;
  companyName?: string;
  contactName?: string;
  businessEmail?: string;
};

type UserApproval = {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
  setupComplete?: boolean;
  createdAt?: string;
  image?: string;
  idImageUrl?: string;
  institution?: string;
  graduationYear?: string;
  department?: string;
  branch?: string;
  state?: string;
  phone?: string;
  description?: string;
  skills?: string[];
  gender?: string;
  dateOfBirth?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  resumeUrl?: string;
};

const AdminPage: React.FC = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyApproval[]>([]);
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string } | null>(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setForbidden(false);
    try {
      const res = await fetch('/api/admin/approvals');
      if (res.status === 403) {
        setForbidden(true);
        setCompanies([]);
        setUsers([]);
        return;
      }
      if (!res.ok) throw new Error('Failed to load approvals');
      const data = await res.json();
      setCompanies(data.companies || []);
      setUsers(data.users || []);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to load approvals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchApprovals();
    }
  }, [status]);

  const toggleApproval = async (
    entity: 'company' | 'user',
    id: string,
    approved: boolean
  ) => {
    const key = `${entity}-${id}`;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const res = await fetch('/api/admin/approvals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entity, id, approved }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update approval');
      }
      if (entity === 'company') {
        setCompanies(prev => prev.map(c => (c._id === id ? { ...c, approved } : c)));
      } else {
        setUsers(prev => prev.map(u => (u._id === id ? { ...u, approved } : u)));
      }
      toast({ title: 'Updated', description: `${entity === 'company' ? 'Company' : 'User'} ${approved ? 'approved' : 'revoked'}.` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to update approval', variant: 'destructive' });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const ImageModal = ({ url, title }: { url: string; title: string }) => (
    <Dialog open={!!url} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center">
          <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  );

  const Header = (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Approvals</h1>
      <div className="flex items-center gap-3">
        {session?.user?.image && (
          <Avatar className="w-8 h-8">
            <AvatarImage src={session.user.image} alt={session.user.name || 'Admin'} />
            <AvatarFallback>{session?.user?.name?.slice(0,2)?.toUpperCase() || 'AD'}</AvatarFallback>
          </Avatar>
        )}
        {status === 'authenticated' ? (
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/' })}>Sign out</Button>
        ) : (
          <Button onClick={() => signIn('google', { callbackUrl: '/admin' })}>Sign in with Google</Button>
        )}
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        {Header}
        <div>Loading session...</div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        {Header}
        <div className="mt-10 max-w-md bg-white text-gray-900 rounded-xl p-6 shadow-lg">
          <p className="mb-4">Please sign in with an admin account to continue.</p>
          <Button onClick={() => signIn('google', { callbackUrl: '/admin' })}>
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  if (forbidden) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
        {Header}
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {Header}
      <div className="bg-white text-gray-900 rounded-xl p-4 shadow-lg">
        <Tabs defaultValue="companies">
          <TabsList>
            <TabsTrigger value="companies">Companies ({companies.length})</TabsTrigger>
            <TabsTrigger value="users">Students ({users.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="companies">
            {loading ? (
              <div className="p-4">Loading companies...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-3 font-medium">Company</th>
                      <th className="p-3 font-medium">Contact</th>
                      <th className="p-3 font-medium">Details</th>
                      <th className="p-3 font-medium">Documents</th>
                      <th className="p-3 font-medium">Created</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length === 0 ? (
                      <tr><td colSpan={7} className="p-4 text-center text-gray-500">No companies found.</td></tr>
                    ) : (
                      companies.map((c) => (
                        <tr key={c._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {c.logoUrl ? (
                                <img src={c.logoUrl} alt={c.companyName || c.name} className="w-10 h-10 rounded object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Logo</div>
                              )}
                              <div>
                                <div className="font-medium">{c.companyName || c.name || '—'}</div>
                                <div className="text-gray-500 text-xs">{c.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>{c.contactName || '—'}</div>
                              <div className="text-gray-500">{c.phone || '—'}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm space-y-1">
                              <div><span className="font-medium">Industry:</span> {c.industry || '—'}</div>
                              <div><span className="font-medium">Size:</span> {c.size || '—'}</div>
                              <div><span className="font-medium">Founded:</span> {c.foundedYear || '—'}</div>
                              <div><span className="font-medium">Website:</span> {c.website ? <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{c.website}</a> : '—'}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              {c.certificateUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedImage({ url: c.certificateUrl!, title: 'Company Certificate' })}
                                  className="w-full"
                                >
                                  View Certificate
                                </Button>
                              )}
                              {c.logoUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedImage({ url: c.logoUrl!, title: 'Company Logo' })}
                                  className="w-full"
                                >
                                  View Logo
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              c.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {c.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <Button
                                variant={c.approved ? 'outline' : 'default'}
                                size="sm"
                                disabled={saving[`company-${c._id}`]}
                                onClick={() => toggleApproval('company', c._id, !c.approved)}
                                className="w-full"
                              >
                                {saving[`company-${c._id}`]
                                  ? 'Saving...'
                                  : c.approved ? 'Revoke' : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/companies/details/${c._id}`, '_blank')}
                                className="w-full"
                              >
                                View Profile
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="users">
            {loading ? (
              <div className="p-4">Loading users...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b bg-gray-50">
                      <th className="p-3 font-medium">Student</th>
                      <th className="p-3 font-medium">Education</th>
                      <th className="p-3 font-medium">Contact</th>
                      <th className="p-3 font-medium">Documents</th>
                      <th className="p-3 font-medium">Created</th>
                      <th className="p-3 font-medium">Status</th>
                      <th className="p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={7} className="p-4 text-center text-gray-500">No users found.</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="border-b last:border-0 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              {u.image ? (
                                <img src={u.image} alt={u.name} className="w-10 h-10 rounded-full object-cover" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs">No Image</div>
                              )}
                              <div>
                                <div className="font-medium">{u.name || '—'}</div>
                                <div className="text-gray-500 text-xs">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm space-y-1">
                              <div><span className="font-medium">Institution:</span> {u.institution || '—'}</div>
                              <div><span className="font-medium">Department:</span> {u.department || u.branch || '—'}</div>
                              <div><span className="font-medium">Graduation:</span> {u.graduationYear || '—'}</div>
                              <div><span className="font-medium">State:</span> {u.state || '—'}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>{u.phone || '—'}</div>
                              <div className="text-gray-500">{u.gender || '—'}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              {u.idImageUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedImage({ url: u.idImageUrl!, title: 'Student ID Card' })}
                                  className="w-full"
                                >
                                  View ID Card
                                </Button>
                              )}
                              {u.image && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedImage({ url: u.image!, title: 'Student Photo' })}
                                  className="w-full"
                                >
                                  View Photo
                                </Button>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm text-gray-600">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              u.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.approved ? 'Approved' : 'Pending'}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="space-y-2">
                              <Button
                                variant={u.approved ? 'outline' : 'default'}
                                size="sm"
                                disabled={saving[`user-${u._id}`]}
                                onClick={() => toggleApproval('user', u._id, !u.approved)}
                                className="w-full"
                              >
                                {saving[`user-${u._id}`]
                                  ? 'Saving...'
                                  : u.approved ? 'Revoke' : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/profile/${u._id}`, '_blank')}
                                className="w-full"
                              >
                                View Profile
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Image Modal */}
      {selectedImage && (
        <ImageModal url={selectedImage.url} title={selectedImage.title} />
      )}
    </div>
  );
};

export default AdminPage;