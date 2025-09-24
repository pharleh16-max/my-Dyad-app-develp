import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Fingerprint, MapPin, Shield, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      <div className="container mx-auto px-4 py-12 max-w-md">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-elegant">
                <Fingerprint className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-accent rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-accent-foreground" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            DREAMS Attendance Management System
          </h1>
          <p className="text-muted-foreground text-lg mb-2">
            Professional Biometric Attendance Tracking
          </p>
          <Badge variant="secondary" className="mb-8">
            Secure • Mobile-First • Real-time
          </Badge>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4 mb-12">
          <Card className="p-6 status-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Fingerprint className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Biometric Authentication</h3>
                <p className="text-sm text-muted-foreground">Secure fingerprint scanning for accurate identification</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 status-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Location Verification</h3>
                <p className="text-sm text-muted-foreground">GPS-based geofencing ensures on-site attendance</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 status-card">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-time Tracking</h3>
                <p className="text-sm text-muted-foreground">Live monitoring and comprehensive reporting</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={() => window.location.href = '/auth'}
            className="w-full btn-attendance" 
            size="lg"
          >
            Employee Login
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/auth'}
            variant="outline" 
            className="w-full" 
            size="lg"
          >
            Administrator Access
          </Button>
          
          <div className="text-center pt-4">
            <Button 
              onClick={() => window.location.href = '/auth'}
              variant="ghost" 
              className="text-sm text-muted-foreground"
            >
              New Employee? Register Here
            </Button>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-12 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Phase 1: Core UI Components & Navigation System Ready
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;