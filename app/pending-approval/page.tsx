import Link from "next/link";

export default function PendingApprovalPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const type = (searchParams?.type as string) || "user"; // "user" | "company"
  const isCompany = type === "company";

  return (
    <div className="min-h-screen bg-skill text-white flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-gray-800/50 rounded-2xl p-8 shadow-lg border border-gray-800">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 text-yellow-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
              <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0Z" />
            </svg>
          </div>
        </div>
        <h1 className="text-2xl font-semibold mb-2 text-skillText">
          Approval Pending
        </h1>
        <p className="text-gray-300 mb-6 ">
          {isCompany
            ? "Your company account is pending admin approval. You won't be able to post gigs until approved."
            : "Your profile is pending admin approval. You won't be able to apply to gigs until approved."}
        </p>
        <div className="space-y-3 text-sm text-gray-400 mb-8">
          <p>We typically review and approve accounts within 24-48 hours.</p>
        </div>
        <div className="flex gap-3">
          {isCompany ? (
            <>
              <Link
                href="/companies"
                className="px-4 py-2 rounded-lg bg-skill text-skillText transition-colors"
              >
                Back to Companies
              </Link>
              <Link
                href="/companies/profile"
                className="px-4 py-2 rounded-lg bg-skillText text-skill border border-gray-700 transition-colors"
              >
                View Company Profile
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/home"
                className="px-4 py-2 rounded-lg bg-skill text-skillText transition-colors"
              >
                Back to Home
              </Link>
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg bg-skillText text-skill border border-gray-700 transition-colors"
              >
                View Your Profile
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
