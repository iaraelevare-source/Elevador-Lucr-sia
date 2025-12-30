import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import RadarBio from "./pages/RadarBio";
import Pricing from "./pages/Pricing";
import EbookGenerator from "./pages/EbookGenerator";
import RoboProdutor from "./pages/RoboProdutor";
import VeoCinema from "./pages/VeoCinema";
import AdsManager from "./pages/AdsManager";
import FluxoClientes from "./pages/FluxoClientes";
import AgendaEstrategica from "./pages/AgendaEstrategica";
import CalendarioEstrategico from "./pages/CalendarioEstrategico";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DiagnosticoElevare from "./pages/DiagnosticoElevare";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SettingsLGPD from "./pages/SettingsLGPD";
import CookieBanner from "./components/CookieBanner";
import { useAuth } from "@/_core/hooks/useAuth";

// Protected Route wrapper - redirects to login if not authenticated
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-4 animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-slate-400 font-medium">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  return <Component />;
}

// Admin Route wrapper - redirects non-admins
function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, loading, user } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-4 animate-pulse">
            <span className="text-2xl">🔒</span>
          </div>
          <p className="text-slate-400 font-medium">Verificando acesso...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }
  
  if (user?.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }
  
  return <Component />;
}

function Router() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 mb-4 animate-pulse">
            <span className="text-2xl">✨</span>
          </div>
          <p className="text-slate-400 font-medium">Carregando Elevare...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/radar-bio" component={RadarBio} />
      <Route path="/diagnostico" component={DiagnosticoElevare} />
      
      {/* Admin Routes */}
      <Route path="/admin">{() => <AdminRoute component={AdminDashboard} />}</Route>
      
      {/* Legal Pages - Public */}
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      
      {/* LGPD Settings - Protected */}
      <Route path="/settings/lgpd">{() => <ProtectedRoute component={SettingsLGPD} />}</Route>
      <Route path="/settings/privacidade">{() => <ProtectedRoute component={SettingsLGPD} />}</Route>
      
      {/* Protected Routes - redirect to login if not authenticated */}
      <Route path="/dashboard">{() => <ProtectedRoute component={Dashboard} />}</Route>
      <Route path="/dashboard/radar-bio">{() => <ProtectedRoute component={RadarBio} />}</Route>
      <Route path="/dashboard/ebooks">{() => <ProtectedRoute component={EbookGenerator} />}</Route>
      <Route path="/dashboard/robo-produtor">{() => <ProtectedRoute component={RoboProdutor} />}</Route>
      {/* PRO Routes */}
      <Route path="/dashboard/veo-cinema">{() => <ProtectedRoute component={VeoCinema} />}</Route>
      <Route path="/dashboard/anuncios">{() => <ProtectedRoute component={AdsManager} />}</Route>
      <Route path="/dashboard/fluxo-clientes">{() => <ProtectedRoute component={FluxoClientes} />}</Route>
      <Route path="/dashboard/agenda-estrategica">{() => <ProtectedRoute component={AgendaEstrategica} />}</Route>
      <Route path="/dashboard/calendario">{() => <ProtectedRoute component={CalendarioEstrategico} />}</Route>
      
      {/* Fallback */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieBanner />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
