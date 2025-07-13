import React, { useState, useEffect } from 'react';

interface WaitlistEntry {
  fullName: string;
  collegeName: string;
  year: string;
  branch: string;
  email: string;
  createdAt: string;
  _id?: string;
}

const ADMIN_USER = 'skilltag';
const ADMIN_PASS = 'skilltag123';

const AdminPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authed) {
      setLoading(true);
      fetch('/api/waitlist')
        .then(res => res.json())
        .then(data => {
          setWaitlist(data.waitlist || []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USER && password === ADMIN_PASS) {
      setAuthed(true);
      setError(null);
    } else {
      setError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setAuthed(false);
    setUsername('');
    setPassword('');
    setWaitlist([]);
  };

  return (
    <div className="min-h-screen bg-[#10151c] flex flex-col items-center py-12 px-2">
      <h1 className="text-4xl font-extrabold text-white mb-8 font-poppins">Admin - SocialFlare Waitlist</h1>
      {!authed ? (
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-xl p-8 flex flex-col gap-4 w-full max-w-xs">
          <label className="font-semibold text-[#1F2E47]">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00] bg-[#f8fafc] text-[#1F2E47]" required />
          <label className="font-semibold text-[#1F2E47]">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ADFF00] bg-[#f8fafc] text-[#1F2E47]" required />
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          <button type="submit" className="w-full py-3 rounded-xl text-[#1F2E47] font-semibold text-lg shadow-md transition-all bg-gradient-to-r from-[#ADFF00] to-[#4ade80] hover:from-[#bfff3c] hover:to-[#22d3ee]">Login</button>
        </form>
      ) : (
        <div className="w-full max-w-5xl flex flex-col items-center">
          <button onClick={handleLogout} className="self-end mb-4 px-4 py-2 rounded-xl bg-gradient-to-r from-[#ADFF00] to-[#4ade80] text-[#1F2E47] font-semibold shadow hover:from-[#bfff3c] hover:to-[#22d3ee]">Logout</button>
          <h2 className="text-2xl font-bold text-white mb-4">Waitlist Participants</h2>
          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="min-w-full bg-white rounded-xl overflow-hidden text-[#1F2E47]">
                <thead>
                  <tr className="bg-[#ADFF00] text-[#1F2E47]">
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">College</th>
                    <th className="px-4 py-2 text-left">Year</th>
                    <th className="px-4 py-2 text-left">Branch</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlist.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-4">No participants yet.</td></tr>
                  ) : (
                    waitlist.map((entry, idx) => (
                      <tr key={entry._id || idx} className="border-b last:border-b-0">
                        <td className="px-4 py-2 whitespace-nowrap">{entry.fullName}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.collegeName}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.year}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.branch}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{entry.email}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(entry.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage; 