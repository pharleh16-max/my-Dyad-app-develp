import { useState, useRef } from "react";
import { Camera, Fingerprint, Bell, Shield, Edit, User, Phone, Building, MapPin, Lock, Mail, Upload, Save, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout"; // Use AdminLayout
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useNavigation } from "@/hooks/useNavigation"; // Import useNavigation for admin layout props
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile for admin layout props

export default function AdminProfile() {
  const { profile, user, refetchProfile } = useAuthState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const isMobile = useIsMobile(); // For AdminLayout
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin"); // For AdminLayout

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    department: profile?.department || '',
    location: profile?.location || ''
  });

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notifications, setNotifications] = useState({
    checkInReminder: true, // These might be less relevant for admin, but keeping for consistency
    checkOutReminder: true,
    weeklyReport: false,
    systemUpdates: true
  });

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
      refetchProfile();
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

  const changePasswordMutation = useMutation({
    mutationFn: async (newPassword: string) => {
      if (!user) throw new Error("User not authenticated.");
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Password Updated",
        description: "Your password has been successfully changed.",
      });
      setIsChangingPassword(false);
      setPasswordForm({ newPassword: '', confirmNewPassword: '' });
      setPasswordErrors({});
    },
    onError: (error: any) => {
      toast({
        title: "Password Change Failed",
        description: `Unable to change password: ${error.message}`,
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ profile_photo_url: publicUrl })
        .eq('id', user.id);

      if (updateProfileError) throw updateProfileError;

      return publicUrl;
    },
    onSuccess: (publicUrl) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      refetchProfile();
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

  const handleChangePassword = () => {
    const newErrors: { [key: string]: string } = {};
    if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters.';
    }
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      newErrors.confirmNewPassword = 'Passwords do not match.';
    }
    setPasswordErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      changePasswordMutation.mutate(passwordForm.newPassword);
    }
  };

  const handleProfilePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadProfilePhotoMutation.mutate(file);
    }
  };

  const handleFingerprintEnrollment = () => {
    toast({
      title: "Biometric Enrollment",
      description: "Please use the biometric scanner to enroll your fingerprint. (Feature under development)",
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <AdminLayout
      pageTitle="Admin Profile Settings" // Specific title for admin profile
      isMobile={isMobile}
      activeTab={activeTab}
      sideMenuOpen={sideMenuOpen}
      toggleSideMenu={toggleSideMenu}
      closeSideMenu={closeSideMenu}
      navigateToTab={navigateToTab}
      navigateToPath={navigateToPath}
      userName={userName}
      userRole={userRole}
      // No BottomNavigation for AdminLayout
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <Card className="status-card">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.profile_photo_url || undefined} />
                <AvatarFallback className="text-xl font-semibold">
                  {profile?.full_name ? getInitials(profile.full_name) : 'ADM'}
                </AvatarFallback>
              </Avatar>
              <Dialog open={isUploadingPhoto} onOpenChange={setIsUploadingPhoto}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    variant="secondary"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Change Profile Picture</DialogTitle>
                    <DialogDescription>
                      Upload a new image for your profile.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Input
                      id="picture"
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleProfilePictureChange}
                      disabled={uploadProfilePhotoMutation.isPending}
                    />
                    {uploadProfilePhotoMutation.isPending && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <LoadingSpinner size="sm" /> Uploading...
                      </div>
                    )}
                    {uploadProfilePhotoMutation.isError && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {uploadProfilePhotoMutation.error?.message || "Upload failed."}
                      </p>
                    )}
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsUploadingPhoto(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={uploadProfilePhotoMutation.isPending}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Select & Upload
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {profile?.full_name || 'Administrator Name'}
              </h2>
              <p className="text-muted-foreground">
                {profile?.employee_id || 'ADM001'}
              </p>
              <div className="flex justify-center mt-2">
                <Badge 
                  className={
                    profile?.status === 'active' 
                      ? 'bg-accent/10 text-accent border-accent/20' 
                      : 'bg-secondary/10 text-secondary border-secondary/20'
                  }
                >
                  {profile?.status || 'Active'}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Personal Information */}
        <Card className="status-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Personal Information</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditingProfile(true)}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium text-foreground">
                  {profile?.full_name || 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">
                  {user?.email || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium text-foreground">
                  {profile?.phone_number || 'Not set'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium text-foreground">
                  {profile?.department || 'Not assigned'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">
                  {profile?.location || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Password Management */}
        <Card className="status-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-foreground">Password Management</h3>
            <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Lock className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Enter your new password below.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    />
                    {passwordErrors.newPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.newPassword}</p>}
                  </div>
                  
                  <div>
                    <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={passwordForm.confirmNewPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                    />
                    {passwordErrors.confirmNewPassword && <p className="text-xs text-destructive mt-1">{passwordErrors.confirmNewPassword}</p>}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleChangePassword} disabled={changePasswordMutation.isPending}>
                    {changePasswordMutation.isPending ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Password
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-sm text-muted-foreground">
            Update your account password for enhanced security.
          </p>
        </Card>

        {/* Biometric Security */}
        <Card className="status-card">
          <h3 className="font-semibold text-foreground mb-4">Biometric Security</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Fingerprint</p>
                  <p className="text-sm text-muted-foreground">
                    {profile?.biometric_enrolled ? 'Enrolled and active' : 'Not enrolled'}
                  </p>
                </div>
              </div>
              
              <Button
                variant={profile?.biometric_enrolled ? "outline" : "default"}
                size="sm"
                onClick={handleFingerprintEnrollment}
              >
                {profile?.biometric_enrolled ? 'Re-enroll' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="status-card">
          <h3 className="font-semibold text-foreground mb-4">Notification Settings</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="check-in-reminder" className="font-medium text-foreground">
                  Check-in Reminders
                </Label>
              </div>
              <Switch
                id="check-in-reminder"
                checked={notifications.checkInReminder}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, checkInReminder: checked }))
                }
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="check-out-reminder" className="font-medium text-foreground">
                  Check-out Reminders
                </Label>
              </div>
              <Switch
                id="check-out-reminder"
                checked={notifications.checkOutReminder}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, checkOutReminder: checked }))
                }
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="weekly-report" className="font-medium text-foreground">
                  Weekly Reports
                </Label>
              </div>
              <Switch
                id="weekly-report"
                checked={notifications.weeklyReport}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, weeklyReport: checked }))
                }
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <Label htmlFor="system-updates" className="font-medium text-foreground">
                  System Updates
                </Label>
              </div>
              <Switch
                id="system-updates"
                checked={notifications.systemUpdates}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, systemUpdates: checked }))
                }
              />
            </div>
          </div>
        </Card>

        {/* Edit Profile Dialog */}
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
    </AdminLayout>
  );
}