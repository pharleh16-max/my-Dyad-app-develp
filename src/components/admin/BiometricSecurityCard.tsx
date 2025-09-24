import React from "react";
import { Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthState } from "@/hooks/useAuthState";
import { useToast } from "@/hooks/use-toast";

interface BiometricSecurityCardProps {
  profile: {
    biometric_enrolled?: boolean | null;
  } | null;
}

export function BiometricSecurityCard({ profile }: BiometricSecurityCardProps) {
  const { toast } = useToast();

  const handleFingerprintEnrollment = () => {
    toast({
      title: "Biometric Enrollment",
      description: "Please use the biometric scanner to enroll your fingerprint. (Feature under development)",
    });
  };

  return (
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
  );
}