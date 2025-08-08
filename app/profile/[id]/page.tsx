import ProfileComponent from "@/components/ProfileComponent";
import { notFound } from "next/navigation";

interface ProfilePageProps {
  params: { id: string };
}

export default function ProfilePage({ params }: ProfilePageProps) {
  // Pass the userId from the route to the UserProfile component
  // Do not render the edit profile button in this context
  return <ProfileComponent userId={params.id} hideEditButton={true} />;
}
