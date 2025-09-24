import React, { useState, useRef } from "react";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderCardProps {
  profile: {
    full_name: string;
    employee_id?: string | null;
    profile_photo_url?: string | null;
    status: string;
  } | null;
  user: any; // Supabase User object
  refetchProfile: () => void;
}

export function ProfileHeaderCard({ profile, user, refetchProfile }: ProfileHeaderCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    onSuccess: () => {
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
  );
}