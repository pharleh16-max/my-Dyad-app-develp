import React, { useState, useEffect } from "react";
import { Edit, User, Phone, Building, MapPin, Mail, Save, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PersonalInformationCardProps {
  profile: {
    full_name: string;
    phone_number?: string | null;
    department?: string | null;
    location?: string | null;
  } | null;
  user: any; // Supabase User object
  refetchProfile: () => void;
}

export function PersonalInformationCard({ profile, user, refetchProfile }: PersonalInformationCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: profile?.full_name || '',
    email: user?.email || '',
    phone_number: profile?.phone_number || '',
    department: profile?.department || '',
    location: profile?.location || ''
  });

  useEffect(() => {
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
        description: "Your personal information has been successfully updated.",
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

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  return (
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
    </Card>
  );
}