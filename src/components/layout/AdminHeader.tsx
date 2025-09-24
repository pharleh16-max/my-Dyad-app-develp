import { Header } from "@/components/layout/Header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigation } from "@/hooks/useNavigation";
import { useAuthState } from "@/hooks/useAuthState";

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const isMobile = useIsMobile();
  const { toggleSideMenu } = useNavigation("admin");
  const { profile } = useAuthState();

  return (
    <Header
      title={title}
      showMenu={isMobile}
      onMenuClick={toggleSideMenu}
      userRole="admin"
      userName={profile?.full_name || "Admin"}
    />
  );
}