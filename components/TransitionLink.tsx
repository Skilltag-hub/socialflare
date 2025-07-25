"use client";

import { usePathname, useRouter } from "next/navigation";
import { animatePageOut } from "@/utils/animations";
import React from "react";

interface Props {
  href: string;
  children: React.ReactNode;
  className?: string;
  disableTransition?: boolean;
}

const TransitionLink = ({
  href,
  children,
  className,
  disableTransition,
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (disableTransition) {
      router.push(href);
      return;
    }
    if (pathname !== href || pathname == "/applied") {
      animatePageOut(href, router);
    }
  };

  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
};

export default TransitionLink;
