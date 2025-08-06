import ProfileComponent from "@/components/ProfileComponent";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: { id: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // Pass the userId from the route to the UserProfile component
  // Do not render the edit profile button in this context
  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <div className="w-full max-w-screen-md px-4">
        <ProfileComponent userId={params.id} hideEditButton={true} />
      </div>
    </div>
  );
}
