"use client";

import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import CompaniesNavbar from "@/components/CompaniesNavbar";

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPostGigPage = pathname === "/companies/post-gig";

  return (
    <SessionProvider>
      <div
        className="flex min-h-screen"
        style={{
          background: `
    radial-gradient(circle at 20% -20%, #c4f542 0%, #c4f542 15%, rgba(196, 245, 66, 0.6) 35%, rgba(196, 245, 66, 0.2) 50%, transparent 70%),
    radial-gradient(circle at 80% -10%, #c4f542 0%, #c4f542 8%, rgba(196, 245, 66, 0.4) 20%, rgba(196, 245, 66, 0.1) 35%, transparent 50%),
    #f8f9fa
  `,
        }}
      >
        {!isPostGigPage && <CompaniesNavbar />}
        <main className={`${isPostGigPage ? "w-full" : "flex-1"}`}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
