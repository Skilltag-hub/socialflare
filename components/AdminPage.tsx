"use client";
import React, { useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

type CompanyApproval = {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
  isOnboarded?: boolean;
  createdAt?: string;
  logoUrl?: string;
};

type UserApproval = {
  _id: string;
  name: string;
  email: string;
  approved: boolean;
  setupComplete?: boolean;
  createdAt?: string;
  image?: string;
};

const AdminPage: React.FC = () => {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [companies, setCompanies] = useState<CompanyApproval[]>([]);
  const [users, setUsers] = useState<UserApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

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

  const Header = (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold">Admin Approvals</h1>
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
      <div className="min-h-screen bg-black text-white p-6">
        {Header}
        <div>Loading session...</div>
      </div>
    );
  }

  if (status !== 'authenticated') {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        {Header}
        <div className="mt-10 max-w-md bg-white text-black rounded-xl p-6">
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
      <div className="min-h-screen bg-black text-white p-6">
        {Header}
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {Header}
      <div className="bg-white text-black rounded-xl p-4">
        <Tabs defaultValue="companies">
          <TabsList>
            <TabsTrigger value="companies">Companies</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          <TabsContent value="companies">
            {loading ? (
              <div className="p-4">Loading companies...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="p-2">Company</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Created</th>
                      <th className="p-2">Approved</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center">No companies found.</td></tr>
                    ) : (
                      companies.map((c) => (
                        <tr key={c._id} className="border-b last:border-0">
                          <td className="p-2 flex items-center gap-2">
                            {c.logoUrl ? (
                              <img src={c.logoUrl} alt={c.name} className="w-6 h-6 rounded" />
                            ) : (
                              <div className="w-6 h-6 rounded bg-gray-200" />
                            )}
                            <span>{c.name || '—'}</span>
                          </td>
                          <td className="p-2">{c.email}</td>
                          <td className="p-2">{c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}</td>
                          <td className="p-2">{c.approved ? 'Yes' : 'No'}</td>
                          <td className="p-2">
                            <Button
                              variant={c.approved ? 'outline' : 'default'}
                              disabled={saving[`company-${c._id}`]}
                              onClick={() => toggleApproval('company', c._id, !c.approved)}
                            >
                              {saving[`company-${c._id}`]
                                ? 'Saving...'
                                : c.approved ? 'Revoke' : 'Approve'}
                            </Button>
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
                    <tr className="text-left border-b">
                      <th className="p-2">User</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Created</th>
                      <th className="p-2">Approved</th>
                      <th className="p-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="p-4 text-center">No users found.</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id} className="border-b last:border-0">
                          <td className="p-2 flex items-center gap-2">
                            {u.image ? (
                              <img src={u.image} alt={u.name} className="w-6 h-6 rounded-full" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-200" />
                            )}
                            <span>{u.name || '—'}</span>
                          </td>
                          <td className="p-2">{u.email}</td>
                          <td className="p-2">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '—'}</td>
                          <td className="p-2">{u.approved ? 'Yes' : 'No'}</td>
                          <td className="p-2">
                            <Button
                              variant={u.approved ? 'outline' : 'default'}
                              disabled={saving[`user-${u._id}`]}
                              onClick={() => toggleApproval('user', u._id, !u.approved)}
                            >
                              {saving[`user-${u._id}`]
                                ? 'Saving...'
                                : u.approved ? 'Revoke' : 'Approve'}
                            </Button>
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
    </div>
  );
};

export default AdminPage;