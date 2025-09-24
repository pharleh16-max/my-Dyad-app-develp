import { Header } from "@/components/layout/Header";
import { UserRole } from "@/hooks/useNavigation"; // Import UserRole type

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
  userRole: UserRole; // Add userRole prop
  userName: string; // Add userName prop
  onSettingsClick?: () => void; // New prop
  onNotificationsClick?: () => void; // New prop
}

export function AdminHeader({ 
  title, 
  onMenuClick, 
  userRole, 
  userName,
  onSettingsClick,
  onNotificationsClick
}: AdminHeaderProps) {
  return (
    <Header
      title={title}
      showMenu={true} // Always show menu button in AdminHeader, its visibility is controlled by Header's internal logic (md:hidden)
      onMenuClick={onMenuClick}
      userRole={userRole}
      userName={userName}
      onSettingsClick={onSettingsClick}
      onNotificationsClick={onNotificationsClick}
    />
  );
}