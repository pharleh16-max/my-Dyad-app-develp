import React, { useState } from "react";
import { Bell, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function NotificationSettingsCard() {
  const [notifications, setNotifications] = useState({
    checkInReminder: true,
    checkOutReminder: true,
    weeklyReport: false,
    systemUpdates: true
  });

  return (
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
  );
}