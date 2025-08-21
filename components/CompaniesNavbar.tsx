"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart3, Bookmark, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Home", href: "/companies", icon: Home },
  { name: "My Zigs", href: "/companies/my-zigs", icon: BarChart3 },
  { name: "Shortlist", href: "/companies/shortlist", icon: Bookmark },
  { name: "Profile", href: "/companies/profile", icon: User },
];

export default function CompaniesNavbar() {
  const pathname = usePathname();
  const showNavbar = [
    "/companies",
    "/companies/my-zigs",
    "/companies/shortlist",
    "/companies/profile",
    "/companies/post-gig",
  ].includes(pathname);

  if (!showNavbar) return null;

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      {/* Desktop Navbar (hidden on small screens) */}
      <div className="w-64 bg-black p-6 flex-col min-h-screen hidden lg:fixed lg:flex lg:top-0 lg:left-0 lg:h-screen">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex flex-col items-center justify-center mb-2">
            <img
              src="/zigwork-logo.svg"
              alt="ZigWork Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <span className="text-white text-2xl font-light">
            zig<span className="font-normal">work</span>
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 flex flex-col justify-center">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link href={href} key={href}>
              <Button
                asChild
                className={`w-full justify-start bg-transparent transition-colors duration-150 ${
                  pathname === href
                    ? "text-skillText"
                    : "text-gray-400 hover:text-skillText"
                }`}
              >
                <span className="flex items-center">
                  <Icon className="w-5 h-5 mr-3" />
                  {name}
                </span>
              </Button>
            </Link>
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

        {/* Logout Button */}
        <div className="mt-6">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Mobile Navbar (hidden on large screens) */}
      <div className="absolute bottom-4 inset-x-0 w-full px-4 py-4 rounded-3xl z-40 lg:hidden bg-transparent">
        <div className="flex items-center justify-around">
          {navItems.map(({ name, href, icon: Icon }) => (
            <Link href={href} key={href}>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className={`h-12 w-12 ${
                  pathname === href ? "text-white" : "text-green-200"
                } hover:bg-green-500`}
              >
                <span className="flex flex-col items-center">
                  <Icon className="w-6 h-6 fill-current" />
                  <span className="text-xs mt-1">{name}</span>
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
