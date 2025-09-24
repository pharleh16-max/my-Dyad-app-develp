import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary"; // Import ErrorBoundary
import { LoadingSpinner } from "./components/ui/loading-spinner"; // Assuming you have a LoadingSpinner

// Lazy load page components
const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const PendingApproval = React.lazy(() => import("./pages/PendingApproval"));
const EmployeeDashboard = React.lazy(() => import("./pages/EmployeeDashboard"));
const CheckIn = React.lazy(() => import("./pages/CheckIn"));
const CheckOut = React.lazy(() => import("./pages/CheckOut"));
const AttendanceHistory = React.lazy(() => import("./pages/AttendanceHistory"));
const EmployeeProfile = React.lazy(() => import("./pages/EmployeeProfile"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AdminEmployeeApproval = React.lazy(() => import("./pages/AdminEmployeeApproval"));
const AdminManageLocations = React.lazy(() => import("./pages/AdminManageLocations"));
const AdminSystemSettings = React.lazy(() => import("./pages/AdminSystemSettings"));
const AdminEmployeesPage = React.lazy(() => import("./pages/AdminEmployeesPage")); // Renamed import
const AdminLiveMonitor = React.lazy(() => import("./pages/AdminLiveMonitor")); // New import
const AdminReportsPage = React.lazy(() => import("./pages/AdminReportsPage")); // New import
const AdminDataExport = React.lazy(() => import("./pages/AdminDataExport"));
const AdminSecurity = React.lazy(() => import("./pages/AdminSecurity"));
const AdminHelpSupport = React.lazy(() => import("./pages/AdminHelpSupport"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ErrorBoundary> {/* Wrap the entire application with ErrorBoundary */}
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/pending-approval" element={<PendingApproval />} />
              
              {/* Protected Employee Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              } />
              <Route path="/check-in" element={
                <ProtectedRoute requiredRole="employee">
                  <CheckIn />
                </ProtectedRoute>
              } />
              <Route path="/check-out" element={
                <ProtectedRoute requiredRole="employee">
                  <CheckOut />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute requiredRole="employee">
                  <AttendanceHistory />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute requiredRole="employee">
                  <EmployeeProfile />
                </ProtectedRoute>
              } />
              
              {/* Protected Admin Routes */}
              <Route path="/admin/dashboard" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/employee-approval" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEmployeeApproval />
                </ProtectedRoute>
              } />
              <Route path="/admin/locations" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminManageLocations />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSystemSettings />
                </ProtectedRoute>
              } />
              <Route path="/admin/employees" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminEmployeesPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/attendance" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLiveMonitor />
                </ProtectedRoute>
              } />
              <Route path="/admin/reports" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/export" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDataExport />
                </ProtectedRoute>
              } />
              <Route path="/admin/security" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminSecurity />
                </ProtectedRoute>
              } />
              <Route path="/admin/help" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHelpSupport />
                </ProtectedRoute>
              } />
              
              {/* Catch-all route - must be last */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;