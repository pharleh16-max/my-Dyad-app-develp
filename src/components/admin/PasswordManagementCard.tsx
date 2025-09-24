import React, { useState } from "react";
import { Lock, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function PasswordManagementCard() {
  const { user } = useAuthState();
  const { toast } = useToast();

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

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

  return (
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
  );
}