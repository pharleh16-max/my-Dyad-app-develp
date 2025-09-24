import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail, Phone } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';

export default function PendingApproval() {
  const { signOut, profile } = useAuthState();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shadow-card">
              <Clock className="w-8 h-8 text-secondary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Account Pending</h1>
          <p className="text-muted-foreground">Your registration is under review</p>
        </div>

        <Card className="status-card mb-6">
          <CardHeader>
            <CardTitle className="text-center">Registration Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for registering with DREAMS Attendance Management System
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">What's Next?</h3>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li>• Your administrator will review your registration</li>
                <li>• You'll receive an email notification when approved</li>
                <li>• Once approved, you can complete biometric enrollment</li>
                <li>• Then you'll have full access to attendance tracking</li>
              </ul>
            </div>

            {profile && (
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Registration Details</h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Name:</strong> {profile.full_name}</p>
                  <p><strong>Employee ID:</strong> {profile.employee_id}</p>
                  <p><strong>Status:</strong> Pending Approval</p>
                </div>
              </div>
            )}

            <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
              <h4 className="font-medium text-accent mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Need Help?
              </h4>
              <p className="text-sm text-muted-foreground mb-2">
                Contact your HR department or system administrator for assistance.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                <Phone className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button 
          variant="ghost" 
          onClick={handleSignOut}
          className="w-full"
        >
          Sign Out
        </Button>
      </div>
    </EmployeeLayout>
  );
}