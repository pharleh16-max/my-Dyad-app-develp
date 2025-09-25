import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Import new modular components
import { ProfileHeaderCard } from "@/components/admin/ProfileHeaderCard";
import { PersonalInformationCard } from "@/components/admin/PersonalInformationCard";
import { PasswordManagementCard } from "@/components/admin/PasswordManagementCard";
import { BiometricSecurityCard } from "@/components/admin/BiometricSecurityCard";
import { NotificationSettingsCard } from "@/components/admin/NotificationSettingsCard";

export default function AdminProfile() {
  const { profile, user, refetchProfile } = useAuthState();
  
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin");

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  return (
    <AdminLayout
      pageTitle="Admin Profile Settings"
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToTab={navigateToTab}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
    >
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Admin Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your personal account details and preferences.
          </p>
        </div>

        {/* Profile Header Card */}
        <ProfileHeaderCard 
          profile={profile} 
          user={user} 
          refetchProfile={refetchProfile} 
        />

        {/* Personal Information Card */}
        <PersonalInformationCard 
          profile={profile} 
          user={user} 
          refetchProfile={refetchProfile} 
        />

        {/* Password Management Card */}
        <PasswordManagementCard />

        {/* Biometric Security Card */}
        <BiometricSecurityCard profile={profile} refetchProfile={refetchProfile} />

        {/* Notification Settings Card */}
        <NotificationSettingsCard />
      </div>
    </AdminLayout>
  );
}