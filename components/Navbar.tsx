"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Clock3, CheckCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransitionLink from "./TransitionLink";

const navItems = [
  { name: "Home", href: "/home", icon: Home },
  { name: "Applied", href: "/applied", icon: FileText },
  { name: "Ongoing", href: "/ongoing", icon: Clock3 },
  { name: "Completed", href: "/completed", icon: CheckCircle },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();
  const showNavbar = [
    "/home",
    "/applied",
    "/ongoing",
    "/completed",
    "/profile",
  ].includes(pathname);
  if (!showNavbar) return null;

  return (
    <div className="w-64 bg-black p-6 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center mb-8">
        <div className="w-16 h-16 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
          <div className="w-8 h-12 bg-white transform rotate-12 rounded-sm"></div>
        </div>
        <span className="text-white text-2xl font-light text-center">
          zig<span className="font-normal">work</span>
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 space-y-2 flex flex-col justify-center">
        {navItems.map(({ name, href, icon: Icon }) => (
          <TransitionLink href={href} legacyBehavior passHref>
            <Button
              asChild
              className={`w-full justify-start bg-transparent ${
                pathname === href
                  ? "text-purple-400 hover:bg-transparent hover:text-purple-200"
                  : "text-gray-400 hover:bg-transparent hover:text-purple-200"
              }`}
            >
              <a>
                <Icon className="w-5 h-5 mr-3" />
                {name}
              </a>
            </Button>
          </TransitionLink>
        ))}
      </nav>
      {/* Footer Links */}
      <div className="space-y-2 text-sm text-gray-500 mt-8">
        <div className="flex gap-4">
          <button className="hover:text-gray-300">Support</button>
          <button className="hover:text-gray-300">Privacy Policy</button>
        </div>
        <button className="hover:text-gray-300">Terms & Conditions</button>
      </div>
    </div>
  );
}
