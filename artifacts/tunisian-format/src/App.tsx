import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe } from "@workspace/api-client-react";
import AuthPage from "@/pages/auth";
import DashboardPage from "@/pages/dashboard";
import NewTournamentPage from "@/pages/new-tournament";
import TournamentPage from "@/pages/tournament";
import TournamentResultsPage from "@/pages/tournament-results";
import AdminPage from "@/pages/admin";
import AboutPage from "@/pages/about";
import TeamPage from "@/pages/team";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false;
        return failureCount < 1;
      },
      staleTime: 30000,
    },
  },
});

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType; adminOnly?: boolean }) {
  const { data: user, isLoading, error } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #c8eef8, #fff8e8)" }}>
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  if (error || !user) {
    return <Redirect to="/" />;
  }

  if (adminOnly && user.role !== "superadmin") {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #c8eef8, #fff8e8)" }}>
        <div className="text-slate-400">Загрузка...</div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

// Stable component references — defined once outside Router to prevent remounting on every render
function RouteHome() { return <PublicOnlyRoute component={AuthPage} />; }
function RouteDashboard() { return <ProtectedRoute component={DashboardPage} />; }
function RouteNewTournament() { return <ProtectedRoute component={NewTournamentPage} />; }
function RouteTournamentResults() { return <ProtectedRoute component={TournamentResultsPage} />; }
function RouteTournament() { return <ProtectedRoute component={TournamentPage} />; }
function RouteAdmin() { return <ProtectedRoute component={AdminPage} adminOnly={true} />; }

function Router() {
  return (
    <Switch>
      <Route path="/" component={RouteHome} />
      <Route path="/dashboard" component={RouteDashboard} />
      <Route path="/tournaments/new" component={RouteNewTournament} />
      <Route path="/tournaments/:id/results" component={RouteTournamentResults} />
      <Route path="/tournaments/:id" component={RouteTournament} />
      <Route path="/admin" component={RouteAdmin} />
      <Route path="/about" component={AboutPage} />
      <Route path="/team" component={TeamPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
