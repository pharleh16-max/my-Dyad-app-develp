import React, { useState, useEffect } from "react";
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
import { Settings, Clock, MapPin, UserPlus, Save, AlertCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Tables } from "@/integrations/supabase/types";

type AppSettings = Tables<'app_settings'>;

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'; // Fixed ID for the singleton settings row

export default function AdminSystemSettings() {
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
  const queryClient = useQueryClient();

  const userName = profile?.full_name || "Admin";
  const userRole = profile?.role || "admin";

  const [settingsForm, setSettingsForm] = useState<Partial<AppSettings>>({});

  // Fetch current settings
  const { data: currentSettings, isLoading, error } = useQuery<AppSettings | null>({
    queryKey: ['appSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', SETTINGS_ID)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data) => {
      if (data) {
        setSettingsForm(data);
      }
    },
  });

  // Mutation to update settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (updatedSettings: Partial<AppSettings>) => {
      const { error } = await supabase
        .from('app_settings')
        .update(updatedSettings)
        .eq('id', SETTINGS_ID);
      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appSettings'] });
      toast({
        title: "Settings Saved",
        description: "Application settings have been updated successfully.",
      });
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: `Failed to save settings: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type, checked } = e.target as HTMLInputElement;
    setSettingsForm(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (id: keyof AppSettings, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(settingsForm);
  };

  if (isLoading) {
    return (
      <AdminLayout
        pageTitle="System Settings"
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
        pageTitle="System Settings"
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
        <div className="text-center text-destructive p-6 flex flex-col items-center gap-4">
          <AlertCircle className="w-12 h-12" />
          <p>Error loading settings: {error.message}</p>
          <p className="text-sm text-muted-foreground">
            Please ensure the 'app_settings' table exists and RLS policies are correctly configured.
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      pageTitle="System Settings"
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
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure global application settings and parameters.
          </p>
        </div>

        {/* General Settings */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="w-6 h-6 text-primary" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="system_name">System Name</Label>
              <Input
                id="system_name"
                value={settingsForm.system_name || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="allow_employee_self_registration" className="flex flex-col space-y-1">
                <span>Allow Employee Self-Registration</span>
                <span className="font-normal leading-snug text-muted-foreground text-sm">
                  Enable or disable new employees from registering themselves.
                </span>
              </Label>
              <Switch
                id="allow_employee_self_registration"
                checked={settingsForm.allow_employee_self_registration || false}
                onCheckedChange={(checked) => setSettingsForm(prev => ({ ...prev, allow_employee_self_registration: checked }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="theme_mode">Default Theme</Label>
              <Select
                value={settingsForm.theme_mode || 'system'}
                onValueChange={(value) => handleSelectChange('theme_mode', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Rules */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="w-6 h-6 text-primary" />
              Attendance Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="daily_working_hours">Daily Working Hours</Label>
              <Input
                id="daily_working_hours"
                type="number"
                step="0.5"
                value={settingsForm.daily_working_hours || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="late_check_in_tolerance_minutes">Late Check-in Tolerance (minutes)</Label>
              <Input
                id="late_check_in_tolerance_minutes"
                type="number"
                value={settingsForm.late_check_in_tolerance_minutes || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="early_check_out_tolerance_minutes">Early Check-out Tolerance (minutes)</Label>
              <Input
                id="early_check_out_tolerance_minutes"
                type="number"
                value={settingsForm.early_check_out_tolerance_minutes || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="geofence_radius_meters">Geofence Radius (meters)</Label>
              <Input
                id="geofence_radius_meters"
                type="number"
                value={settingsForm.geofence_radius_meters || ''}
                onChange={handleInputChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Integration Configurations (Placeholder) */}
        <Card className="status-card p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserPlus className="w-6 h-6 text-primary" />
              Integration Configurations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <p className="text-muted-foreground text-sm">
              This section is for future integrations with HR systems, payroll, etc.
            </p>
            <div className="space-y-2">
              <Label htmlFor="hr_api_key">HR System API Key</Label>
              <Input
                id="hr_api_key"
                type="password"
                placeholder="********************"
                disabled // Placeholder for future functionality
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payroll_webhook_url">Payroll Webhook URL</Label>
              <Input
                id="payroll_webhook_url"
                type="url"
                placeholder="https://example.com/webhook/payroll"
                disabled // Placeholder for future functionality
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={handleSaveSettings}
          className="w-full btn-attendance"
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
    </AdminLayout>
  );
}