import Navbar from "@/components/Navbar";

export default function AppliedPage() {
  return (
    <>
      {/* Mobile Layout - Below 700px */}
      <div className="min-h-screen flex items-center justify-center p-4 lg:hidden">
        <div className="text-2xl">Applied Page</div>
      </div>
      {/* Desktop Layout - Above 700px */}
      <div className="hidden lg:flex min-h-screen bg-black">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-2xl">Applied Page</div>
        </div>
      </div>
    </>
  );
}
