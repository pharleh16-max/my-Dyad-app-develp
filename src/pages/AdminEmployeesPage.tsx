import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Users2, Edit, Trash2, CheckCircle, Ban, Mail, Phone, Building, MapPin, Fingerprint, UserCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

export default function AdminEmployeesPage() {
  const { profile: adminProfile, user: currentUser } = useAuthState();
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

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Profile | null>(null);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'activate' | 'suspend' | 'delete' | null>(null);
  const [selectedEmployeeForAction, setSelectedEmployeeForAction] = useState<Profile | null>(null);

  const userName = adminProfile?.full_name || "Admin";
  const userRole = adminProfile?.role || "admin";

  const { data: employees, isLoading, error } = useQuery<Profile[]>({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }
      return data || [];
    },
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: async (updatedProfile: Partial<Profile>) => {
      if (!editingEmployee?.id) throw new Error("No employee selected for update.");
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', editingEmployee.id);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Success", description: "Employee profile updated successfully." });
      setIsEditDialogOpen(false);
      setEditingEmployee(null);
      setEditForm({});
    },
    onError: (err) => {
      toast({ title: "Error", description: `Failed to update employee: ${err.message}`, variant: "destructive" });
    },
  });

  const performActionMutation = useMutation({
    mutationFn: async ({ id, status, role }: { id: string; status?: Profile['status']; role?: Profile['role'] }) => {
      if (actionType === 'delete') {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);
        if (error) throw new Error(error.message);
      } else {
        const updateData: Partial<Profile> = {};
        if (status) updateData.status = status;
        if (role) updateData.role = role;

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', id);
        if (error) throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast({ title: "Success", description: `Employee ${actionType}d successfully.` });
      setIsActionDialogOpen(false);
      setSelectedEmployeeForAction(null);
      setActionType(null);
    },
    onError: (err) => {
      toast({ title: "Error", description: `Failed to ${actionType} employee: ${err.message}`, variant: "destructive" });
    },
  });

  const handleEditClick = (employee: Profile) => {
    setEditingEmployee(employee);
    setEditForm({
      full_name: employee.full_name,
      employee_id: employee.employee_id,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      department: employee.department,
      location: employee.location,
      phone_number: employee.phone_number,
      biometric_enrolled: employee.biometric_enrolled,
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    updateEmployeeMutation.mutate(editForm);
  };

  const handleAction = (employee: Profile, type: 'activate' | 'suspend' | 'delete') => {
    setSelectedEmployeeForAction(employee);
    setActionType(type);
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedEmployeeForAction && actionType) {
      if (actionType === 'delete') {
        performActionMutation.mutate({ id: selectedEmployeeForAction.id });
      } else if (actionType === 'activate') {
        performActionMutation.mutate({ id: selectedEmployeeForAction.id, status: 'active' });
      } else if (actionType === 'suspend') {
        performActionMutation.mutate({ id: selectedEmployeeForAction.id, status: 'suspended' });
      }
    }
  };

  const getStatusBadgeVariant = (status: Profile['status']) => {
    switch (status) {
      case 'active': return 'bg-accent/10 text-accent border-accent/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'suspended': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'rejected': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        pageTitle="Employee Management"
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
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout
        pageTitle="Employee Management"
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
        <div className="text-center text-destructive p-6">
          Error loading employee data: {error.message}
        </div>
      </AdminLayout>
    );
  }

  return (
    <React.Fragment>
      <AdminLayout
        pageTitle="Employee Management"
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
              Employee Management
            </h1>
            <p className="text-muted-foreground">
              View and manage all employee accounts and their details.
            </p>
          </div>

          <Card className="status-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users2 className="w-6 h-6 text-primary" />
                All Employees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {employees && employees.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Biometric</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell className="font-medium">{employee.full_name}</TableCell>
                          <TableCell>{employee.employee_id || 'N/A'}</TableCell>
                          <TableCell>{employee.role}</TableCell>
                          <TableCell>
                            <Badge className={getStatusBadgeVariant(employee.status)}>
                              {employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {employee.biometric_enrolled ? (
                              <CheckCircle className="w-4 h-4 text-accent" />
                            ) : (
                              <Fingerprint className="w-4 h-4 text-destructive" />
                            )}
                          </TableCell>
                          <TableCell className="text-right flex gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(employee)}
                              disabled={updateEmployeeMutation.isPending || employee.id === currentUser?.id}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {employee.status !== 'active' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(employee, 'activate')}
                                disabled={performActionMutation.isPending || employee.id === currentUser?.id}
                              >
                                <UserCheck className="w-4 h-4 text-accent" />
                              </Button>
                            )}
                            {employee.status !== 'suspended' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(employee, 'suspend')}
                                disabled={performActionMutation.isPending || employee.id === currentUser?.id}
                              >
                                <Ban className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(employee, 'delete')}
                              disabled={performActionMutation.isPending || employee.id === currentUser?.id}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">No employee accounts found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Employee Profile</DialogTitle>
            <DialogDescription>
              Make changes to {editingEmployee?.full_name}'s profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="full_name" className="text-right">
                Full Name
              </Label>
              <Input
                id="full_name"
                value={editForm.full_name || ''}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee_id" className="text-right">
                Employee ID
              </Label>
              <Input
                id="employee_id"
                value={editForm.employee_id || ''}
                onChange={(e) => setEditForm({ ...editForm, employee_id: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={editForm.email || ''}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={editForm.role}
                onValueChange={(value: Profile['role']) => setEditForm({ ...editForm, role: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.status}
                onValueChange={(value: Profile['status']) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Department
              </Label>
              <Input
                id="department"
                value={editForm.department || ''}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={editForm.location || ''}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone_number" className="text-right">
                Phone
              </Label>
              <Input
                id="phone_number"
                value={editForm.phone_number || ''}
                onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="biometric_enrolled" className="text-right">
                Biometric
              </Label>
              <Switch
                id="biometric_enrolled"
                checked={editForm.biometric_enrolled || false}
                onCheckedChange={(checked) => setEditForm({ ...editForm, biometric_enrolled: checked })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateEmployeeMutation.isPending}>
              {updateEmployeeMutation.isPending ? <LoadingSpinner size="sm" className="mr-2" /> : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <AlertDialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'activate' && 'Activate Employee?'}
              {actionType === 'suspend' && 'Suspend Employee?'}
              {actionType === 'delete' && 'Delete Employee?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {actionType} {selectedEmployeeForAction?.full_name}'s account?
              This action {actionType === 'delete' ? 'cannot be undone' : 'can be reversed later'}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsActionDialogOpen(false); setSelectedEmployeeForAction(null); setActionType(null); }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={performActionMutation.isPending}
              className={
                actionType === 'delete'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : actionType === 'activate'
                    ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
              }
            >
              {performActionMutation.isPending ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <>
                  {actionType === 'activate' && <CheckCircle className="w-4 h-4 mr-2" />}
                  {actionType === 'suspend' && <Ban className="w-4 h-4 mr-2" />}
                  {actionType === 'delete' && <Trash2 className="w-4 h-4 mr-2" />}
                  Confirm {actionType}
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </React.Fragment>
  );
}