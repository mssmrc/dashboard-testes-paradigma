import { Header } from "@/components/Header";
import { getProjectMetadata } from "@/lib/actions/project-metadata";

type AppHeaderProps = {
  title?: string;
  subtitle?: string;
};

export async function AppHeader({ title, subtitle }: AppHeaderProps) {
  const metadata = await getProjectMetadata();

  return (
    <Header
      title={title}
      subtitle={subtitle}
      clientLogoPath={metadata.clientLogoPath}
    />
  );
}
