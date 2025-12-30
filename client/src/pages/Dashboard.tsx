import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  ArrowRight,
  BookOpen,
  Zap,
  TrendingUp,
  Target,
  Sparkles,
  CreditCard,
  Video,
  Users,
  Calendar,
  Bot,
  Lock,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: subscription } = trpc.subscription.getSubscription.useQuery();
  const { data: contentStats } = trpc.content.listGenerated.useQuery({
    limit: 100,
  });

  const features = [
    // PLANO START
    {
      title: "Radar de Bio",
      description: "Descubra onde sua clínica está perdendo agendamentos",
      icon: Target,
      color: "from-amber-500 to-orange-500",
      href: "/dashboard/radar-bio",
      badge: "START",
      plan: "start",
    },
    {
      title: "Robô de Post",
      description: "Posts prontos que posicionam você como referência",
      icon: Bot,
      color: "from-purple-500 to-violet-500",
      href: "/dashboard/robo-produtor",
      badge: "START",
      plan: "start",
    },
    {
      title: "IA de E-books",
      description: "Isca digital profissional que atrai clientes certas",
      icon: BookOpen,
      color: "from-blue-500 to-cyan-500",
      href: "/dashboard/ebooks",
      badge: "START",
      plan: "start",
    },
    // PLANO PRO
    {
      title: "Roteiros de Reels",
      description: "Scripts prontos para vídeos que geram agendamentos",
      icon: Video,
      color: "from-rose-500 to-pink-500",
      href: "/dashboard/veo-cinema",
      badge: "PRO",
      plan: "pro",
    },
    {
      title: "Anúncios que Vendem",
      description: "Campanhas para atrair clientes que pagam bem",
      icon: Target,
      color: "from-green-500 to-emerald-500",
      href: "/dashboard/anuncios",
      badge: "PRO",
      plan: "pro",
    },
    {
      title: "Fluxo de Clientes",
      description: "Organize cada cliente do contato ao fechamento",
      icon: Users,
      color: "from-teal-500 to-cyan-500",
      href: "/dashboard/fluxo-clientes",
      badge: "PRO",
      plan: "pro",
    },
    {
      title: "Agenda Estratégica",
      description: "Reduza faltas e priorize procedimentos lucrativos",
      icon: Calendar,
      color: "from-violet-500 to-purple-500",
      href: "/dashboard/agenda-estrategica",
      badge: "PRO",
      plan: "pro",
    },
    {
      title: "Calendário de Vendas",
      description: "O que postar, quando postar e com que intenção",
      icon: Sparkles,
      color: "from-pink-500 to-rose-500",
      href: "/dashboard/calendario",
      badge: "PRO",
      plan: "pro",
    },
  ];

  const ebooksCount = contentStats?.filter((c: any) => c.type === "ebook").length || 0;
  const adsCount = contentStats?.filter((c: any) => c.type === "ad").length || 0;
  const promptsCount = contentStats?.filter((c: any) => c.type === "prompt").length || 0;

  const stats = [
    {
      label: "E-books Criados",
      value: ebooksCount.toString(),
      icon: BookOpen,
    },
    {
      label: "Anúncios Gerados",
      value: adsCount.toString(),
      icon: Sparkles,
    },
    {
      label: "Créditos Disponíveis",
      value:
        subscription?.plan === "profissional"
          ? "∞"
          : subscription?.creditsRemaining?.toString() || "0",
      icon: Zap,
    },
    {
      label: "Plano Atual",
      value:
        subscription?.plan === "free"
          ? "Grátis"
          : subscription?.plan === "essencial"
          ? "Essencial"
          : "Profissional",
      icon: Target,
    },
  ];

  return (
    <ElevareDashboardLayout>
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 border-amber-500/30 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Olá, {user?.name?.split(" ")[0] || "Usuário"}! 👋
            </h2>
            <p className="text-amber-400 font-semibold">
              Bem-vinda ao seu Centro de Comando da Clínica Lucrativa
            </p>
            <p className="text-slate-400 text-sm mt-1">
              LucresIA - Estética Lucrativa • A IA que transforma clínicas em máquinas previsíveis de faturamento
            </p>
          </div>
          <div className="hidden md:block">
            <span className="text-4xl">L$</span>
          </div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              className="bg-white border-gray-200 p-6 hover:bg-gray-50 transition-colors shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-100 to-amber-100 rounded-lg">
                  <Icon className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          Seus Módulos Inteligentes
        </h3>
        <p className="text-slate-500 text-sm mb-6">
          Ferramentas que trabalham 24h para você faturar mais
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            const isPro = feature.badge === "PRO";
            const isStart = feature.badge === "START";
            return (
              <Card
                key={feature.title}
                className={`bg-white border-gray-200 p-5 hover:border-amber-300 transition-all hover:shadow-lg cursor-pointer group ${
                  isPro ? 'border-amber-500/20' : ''
                }`}
                onClick={() => navigate(feature.href)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={`p-2.5 bg-gradient-to-r ${feature.color} rounded-lg`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  {feature.badge && (
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                      isPro 
                        ? "bg-amber-500/20 text-amber-600 border border-amber-500/30" 
                        : isStart
                        ? "bg-green-100 text-green-600"
                        : feature.badge === "Upgrade"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-emerald-100 text-emerald-600"
                    }`}>
                      {isPro && <Lock className="w-3 h-3 inline mr-1" />}
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h4 className="text-base font-semibold text-slate-800 mb-1.5">
                  {feature.title}
                </h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">
                  {feature.description}
                </p>
                <div className="flex items-center text-amber-600 group-hover:translate-x-1 transition-transform">
                  <span className="text-xs font-medium">{isPro ? "Ver PRO" : "Acessar"}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Start Section */}
      <Card className="bg-gradient-to-r from-amber-500 to-orange-500 border-0 p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Comece Agora! 🚀
            </h3>
            <p className="text-white/90">
              Faça seu primeiro diagnóstico com o Radar de Bio e descubra como
              transformar seu Instagram em uma máquina de agendamentos
            </p>
          </div>
          <Button
            onClick={() => navigate("/dashboard/radar-bio")}
            className="bg-white text-amber-600 hover:bg-amber-50 font-semibold px-8 py-6 rounded-lg text-lg whitespace-nowrap shadow-lg"
          >
            Ativar Radar
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </Card>

      {/* Manifesto LucresIA */}
      <Card className="bg-white border-gray-200 p-8 mt-8 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800 mb-4">A Filosofia LucresIA</h3>
        <div className="space-y-3 text-slate-700">
          <p>
            <strong>Clínica lucrativa não depende de sorte.</strong>
          </p>
          <p>
            <strong>Depende de sistema, previsibilidade e posicionamento premium.</strong>
          </p>
          <p>
            <strong>
              A LucresIA é o centro de comando que trabalha 24h para você.
            </strong>
          </p>
        </div>
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
          <p className="text-slate-600 italic">
            "A cliente não compra o procedimento — compra a promessa de transformação. 
            A LucresIA te ajuda a entregar exatamente essa promessa, todo dia."
          </p>
        </div>
      </Card>
    </ElevareDashboardLayout>
  );
}
