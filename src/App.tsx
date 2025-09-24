import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import PendingApproval from "./pages/PendingApproval";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import CheckIn from "./pages/CheckIn";
import CheckOut from "./pages/CheckOut";
import AttendanceHistory from "./pages/AttendanceHistory";
import EmployeeProfile from "./pages/EmployeeProfile";
import AdminDashboard from "./pages/AdminDashboard"; // Import AdminDashboard
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
          {/* Add other admin routes here as they are created */}
          
          {/* Catch-all route - must be last */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;