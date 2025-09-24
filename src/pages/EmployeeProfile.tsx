import { useState } from "react";
import { Camera, Fingerprint, Bell, Shield, Edit, User, Phone, Building, MapPin } from "lucide-react";
import { EmployeeLayout } from "@/components/layout/EmployeeLayout";
import { Header } from "@/components/layout/Header";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
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

export default function EmployeeProfile() {
  const { profile } = useAuthState();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    phone_number: profile?.phone_number || '',
    department: profile?.department || '',
    location: profile?.location || ''
  });
  const [notifications, setNotifications] = useState({
    checkInReminder: true,
    checkOutReminder: true,
    weeklyReport: false,
    systemUpdates: true
  });

  const handleSaveProfile = async () => {
    try {
      // Here you would update the profile in Supabase
      // await supabase.from('profiles').update(editForm).eq('id', profile?.id);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Unable to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFingerprintEnrollment = () => {
    toast({
      title: "Fingerprint Enrollment",
      description: "Please use the biometric scanner to enroll your fingerprint.",
    });
  };

  const handleNavigation = (itemId: string) => {
    switch (itemId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'attendance':
        navigate('/check-in');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'profile':
        navigate('/profile');
        break;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Header title="Profile" />
      <EmployeeLayout>
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="status-card">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.profile_photo_url} />
                  <AvatarFallback className="text-xl font-semibold">
                    {profile?.full_name ? getInitials(profile.full_name) : 'EMP'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                  variant="secondary"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {profile?.full_name || 'Employee Name'}
                </h2>
                <p className="text-muted-foreground">
                  {profile?.employee_id || 'EMP001'}
                </p>
                <div className="flex justify-center mt-2">
                  <Badge 
                    className={
                      profile?.status === 'active' 
                        ? 'bg-accent/10 text-accent border-accent/20' 
                        : 'bg-secondary/10 text-secondary border-secondary/20'
                    }
                  >
                    {profile?.status || 'Pending'}
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
                onClick={() => setIsEditing(true)}
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
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your personal information below.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={editForm.full_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
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
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </EmployeeLayout>
      <BottomNavigation activeItem="profile" onItemClick={handleNavigation} />
    </>
  );
}