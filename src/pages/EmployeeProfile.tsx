import { useState, useRef } from "react";
import { Camera, Edit, User, Phone, Building, MapPin, Lock, Mail, Upload, Save, AlertCircle } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

// Import new modular components
import { BiometricSecurityCard } from "@/components/admin/BiometricSecurityCard";
import { NotificationSettingsCard } from "@/components/admin/NotificationSettingsCard";
import { PasswordManagementCard } from "@/components/admin/PasswordManagementCard"; // Re-import if it was removed
import { PersonalInformationCard } from "@/components/admin/PersonalInformationCard"; // Re-import if it was removed
import { ProfileHeaderCard } from "@/components/admin/ProfileHeaderCard"; // Re-import if it was removed

export default function EmployeeProfile() {
  const { profile, user, refetchProfile } = useAuthState();
  const { toast } = useToast();

  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToPath,
  } = useNavigation("employee");

  const userName = profile?.full_name || "Employee";
  const userRole = profile?.role || "employee";

  const queryClient = useQueryClient();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    department: profile?.department || '',
    location: profile?.location || ''
  });

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update form state when profile or user data changes
  useState(() => {
    setEditForm({
      full_name: profile?.full_name || '',
      email: user?.email || '',
      phone_number: profile?.phone_number || '',
      department: profile?.department || '',
      location: profile?.location || ''
    });
  }, [profile, user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<typeof editForm>) => {
      if (!user) throw new Error("User not authenticated.");

      // Update profile table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name,
          phone_number: updates.phone_number,
          department: updates.department,
          location: updates.location,
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update auth.users email if changed
      if (updates.email && updates.email !== user.email) {
        const { error: userError } = await supabase.auth.updateUser({ email: updates.email });
        if (userError) throw userError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetchProfile(); // Re-fetch profile to get latest data
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: `Unable to update profile: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const uploadProfilePhotoMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("User not authenticated.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite if file exists
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;

      // Update profile_photo_url in profiles table
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateProfileError) throw updateProfileError;

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetchProfile(); // Re-fetch profile to get latest data
      toast({
        title: "Profile Picture Updated",
        description: "Your profile picture has been successfully uploaded.",
      });
      setIsUploadingPhoto(false);
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: `Unable to upload profile picture: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePhotoMutation.mutate(file);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <EmployeeLayout
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
      hasBottomNav={true}
      hasHeader={true}
    >
      <div className="space-y-6">
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
        <BiometricSecurityCard profile={profile} />

        {/* Notification Settings Card */}
        <NotificationSettingsCard />

        {/* Edit Profile Dialog (kept for employee-specific fields if needed, though PersonalInformationCard handles most) */}
        <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
              <DialogDescription>
                Update your personal information below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  value={editForm.phone_number}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={editForm.department}
                  onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
}