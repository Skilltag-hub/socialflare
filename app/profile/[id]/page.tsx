import ProfileComponent from "@/components/ProfileComponent";

interface ProfilePageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = await params;

  return <ProfileComponent userId={resolvedParams.id} hideEditButton={true} />;
}
