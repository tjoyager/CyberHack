import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "@/lib/auth-context";
import ProtectedRoute from "@/components/ProtectedRoute";
import DashboardLayout from "@/pages/dashboard/layout";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import DashboardOverview from "@/pages/dashboard/overview";
import IntakeStaffPage from "@/pages/dashboard/intake";
import QCInspectorPage from "@/pages/dashboard/qc";
import PPICManagerPage from "@/pages/dashboard/ppic";
import AuditPage from "@/pages/dashboard/audit";
import DeliveryPage from "@/pages/dashboard/delivery";
import SuppliersPage from "@/pages/dashboard/suppliers";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function DashboardRoutes() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Switch>
          <Route path="/dashboard" component={DashboardOverview} />
          <Route path="/dashboard/intake" component={IntakeStaffPage} />
          <Route path="/dashboard/qc" component={QCInspectorPage} />
          <Route path="/dashboard/ppic" component={PPICManagerPage} />
          <Route path="/dashboard/audit" component={AuditPage} />
          <Route path="/dashboard/delivery" component={DeliveryPage} />
          <Route path="/dashboard/suppliers" component={SuppliersPage} />
        </Switch>
      </DashboardLayout>
    </ProtectedRoute>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard" component={DashboardRoutes} />
      <Route path="/dashboard/:rest*" component={DashboardRoutes} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
