"use client";

import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/content/privacy", { cache: "no-store" });
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
              <p className="text-skill text-xl font-semibold">Privacy Policy</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 pb-[100px] flex-1 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  SkillTag Privacy Policy
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
                  At SkillTag, we are committed to protecting your privacy and
                  ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you use our platform.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly to us, such as
                  when you create an account, complete your profile, apply for
                  gigs, or contact us for support. This may include your name,
                  email address, educational background, skills, resume, and
                  other professional information.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  2. How We Use Your Information
                </h2>
                <p>
                  We use the information we collect to provide, maintain, and
                  improve our services, including matching students with
                  relevant opportunities, facilitating communication between
                  users, and personalizing your experience on our platform.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  3. Information Sharing
                </h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal
                  information to third parties without your consent, except as
                  described in this policy. We may share your information with
                  startups and companies when you apply for their posted
                  opportunities.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  4. Data Security
                </h2>
                <p>
                  We implement appropriate technical and organizational measures
                  to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  5. Your Rights
                </h2>
                <p>
                  You have the right to access, update, or delete your personal
                  information. You may also opt out of certain communications
                  from us. To exercise these rights, please contact us using the
                  information provided below.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  6. Changes to This Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Effective Date" above.
                </p>

                <h2 className="text-lg font-semibold text-gray-900 mt-6 mb-3">
                  7. Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at privacy@skilltag.com
                </p>
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
                SkillTag Privacy Policy
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
                  <p className="text-lg">
                    At SkillTag, we are committed to protecting your privacy and
                    ensuring the security of your personal information. This
                    Privacy Policy explains how we collect, use, disclose, and
                    safeguard your information when you use our platform.
                  </p>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      1. Information We Collect
                    </h2>
                    <p>
                      We collect information you provide directly to us, such as
                      when you create an account, complete your profile, apply for
                      gigs, or contact us for support. This may include your name,
                      email address, educational background, skills, resume, and
                      other professional information.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      2. How We Use Your Information
                    </h2>
                    <p>
                      We use the information we collect to provide, maintain, and
                      improve our services, including matching students with
                      relevant opportunities, facilitating communication between
                      users, and personalizing your experience on our platform.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      3. Information Sharing
                    </h2>
                    <p>
                      We do not sell, trade, or otherwise transfer your personal
                      information to third parties without your consent, except as
                      described in this policy. We may share your information with
                      startups and companies when you apply for their posted
                      opportunities.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      4. Data Security
                    </h2>
                    <p>
                      We implement appropriate technical and organizational
                      measures to protect your personal information against
                      unauthorized access, alteration, disclosure, or destruction.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      5. Your Rights
                    </h2>
                    <p>
                      You have the right to access, update, or delete your
                      personal information. You may also opt out of certain
                      communications from us. To exercise these rights, please
                      contact us using the information provided below.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      6. Changes to This Policy
                    </h2>
                    <p>
                      We may update this Privacy Policy from time to time. We will
                      notify you of any changes by posting the new Privacy Policy
                      on this page and updating the "Effective Date" above.
                    </p>
                  </div>

                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      7. Contact Us
                    </h2>
                    <p>
                      If you have any questions about this Privacy Policy, please
                      contact us at privacy@skilltag.com
                    </p>
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
