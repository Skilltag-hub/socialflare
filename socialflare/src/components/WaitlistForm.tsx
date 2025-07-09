import React, { useState } from 'react';
import { FaUserGraduate } from 'react-icons/fa';

const years = [
  'First Year',
  'Second Year',
  'Third Year',
  'Fourth Year',
  'Other',
];

const languages = [
  { code: "EN", label: "English" },
  { code: "FR", label: "French" },
  { code: "ES", label: "Spanish" },
  { code: "DE", label: "German" },
  { code: "RU", label: "Russian" },
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
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#10151c] flex flex-col items-center justify-start py-0 px-2">
      {/* Hero Section */}
      <div className="w-full flex flex-col items-center justify-center pt-12 pb-8 bg-gradient-to-br from-[#10151c] to-[#f8fafc] relative">
        {/* Decorative circles */}
        <div className="absolute left-8 top-8 w-32 h-32 bg-[#e6f7ff] rounded-full opacity-30 blur-2xl z-0" />
        <div className="absolute right-8 bottom-8 w-40 h-40 bg-[#b6f7c6] rounded-full opacity-20 blur-2xl z-0" />
        <span className="relative z-10 inline-flex items-center px-4 py-1 rounded-full bg-[#e6f7ff] text-[#2563eb] font-semibold text-sm mb-4 mt-4 shadow-sm">
          <FaUserGraduate className="mr-2" /> For Students
        </span>
        <h1 className="relative z-10 text-4xl sm:text-6xl font-extrabold text-center text-white mb-4 font-poppins drop-shadow-lg">
          Discover, Learn, Launch
        </h1>
        <p className="relative z-10 text-lg sm:text-2xl text-[#e6eaf1] text-center mb-8 max-w-2xl font-poppins">
          Join SocialFlare to explore student gigs and micro-internships that build your portfolio and confidence.
        </p>
        <div className="relative z-10 flex flex-col items-center gap-2">
          <button
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ADFF00] to-[#4ade80] text-[#1F2E47] font-semibold text-lg shadow-md hover:from-[#bfff3c] hover:to-[#22d3ee] transition mb-2"
            onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Join the Waitlist
          </button>
          <div className="flex items-center gap-2 text-[#e6eaf1] font-medium text-base">
            <span className="inline-flex items-center"><FaUserGraduate className="mr-1 text-[#4ade80]" /> 500+ students already joined</span>
          </div>
        </div>
      </div>

      {/* Why Choose SocialFlare Section */}
      <div className="w-full bg-[#f8fafc] py-16 px-2 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#1F2E47] mb-2 font-poppins">Why Choose SocialFlare?</h2>
        <p className="text-lg text-center text-[#6B7280] mb-10 font-poppins">We're building the bridge between academic learning and real-world experience</p>
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-5xl justify-center">
          <div className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#e6f7ff] mb-4">
              <svg width="32" height="32" fill="none" stroke="#2563eb" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
            </div>
            <h3 className="font-bold text-xl text-[#1F2E47] mb-2">Real-World Experience</h3>
            <p className="text-[#1F2E47] text-center">Work on actual projects with real companies and gain hands-on experience that classroom learning can't provide.</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#e6ffe6] mb-4">
              <svg width="32" height="32" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><polyline points="7 11 12 16 17 11"/><line x1="12" y1="4" x2="12" y2="16"/></svg>
            </div>
            <h3 className="font-bold text-xl text-[#1F2E47] mb-2">Skill-Building Challenges</h3>
            <p className="text-[#1F2E47] text-center">Take on micro-internships designed to develop specific skills and competencies employers are looking for.</p>
          </div>
          <div className="flex-1 bg-white rounded-2xl shadow p-8 flex flex-col items-center">
            <div className="w-14 h-14 flex items-center justify-center rounded-full bg-[#f3e6ff] mb-4">
              <svg width="32" height="32" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/></svg>
            </div>
            <h3 className="font-bold text-xl text-[#1F2E47] mb-2">Professional Portfolio</h3>
            <p className="text-[#1F2E47] text-center">Build a compelling portfolio of completed projects that showcases your abilities to future employers.</p>
          </div>
        </div>
      </div>

      {/* Who is SocialFlare for Section */}
      <div className="w-full bg-white py-16 px-2 flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-[#1F2E47] mb-2 font-poppins">Who is SocialFlare for?</h2>
        <p className="text-lg text-center text-[#6B7280] mb-10 font-poppins">We welcome students from all backgrounds and academic levels</p>
        <div className="flex flex-col sm:flex-row gap-8 w-full max-w-5xl justify-center items-center">
          <div className="flex-1 flex flex-col gap-4 items-center sm:items-start">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e6f7ff] text-[#2563eb]">
                <FaUserGraduate />
              </span>
              <span className="font-bold text-[#1F2E47] text-lg">Students from any college or stream</span>
            </div>
            <p className="text-[#1F2E47] text-base">Whether you're studying engineering, arts, commerce, or any other field, there are opportunities for you.</p>
            <div className="flex items-center gap-3 mt-6">
              <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e6ffe6] text-[#4ade80]">
                <svg width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
              </span>
              <span className="font-bold text-[#1F2E47] text-lg">Those who want to gain practical skills before graduating</span>
            </div>
            <p className="text-[#1F2E47] text-base">Perfect for students who want to bridge the gap between academic knowledge and industry requirements.</p>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-[#e6f7ff] to-[#e6ffe6] rounded-2xl shadow p-8 mt-8 sm:mt-0">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-[#2563eb] to-[#4ade80] mb-4">
              <FaUserGraduate className="text-white text-3xl" />
            </div>
            <h3 className="font-bold text-xl text-[#1F2E47] mb-2 text-center">Ready to start your journey?</h3>
            <p className="text-[#1F2E47] text-center mb-4">Join thousands of students who are already building their future with SocialFlare.</p>
            <button
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#ADFF00] to-[#4ade80] text-[#1F2E47] font-semibold text-lg shadow-md hover:from-[#bfff3c] hover:to-[#22d3ee] transition"
              onClick={() => document.getElementById('waitlist-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Join Now
            </button>
          </div>
        </div>
      </div>

      {/* Waitlist Form Section */}
      <div id="waitlist-form" className="w-full flex flex-col items-center justify-center mt-0">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-xl p-8 grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12"
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
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc]"
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
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc]"
            />
          </div>
          <div className="flex flex-col col-span-1">
            <label className="font-semibold mb-1 text-[#1F2E47]">Year of Study *</label>
            <select
              name="year"
              value={form.year}
              onChange={handleChange}
              required
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc]"
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
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc]"
            />
          </div>
          <div className="flex flex-col col-span-2">
            <label className="font-semibold mb-1 text-[#1F2E47]">Email Address *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="your.email@college.edu"
              required
              className="rounded-lg border border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#4ade80] bg-[#f8fafc]"
            />
          </div>
          <div className="col-span-2 mt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-[#1F2E47] font-semibold text-lg shadow-md transition-all bg-gradient-to-r from-[#ADFF00] to-[#4ade80] hover:from-[#bfff3c] hover:to-[#22d3ee] disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Submitting...' : 'Join StudentGigs'}
            </button>
          </div>
          {success && <div className="col-span-2 text-green-600 text-center font-semibold mt-2">{success}</div>}
          {error && <div className="col-span-2 text-red-600 text-center font-semibold mt-2">{error}</div>}
        </form>
      </div>

      {/* Footer Section (copied from App.tsx) */}
      <div className="w-full bg-[#F6F9FF] pt-8 sm:pt-12 pb-4 sm:pb-6 px-2 md:px-8 font-poppins text-[#1F2E47] text-xs md:text-sm mt-16">
        <div className="max-w-full sm:max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-12 items-start">
          {/* Left: Catalog + Logo */}
          <div className="flex flex-col gap-3 sm:gap-6 items-center sm:items-start">
            <div>
              <div className="uppercase text-[10px] sm:text-xs tracking-[0.2em] text-[#1F2E47]/50 mb-1 sm:mb-2 font-medium text-center sm:text-left">
                CATALOG
              </div>
              <div className="flex flex-col gap-1 sm:gap-2 text-base sm:text-lg font-semibold">
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
                  <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Features</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Pricing</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Product</span>
                </div>
                <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4">
                  <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Contact</span>
                  <span className="text-[#E6EAF1]">/</span>
                  <span className="hover:text-[#ADFF00] transition-colors cursor-pointer">Document</span>
                </div>
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-extrabold tracking-tight mt-2 sm:mt-4 text-[#1F2E47] opacity-80 text-center sm:text-left">SOCIALFLARE</div>
          </div>

          {/* Center: Contact & Location */}
          <div className="flex flex-col gap-4 sm:gap-10 border-l-0 sm:border-l border-r-0 sm:border-r border-[#E6EAF1] px-0 sm:px-8 items-center sm:items-start">
            <div>
              <div className="text-xs sm:text-base font-bold mb-1 sm:mb-2 tracking-wide text-[#1F2E47] text-center sm:text-left">Contact Us</div>
              <div className="text-xs sm:text-base font-normal mb-1 text-[#1F2E47]/80 text-center sm:text-left">+1 (999) 888-77-66</div>
              <div className="text-xs sm:text-base font-normal text-[#1F2E47]/80 text-center sm:text-left">hello@nskalastd.com</div>
            </div>
            <div>
              <div className="text-xs sm:text-base font-bold mb-1 sm:mb-2 tracking-wide text-[#1F2E47] text-center sm:text-left">Location</div>
              <div className="text-xs sm:text-base font-normal text-[#1F2E47]/80 text-center sm:text-left">
                483920, Indonesia,<br />Lampung 22/2/5, Office 4
              </div>
            </div>
          </div>

          {/* Right: Languages */}
          <div className="flex flex-col items-center sm:items-end gap-2 sm:gap-4">
            <div className="text-[10px] sm:text-xs font-medium text-[#1F2E47]/60">Languages</div>
            <div className="flex gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap justify-center sm:justify-end">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  className={`$ {
                    lang.code === "EN" ? "text-[#2563eb] font-bold underline" : "hover:text-[#ADFF00] transition-colors" 
                  } px-2 py-1 rounded focus:outline-none focus:ring-1 focus:ring-[#ADFF00]`}
                >
                  {lang.code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitlistForm; 