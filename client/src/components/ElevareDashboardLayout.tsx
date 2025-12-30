import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_LOGO, APP_TITLE } from "@/const";
import {
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
  Sparkles,
  Zap,
  ChevronDown,
  Home,
  Video,
  Target,
  Users,
  Calendar,
  Bot,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

interface ElevareDashboardLayoutProps {
  children: React.ReactNode;
}

export default function ElevareDashboardLayout({
  children,
}: ElevareDashboardLayoutProps) {
  const { user, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 mb-4">
            <Sparkles className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-slate-600 font-medium">Carregando Elevare...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      label: "Início",
      icon: Home,
      href: "/dashboard",
      badge: null,
      plan: "start",
    },
    {
      label: "Radar de Bio",
      icon: Zap,
      href: "/dashboard/radar-bio",
      badge: null,
      plan: "start",
    },
    {
      label: "Robô de Post",
      icon: Bot,
      href: "/dashboard/robo-produtor",
      badge: null,
      plan: "start",
    },
    {
      label: "IA de E-books",
      icon: BookOpen,
      href: "/dashboard/ebooks",
      badge: null,
      plan: "start",
    },
    {
      label: "Roteiros de Reels",
      icon: Video,
      href: "/dashboard/veo-cinema",
      badge: "PRO",
      plan: "pro",
    },
    {
      label: "Anúncios que Vendem",
      icon: Target,
      href: "/dashboard/anuncios",
      badge: "PRO",
      plan: "pro",
    },
    {
      label: "Fluxo de Clientes",
      icon: Users,
      href: "/dashboard/fluxo-clientes",
      badge: "PRO",
      plan: "pro",
    },
    {
      label: "Agenda Estratégica",
      icon: Calendar,
      href: "/dashboard/agenda-estrategica",
      badge: "PRO",
      plan: "pro",
    },
    {
      label: "Calendário de Vendas",
      icon: Sparkles,
      href: "/dashboard/calendario",
      badge: "PRO",
      plan: "pro",
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-gray-200 shadow-sm transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                <img
                  src={APP_LOGO}
                  alt={APP_TITLE}
                  className="w-6 h-6 object-contain"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-800">Elevare</h1>
                <p className="text-xs text-slate-500">NeuroVendas</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
            title={sidebarOpen ? "Fechar menu" : "Abrir menu"}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.href}
                onClick={() => navigate(item.href)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-purple-50 transition-colors text-slate-600 hover:text-purple-700 group relative"
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="text-sm font-medium flex-1 text-left">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-600">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">
                        {user?.name || "Usuário"}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user?.email}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Bem-vindo, {user?.name?.split(" ")[0]}! 👋
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Transforme sua estética em um negócio lucrativo com IA
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Card className="bg-purple-50 border-purple-200 px-4 py-2">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">
                  100 créditos
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
