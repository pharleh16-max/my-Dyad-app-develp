import { Header } from "@/components/layout/Header";
// Removed useIsMobile and useAuthState as props are passed from AdminLayout
import { UserRole } from "@/hooks/useNavigation"; // Import UserRole type

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
  userRole: UserRole; // Add userRole prop
  userName: string; // Add userName prop
  onSettingsClick?: () => void; // New prop
  onProfileClick?: () => void; // New prop
  onNotificationsClick?: () => void; // New prop
}

export function AdminHeader({ 
  title, 
  onMenuClick, 
  userRole, 
  userName,
  onSettingsClick,
  onProfileClick,
  onNotificationsClick
}: AdminHeaderProps) {
  // isMobile is determined by the parent (AdminLayout) and passed via onMenuClick's visibility
  // profile is passed as userName and userRole
  return (
    <Header
      title={title}
      showMenu={true} // Always show menu button in AdminHeader, its visibility is controlled by Header's internal logic (md:hidden)
      onMenuClick={onMenuClick}
      userRole={userRole}
      userName={userName}
      onSettingsClick={onSettingsClick}
      onProfileClick={onProfileClick}
      onNotificationsClick={onNotificationsClick}
    />
  );
}