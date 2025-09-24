import React, { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAuthState } from "@/hooks/useAuthState";
import { useNavigation } from "@/hooks/useNavigation";
import { useIsMobile } from "@/hooks/use-mobile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Shield, Lock, ScrollText, Users, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

export default function AdminSecuritySettings() {
  const { profile } = useAuthState();
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

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  const [securityPolicies, setSecurityPolicies] = useState({
    passwordMinLength: 8,
    passwordRequiresSpecialChar: true,
    sessionTimeoutMinutes: 60,
    mfaEnabled: false,
  });

  const [accessControls, setAccessControls] = useState({
    defaultEmployeeRole: 'employee',
    adminApprovalRequired: true,
  });

  const handlePolicyChange = (id: string, value: any) => {
    setSecurityPolicies(prev => ({ ...prev, [id]: value }));
  };

  const handleAccessControlChange = (id: string, value: any) => {
    setAccessControls(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    console.log("Saving Security Policies:", securityPolicies);
    console.log("Saving Access Controls:", accessControls);
    toast({
      title: "Security Settings Saved",
      description: "Your security configurations have been updated.",
    });
  };

  const handleViewAuditLogs = () => {
    toast({
      title: "Audit Logs",
      description: "Viewing audit logs functionality is under development.",
      variant: "default",
    });
    // In a real application, this would navigate to an audit log viewer page
    // navigateToPath('/admin/audit-logs');
  };

  return (
    <AdminLayout
      pageTitle="Security Settings"
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
            Security Settings
          </h1>
          <p className="text-muted-foreground">
            Configure security policies, review audit trails, and manage access controls.
          </p>
        </div>

        {/* Authentication Policies */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Lock className="w-6 h-6 text-primary" />
              Authentication Policies
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passwordMinLength">Minimum Password Length</Label>
              <Input
                id="passwordMinLength"
                type="number"
                min="6"
                max="32"
                value={securityPolicies.passwordMinLength}
                onChange={(e) => handlePolicyChange('passwordMinLength', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="passwordRequiresSpecialChar" className="flex flex-col space-y-1">
                <span>Require Special Character in Password</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Enforce at least one special character (!@#$%) in passwords.
                </span>
              </Label>
              <Switch
                id="passwordRequiresSpecialChar"
                checked={securityPolicies.passwordRequiresSpecialChar}
                onCheckedChange={(checked) => handlePolicyChange('passwordRequiresSpecialChar', checked)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionTimeoutMinutes">Session Timeout (minutes)</Label>
              <Input
                id="sessionTimeoutMinutes"
                type="number"
                min="15"
                max="1440" // 24 hours
                value={securityPolicies.sessionTimeoutMinutes}
                onChange={(e) => handlePolicyChange('sessionTimeoutMinutes', parseInt(e.target.value))}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="mfaEnabled" className="flex flex-col space-y-1">
                <span>Multi-Factor Authentication (MFA)</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Enable or disable MFA for all users (requires setup).
                </span>
              </Label>
              <Switch
                id="mfaEnabled"
                checked={securityPolicies.mfaEnabled}
                onCheckedChange={(checked) => handlePolicyChange('mfaEnabled', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Logging */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <ScrollText className="w-6 h-6 text-primary" />
              Audit Logging
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <p className="text-muted-foreground text-sm">
              Review system activities, login attempts, and data modifications for security monitoring.
            </p>
            <Button onClick={handleViewAuditLogs} variant="outline" className="w-full">
              <ScrollText className="w-4 h-4 mr-2" />
              View Audit Logs (Coming Soon)
            </Button>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="logRetentionDays" className="flex flex-col space-y-1">
                <span>Log Retention Period (days)</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  How long audit logs are stored before automatic deletion.
                </span>
              </Label>
              <Input
                id="logRetentionDays"
                type="number"
                min="7"
                max="365"
                defaultValue="90" // Placeholder default
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-primary" />
              Access Control
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="defaultEmployeeRole">Default New Employee Role</Label>
              <Select
                value={accessControls.defaultEmployeeRole}
                onValueChange={(value: 'employee' | 'admin') => handleAccessControlChange('defaultEmployeeRole', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select default role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="adminApprovalRequired" className="flex flex-col space-y-1">
                <span>Admin Approval for New Accounts</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Require an administrator to approve new employee registrations.
                </span>
              </Label>
              <Switch
                id="adminApprovalRequired"
                checked={accessControls.adminApprovalRequired}
                onCheckedChange={(checked) => handleAccessControlChange('adminApprovalRequired', checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSaveSettings}
          className="w-full btn-attendance"
        >
          <Save className="w-5 h-5 mr-2" />
          Save Security Settings
        </Button>
      </div>
    </AdminLayout>
  );
}