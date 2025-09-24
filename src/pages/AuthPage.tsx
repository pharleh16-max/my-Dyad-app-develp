import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Fingerprint, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuthState } from '@/hooks/useAuthState';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';

export default function AuthPage() {
  const { signIn, signUp, isAuthenticated, isLoading, user } = useAuthState();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBiometric, setShowBiometric] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    const redirectPath = user.user_metadata?.role === 'admin' ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  if (isLoading) {
    return (
      <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </EmployeeLayout>
    );
  }

  const validateForm = (isSignUp: boolean) => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!formData.fullName) {
        newErrors.fullName = 'Full name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm(false)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        setErrors({ general: error.message });
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateForm(true)) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const { error } = await signUp(formData.email, formData.password, formData.fullName);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setErrors({ general: 'An account with this email already exists. Please sign in instead.' });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setErrors({ success: 'Registration successful! Please check your email to verify your account.' });
      }
    } catch (err) {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBiometricAuth = async () => {
    setShowBiometric(true);
    
    // Check if WebAuthn is supported
    if (!navigator.credentials || !window.PublicKeyCredential) {
      setErrors({ general: 'Biometric authentication is not supported on this device.' });
      setShowBiometric(false);
      return;
    }

    try {
      // This would be implemented with actual WebAuthn API in production
      setErrors({ general: 'Biometric authentication will be available after initial setup. Please sign in with email/password first.' });
    } catch (error) {
      setErrors({ general: 'Biometric authentication failed. Please try again.' });
    } finally {
      setShowBiometric(false);
    }
  };

  return (
    <EmployeeLayout centered hasBottomNav={false} hasHeader={false}>
      <div className="w-full max-w-md mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-elegant">
              <Fingerprint className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">AttendanceDREAMS</h1>
          <p className="text-muted-foreground">Secure Employee Access</p>
        </div>

        {/* Biometric Quick Access */}
        <Card className="mb-6 status-card">
          <CardContent className="pt-6">
            <Button
              onClick={handleBiometricAuth}
              disabled={showBiometric}
              className="w-full btn-attendance"
              size="lg"
            >
              {showBiometric ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Fingerprint className="w-5 h-5 mr-2" />
              )}
              {showBiometric ? 'Scanning...' : 'Quick Biometric Login'}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Use your fingerprint for instant access
            </p>
          </CardContent>
        </Card>

        {/* Email/Password Auth */}
        <Card className="status-card">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Account Access</CardTitle>
            <CardDescription className="text-center">
              Sign in or create your employee account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Register</TabsTrigger>
              </TabsList>

              {/* Error/Success Messages */}
              {errors.general && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errors.general}</AlertDescription>
                </Alert>
              )}

              {errors.success && (
                <Alert className="mt-4 border-accent text-accent">
                  <AlertDescription>{errors.success}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="employee@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <Button 
                  onClick={handleSignIn} 
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Sign In
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      className="pl-10"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="employee@company.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a secure password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
                </div>

                <Button 
                  onClick={handleSignUp} 
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                  Create Account
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By registering, you agree to follow company attendance policies and procedures.
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}