import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";

// Import pages
import Home from "@/pages/home";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard/index";
import DashboardProducts from "@/pages/dashboard/products";
import DashboardOrders from "@/pages/dashboard/orders";
import DashboardMemberships from "@/pages/dashboard/memberships";
import DashboardPayouts from "@/pages/dashboard/payouts";
import DashboardSettings from "@/pages/dashboard/settings";
import CreatorProfile from "@/pages/creator/[username]";
import Checkout from "@/pages/checkout/[productId]";
import AdminPanel from "@/pages/admin/index";

// Layout components
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    window.location.href = "/auth/login";
    return null;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user || user.role !== "admin") {
    return <NotFound />;
  }
  
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/creator/:username" component={CreatorProfile} />
      <Route path="/checkout/:productId" component={Checkout} />
      
      {/* Protected routes */}
      <Route path="/onboarding">
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      </Route>
      
      {/* Dashboard routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <DashboardLayout>
            <Dashboard />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/products">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardProducts />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/orders">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardOrders />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/memberships">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardMemberships />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/payouts">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardPayouts />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard/settings">
        <ProtectedRoute>
          <DashboardLayout>
            <DashboardSettings />
          </DashboardLayout>
        </ProtectedRoute>
      </Route>
      
      {/* Admin routes */}
      <Route path="/admin">
        <AdminRoute>
          <AdminPanel />
        </AdminRoute>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="cashure-ui-theme">
        <TooltipProvider>
          <SidebarProvider>
            <Toaster />
            <Router />
          </SidebarProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
