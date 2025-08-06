'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import CompaniesNavbar from '@/components/CompaniesNavbar';

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPostGigPage = pathname === '/companies/post-gig';

  return (
    <SessionProvider>
      <div className="flex min-h-screen bg-black">
        {!isPostGigPage && <CompaniesNavbar />}
        <main className={`${isPostGigPage ? 'w-full' : 'flex-1'}`}>
          {children}
        </main>
      </div>
    </SessionProvider>
  );
}
