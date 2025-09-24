import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Profile {
  id: string;
  full_name: string;
  employee_id: string;
  role: 'employee' | 'admin';
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  created_at: string;
  email?: string;
}

export default function AdminEmployeeApproval() {
  const { profile: adminProfile } = useAuthState();
  const isMobile = useIsMobile();
  const {
    activeTab,
    sideMenuOpen,
    toggleSideMenu,
    closeSideMenu,
    navigateToTab,
    navigateToPath,
  } = useNavigation("admin");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const userName = adminProfile?.full_name || "Admin";
  const userRole = adminProfile?.role || "admin";

  const { data: pendingProfiles, isLoading, error } = useQuery<Profile[]>({
    queryKey: ['pendingProfiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, employee_id, role, status, created_at, auth_users(email)')
        .eq('status', 'pending');

      if (error) {
        throw new Error(error.message);
      }
      return data.map(p => ({
        ...p,
        email: (p as any).auth_users?.email,
      })) as Profile[];
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, status, role }: { id: string; status: 'active' | 'rejected'; role?: 'employee' | 'admin' }) => {
      const updateData: { status: 'active' | 'rejected'; role?: 'employee' | 'admin' } = { status };
      if (role) {
        updateData.role = role;
      }
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingProfiles'] });
      toast({
        title: "Success",
        description: `Employee ${actionType === 'approve' ? 'approved' : 'rejected'} successfully.`,
      });
      setSelectedProfile(null);
      setActionType(null);
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to ${actionType === 'approve' ? 'approve' : 'reject'} employee: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  const handleActionClick = (profile: Profile, action: 'approve' | 'reject') => {
    setSelectedProfile(profile);
    setActionType(action);
  };

  const handleConfirmAction = () => {
    if (selectedProfile && actionType) {
      updateProfileMutation.mutate({
        id: selectedProfile.id,
        status: actionType === 'approve' ? 'active' : 'rejected',
        role: selectedProfile.role,
      });
    }
  };

  return (
    <React.Fragment>
      <AdminLayout
        pageTitle="Employee Approval"
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
              Employee Approval
            </h1>
            <p className="text-muted-foreground">
              Review and manage pending employee registrations.
            </p>
          </div>

          <Card className="status-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-primary" />
                Pending Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <LoadingSpinner size="lg" />
                </div>
              ) : error ? (
                <div className="text-center text-destructive">
                  Error loading pending applications: {error.message}
                </div>
              ) : pendingProfiles && pendingProfiles.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Applied On</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingProfiles.map((profile) => (
                        <TableRow key={profile.id}>
                          <TableCell className="font-medium">{profile.full_name}</TableCell>
                          <TableCell>{profile.email || 'N/A'}</TableCell>
                          <TableCell>{format(new Date(profile.created_at), 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionClick(profile, 'approve')}
                              disabled={updateProfileMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1 text-accent" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionClick(profile, 'reject')}
                              disabled={updateProfileMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1 text-destructive" />
                              Reject
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No pending employee applications.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!selectedProfile} onOpenChange={() => setSelectedProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Employee?' : 'Reject Employee?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} {selectedProfile?.full_name}'s application?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setSelectedProfile(null); setActionType(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={updateProfileMutation.isPending}
              className={actionType === 'approve' ? 'bg-accent text-accent-foreground hover:bg-accent/90' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}
            >
              {updateProfileMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : actionType === 'approve' ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Approve
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Confirm Reject
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
}