import { useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useGetMe } from "@workspace/api-client-react";
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

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #38bdf8 0%, #fde68a 100%)" }}>
      <div className="text-white/80 text-sm">Загрузка...</div>
    </div>
  );
}

function GuestBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!!localStorage.getItem("auth_token"));

  useEffect(() => {
    if (ready) return;
    fetch("/api/auth/guest", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  if (!ready) return <LoadingScreen />;
  return <>{children}</>;
}

function RouteAdmin() {
  const { data: user, isLoading } = useGetMe();
  if (isLoading) return <LoadingScreen />;
  if (!user || user.role !== "superadmin") return <Redirect to="/dashboard" />;
  return <AdminPage />;
}

function Router() {
  return (
    <GuestBootstrap>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/dashboard" component={DashboardPage} />
        <Route path="/tournaments/new" component={NewTournamentPage} />
        <Route path="/tournaments/:id/results" component={TournamentResultsPage} />
        <Route path="/tournaments/:id" component={TournamentPage} />
        <Route path="/admin" component={RouteAdmin} />
        <Route path="/about" component={AboutPage} />
        <Route path="/team" component={TeamPage} />
        <Route component={NotFound} />
      </Switch>
    </GuestBootstrap>
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
