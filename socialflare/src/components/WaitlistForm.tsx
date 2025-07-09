import React, { useState } from 'react';

const years = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Final Year',
  'PostGraduate',
  'Other'
];

const WaitlistForm: React.FC = () => {
  const [form, setForm] = useState({
    fullName: '',
    collegeName: '',
    year: '',
    branch: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('You have been added to the waitlist!');
        setForm({ fullName: '', collegeName: '', year: '', branch: '', email: '' });
      } else {
        setError(data.message || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // <div className="min-h-screen bg-[#10151c] flex flex-col items-center justify-start py-0 px-2">
    //   {/* Hero Section */}
    //   <div className="w-full flex flex-col items-center justify-center pt-12 pb-8 bg-gradient-to-br from-[#10151c] to-[#f8fafc] relative">
    //     {/* Decorative circles */}
    //     <div className="absolute left-8 top-8 w-32 h-32 bg-[#e6f7ff] rounded-full opacity-30 blur-2xl z-0" />
    //     <div className="absolute right-8 bottom-8 w-40 h-40 bg-[#b6f7c6] rounded-full opacity-20 blur-2xl z-0" />
    //     <span className="relative z-10 inline-flex items-center px-4 py-1 rounded-full bg-[#e6f7ff] text-[#2563eb] font-semibold text-sm mb-4 mt-4 shadow-sm">
    //       <FaUserGraduate className="mr-2" /> For Students
    //     </span>
    //     <h1 className="relative z-10 text-4xl sm:text-6xl font-extrabold text-center text-white mb-4 font-poppins drop-shadow-lg">
    //       Discover, Learn, Launch
    //     </h1>
    //     <p className="relative z-10 text-lg sm:text-2xl text-[#e6eaf1] text-center mb-8 max-w-2xl font-poppins">
    //       Join SocialFlare to explore student gigs and micro-internships that build your portfolio and confidence.
    //     </p>
    //     <div className="relative z-10 flex flex-col items-center gap-2">
    //       <button
    //         className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ADFF00] to-[#4ade80] text-[#1F2E47] font-semibold text-lg shadow-md hover:from-[#bfff3c] hover:to-[#22d3ee] transition mb-2"
    //         onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
    //       >
    //         Join the Waitlist
    //       </button>
    //       <div className="flex items-center gap-2 text-[#e6eaf1] font-medium text-base">
    //         <span className="inline-flex items-center"><FaUserGraduate className="mr-1 text-[#4ade80]" /> 500+ students already joined</span>
    //       </div>
    //     </div>
    //   </div>
    //
    //   {/* Why Choose SocialFlare Section */}
    //   <div className="w-full bg-[#f8fafc] py-16 px-2 flex flex-col items-center">
    //     ...
    //   </div>
    //
    //   {/* Who is SocialFlare for Section */}
    //   <div className="w-full bg-white py-16 px-2 flex flex-col items-center">
    //     ...
    //   </div>
    //
    //   {/* Footer Section (copied from App.tsx) */}
    //   <div className="w-full bg-[#F6F9FF] pt-8 sm:pt-12 pb-4 sm:pb-6 px-2 md:px-8 font-poppins text-[#1F2E47] text-xs md:text-sm mt-16">
    //     ...
    //   </div>
    // </div>
    <div id="waitlist-form" className="w-full flex flex-col items-center justify-center mt-0 bg-black">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-white sm:rounded-3xl shadow-xl p-4 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-8 sm:mt-12"
        style={{ boxShadow: '0 8px 32px rgba(31,46,71,0.10)' }}
      >
        <div className="flex flex-col col-span-1">
          <label className="font-semibold mb-1 text-[#1F2E47]">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Your full name"
            required
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc] w-full"
          />
        </div>
        <div className="flex flex-col col-span-1">
          <label className="font-semibold mb-1 text-[#1F2E47]">College Name *</label>
          <input
            type="text"
            name="collegeName"
            value={form.collegeName}
            onChange={handleChange}
            placeholder="Your college name"
            required
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc] w-full"
          />
        </div>
        <div className="flex flex-col col-span-1">
          <label className="font-semibold mb-1 text-[#1F2E47]">Year of Study *</label>
          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            required
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc] w-full"
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col col-span-1">
          <label className="font-semibold mb-1 text-[#1F2E47]">Branch/Department *</label>
          <input
            type="text"
            name="branch"
            value={form.branch}
            onChange={handleChange}
            placeholder="e.g., Computer Science"
            required
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc] w-full"
          />
        </div>
        <div className="flex flex-col col-span-1 sm:col-span-2">
          <label className="font-semibold mb-1 text-[#1F2E47]">Email Address *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your.email@college.edu"
            required
            className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc] w-full"
          />
        </div>
        <div className="col-span-1 sm:col-span-2 mt-2">
          <button
            type="submit"
            className="w-full py-3 rounded-xl text-[#1F2E47] font-semibold text-lg shadow-md transition-all bg-gradient-to-r from-[#ADFF00] to-[#4ade80] hover:from-[#bfff3c] hover:to-[#22d3ee] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Join StudentGigs'}
          </button>
        </div>
        {success && <div className="col-span-1 sm:col-span-2 text-green-600 text-center font-semibold mt-2">{success}</div>}
        {error && <div className="col-span-1 sm:col-span-2 text-red-600 text-center font-semibold mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default WaitlistForm; 