import OfficeDayClient from "./OfficeDayClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <OfficeDayClient officeId={id} />;
}