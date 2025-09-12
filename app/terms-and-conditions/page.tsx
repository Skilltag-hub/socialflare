"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function TermsAndConditionsPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/content/terms", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setContent(data?.content || "");
        }
      } catch {}
      finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Mobile Layout */}
      <div className="min-h-screen flex flex-col lg:hidden bg-gradient-to-b from-purple-100 to-purple-200">
        <div className="w-full max-w-sm mx-auto overflow-hidden flex flex-col h-screen relative">
          <div className="fixed bottom-1 inset-x-0 z-50">
            <Navbar />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-8 sticky top-0 z-10 bg-transparent">
            <div>
              <p className="text-skill text-xl font-semibold">
                Terms & Conditions
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-[100px] flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  SkillTag Terms & Conditions
                </h1>
                <p className="text-gray-600">
                  Effective Date: 30th August, 2025
                </p>
              </div>
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : content ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
              ) : (
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed space-y-4">
                <p>
                  These Terms & Conditions ("Terms") govern your access to and
                  use of SkillTag ("SkillTag," "we," "us," or "our"), a platform
                  that connects students with startups, companies, and mentors
                  for gigs, projects, and micro-internships (collectively, the
                  "Services").
                </p>
                <p>
                  By using SkillTag, you agree to these Terms and our Privacy
                  Policy. If you do not agree, please stop using the Services
                  immediately.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  1. Eligibility
                </h2>
                <p>
                  <strong>Students/Fresh Graduates:</strong> Must be 18 years or
                  older, enrolled in or recently graduated from a recognized
                  educational institution.
                </p>
                <p>
                  <strong>Startups/Companies:</strong> Must be legally
                  registered and authorized to post opportunities.
                </p>
                <p>
                  By using SkillTag, you confirm that all information provided
                  is accurate and truthful.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  2. Platform Role
                </h2>
                <p>
                  SkillTag acts only as a connector between students and
                  opportunity providers.
                </p>
                <p>
                  We are not an employer, recruiter, or guarantor of any
                  engagement.
                </p>
                <p>
                  We do not vet, endorse, or guarantee the accuracy, legality,
                  or quality of posted opportunities or user profiles.
                </p>
                <p>
                  All engagements, agreements, and outcomes are solely between
                  students and startups/companies.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  3. User Responsibilities
                </h2>
                <p>
                  <strong>Accuracy of Information:</strong> You are solely
                  responsible for the truthfulness of the information you
                  provide, including resumes, profiles, and gig postings.
                </p>
                <p>
                  <strong>Compliance:</strong> Users must comply with all
                  applicable labor, internship, and employment laws in their
                  jurisdiction.
                </p>
                <p>
                  <strong>Due Diligence:</strong> Both students and startups are
                  responsible for conducting their own checks before entering
                  into any engagement.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  4. Prohibited Activities
                </h2>
                <p>Users may not:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    Misrepresent their identity, skills, qualifications, or
                    company details.
                  </li>
                  <li>Post fraudulent, misleading, or exploitative gigs.</li>
                  <li>
                    Use the platform for harassment, spam, or illegal
                    activities.
                  </li>
                  <li>
                    Upload content that infringes on intellectual property or
                    violates the rights of others.
                  </li>
                  <li>Attempt to hack, disrupt, or misuse the Services.</li>
                </ul>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  5. Intellectual Property
                </h2>
                <p>
                  All SkillTag branding, logos, and platform content belong to
                  SkillTag.
                </p>
                <p>
                  Users retain ownership of their own content (resumes,
                  profiles, gig postings).
                </p>
                <p>
                  By uploading content, users grant SkillTag a limited,
                  non-exclusive license to display and share it as needed to
                  operate the Services.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  6. Disputes Between Users
                </h2>
                <p>
                  Any dispute between students and startups/companies must be
                  resolved directly between those parties.
                </p>
                <p>
                  SkillTag is not responsible for mediating, resolving, or
                  compensating for disputes.
                </p>
                <p>
                  Users agree to hold SkillTag harmless from any claims arising
                  from such disputes.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  7. Limitation of Liability
                </h2>
                <p>
                  SkillTag provides the Services "as is" without warranties of
                  any kind.
                </p>
                <p>
                  We are not liable for lost opportunities, failed gigs, missed
                  payments, inaccurate information, or damages resulting from
                  your use of the Services.
                </p>
                <p>
                  To the maximum extent permitted by law, SkillTag's total
                  liability shall be limited to the amount you paid (if any) to
                  use the Services.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  8. Termination of Use
                </h2>
                <p>
                  SkillTag may suspend or terminate your account at any time if
                  you violate these Terms or misuse the platform.
                </p>
                <p>You may request account deletion by contacting us.</p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  9. Changes to Terms
                </h2>
                <p>We may update these Terms from time to time.</p>
                <p>
                  Updated versions will be posted on the Platform. Continued use
                  of the Services means you accept the revised Terms.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  10. Governing Law
                </h2>
                <p>These Terms are governed by the laws of India.</p>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 p-8 lg:ml-64">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">
                SkillTag Terms & Conditions
              </h1>
              <p className="text-gray-400">Effective Date: 30th August, 2025</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
              {loading ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : content ? (
                <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">{content}</div>
              ) : (
              <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6">
                <div>
                  <p className="text-lg mb-4">
                    These Terms & Conditions ("Terms") govern your access to and
                    use of SkillTag ("SkillTag," "we," "us," or "our"), a
                    platform that connects students with startups, companies,
                    and mentors for gigs, projects, and micro-internships
                    (collectively, the "Services").
                  </p>
                  <p className="text-lg">
                    By using SkillTag, you agree to these Terms and our Privacy
                    Policy. If you do not agree, please stop using the Services
                    immediately.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    1. Eligibility
                  </h2>
                  <p className="mb-2">
                    <strong>Students/Fresh Graduates:</strong> Must be 18 years
                    or older, enrolled in or recently graduated from a
                    recognized educational institution.
                  </p>
                  <p className="mb-2">
                    <strong>Startups/Companies:</strong> Must be legally
                    registered and authorized to post opportunities.
                  </p>
                  <p>
                    By using SkillTag, you confirm that all information provided
                    is accurate and truthful.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    2. Platform Role
                  </h2>
                  <p className="mb-2">
                    SkillTag acts only as a connector between students and
                    opportunity providers.
                  </p>
                  <p className="mb-2">
                    We are not an employer, recruiter, or guarantor of any
                    engagement.
                  </p>
                  <p className="mb-2">
                    We do not vet, endorse, or guarantee the accuracy, legality,
                    or quality of posted opportunities or user profiles.
                  </p>
                  <p>
                    All engagements, agreements, and outcomes are solely between
                    students and startups/companies.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    3. User Responsibilities
                  </h2>
                  <p className="mb-2">
                    <strong>Accuracy of Information:</strong> You are solely
                    responsible for the truthfulness of the information you
                    provide, including resumes, profiles, and gig postings.
                  </p>
                  <p className="mb-2">
                    <strong>Compliance:</strong> Users must comply with all
                    applicable labor, internship, and employment laws in their
                    jurisdiction.
                  </p>
                  <p>
                    <strong>Due Diligence:</strong> Both students and startups
                    are responsible for conducting their own checks before
                    entering into any engagement.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    4. Prohibited Activities
                  </h2>
                  <p className="mb-3">Users may not:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Misrepresent their identity, skills, qualifications, or
                      company details.
                    </li>
                    <li>Post fraudulent, misleading, or exploitative gigs.</li>
                    <li>
                      Use the platform for harassment, spam, or illegal
                      activities.
                    </li>
                    <li>
                      Upload content that infringes on intellectual property or
                      violates the rights of others.
                    </li>
                    <li>Attempt to hack, disrupt, or misuse the Services.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    5. Intellectual Property
                  </h2>
                  <p className="mb-2">
                    All SkillTag branding, logos, and platform content belong to
                    SkillTag.
                  </p>
                  <p className="mb-2">
                    Users retain ownership of their own content (resumes,
                    profiles, gig postings).
                  </p>
                  <p>
                    By uploading content, users grant SkillTag a limited,
                    non-exclusive license to display and share it as needed to
                    operate the Services.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    6. Disputes Between Users
                  </h2>
                  <p className="mb-2">
                    Any dispute between students and startups/companies must be
                    resolved directly between those parties.
                  </p>
                  <p className="mb-2">
                    SkillTag is not responsible for mediating, resolving, or
                    compensating for disputes.
                  </p>
                  <p>
                    Users agree to hold SkillTag harmless from any claims
                    arising from such disputes.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    7. Limitation of Liability
                  </h2>
                  <p className="mb-2">
                    SkillTag provides the Services "as is" without warranties of
                    any kind.
                  </p>
                  <p className="mb-2">
                    We are not liable for lost opportunities, failed gigs,
                    missed payments, inaccurate information, or damages
                    resulting from your use of the Services.
                  </p>
                  <p>
                    To the maximum extent permitted by law, SkillTag's total
                    liability shall be limited to the amount you paid (if any)
                    to use the Services.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    8. Termination of Use
                  </h2>
                  <p className="mb-2">
                    SkillTag may suspend or terminate your account at any time
                    if you violate these Terms or misuse the platform.
                  </p>
                  <p>You may request account deletion by contacting us.</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    9. Changes to Terms
                  </h2>
                  <p className="mb-2">
                    We may update these Terms from time to time.
                  </p>
                  <p>
                    Updated versions will be posted on the Platform. Continued
                    use of the Services means you accept the revised Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    10. Governing Law
                  </h2>
                  <p>These Terms are governed by the laws of India.</p>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
