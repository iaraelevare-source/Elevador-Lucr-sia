import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Activity,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  Trash2,
  Plus,
  RefreshCw,
  Loader2,
  BarChart3,
  Crown,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

// Types
interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activeSubscriptions: number;
  paidSubscriptions: number;
  totalDiagnostics: number;
  diagnosticsThisMonth: number;
  mrr: number;
  avgRating: number;
}

interface UserData {
  id: number;
  name: string | null;
  email: string;
  credits: number;
  role: string;
  createdAt: string | null;
  subscription: {
    plan: string;
    status: string;
    creditsRemaining: number;
  } | null;
}

interface TrialData {
  id: number;
  userName: string | null;
  activationMethod: string;
  isActive: boolean;
}

interface ReferralData {
  id: number;
  referrerName: string | null;
  referralCode: string;
  clicked: boolean;
  converted: boolean;
}

interface AnalyticsData {
  planDistribution: Array<{ plan: string; count: number }>;
  contentTypes: Array<{ type: string; count: number }>;
}

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState<"overview" | "users" | "analytics">("overview");

  // Queries - cast to expected types
  const { data: stats, isLoading: loadingStats, refetch: refetchStats } = trpc.admin.getStats.useQuery() as {
    data: AdminStats | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  
  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = trpc.admin.getUsers.useQuery({
    page: currentPage,
    limit: 15,
  }) as {
    data: { users: UserData[]; total: number; pages: number } | undefined;
    isLoading: boolean;
    refetch: () => void;
  };
  
  const { data: analytics, isLoading: loadingAnalytics } = trpc.admin.getAnalytics.useQuery(undefined, {
    enabled: selectedTab === "analytics",
  }) as {
    data: AnalyticsData | undefined;
    isLoading: boolean;
  };
  
  const { data: trials } = trpc.admin.getTrials.useQuery(undefined, {
    enabled: selectedTab === "overview",
  }) as {
    data: TrialData[] | undefined;
  };
  
  const { data: referrals } = trpc.admin.getReferrals.useQuery(undefined, {
    enabled: selectedTab === "overview",
  }) as {
    data: ReferralData[] | undefined;
  };

  // Mutations
  const updateRoleMutation = trpc.admin.updateUserRole.useMutation({
    onSuccess: () => {
      toast.success("Função atualizada!");
      refetchUsers();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const updatePlanMutation = trpc.admin.updateUserPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano atualizado!");
      refetchUsers();
      refetchStats();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const addCreditsMutation = trpc.admin.addCredits.useMutation({
    onSuccess: () => {
      toast.success("Créditos adicionados!");
      refetchUsers();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      toast.success("Usuário removido");
      refetchUsers();
      refetchStats();
    },
    onError: (error: { message: string }) => toast.error(error.message),
  });

  useEffect(() => {
    document.title = "Admin | Elevare";
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const planColors: Record<string, string> = {
    free: "bg-slate-500/20 text-slate-400",
    essencial: "bg-purple-500/20 text-purple-400",
    profissional: "bg-amber-500/20 text-amber-400",
  };

  if (loadingStats) {
    return (
      <ElevareDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-slate-400">Carregando painel admin...</span>
        </div>
      </ElevareDashboardLayout>
    );
  }

  return (
    <ElevareDashboardLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-500" />
              Painel Administrativo
            </h1>
            <p className="text-slate-400 mt-1">Gerencie usuários, assinaturas e métricas</p>
          </div>
          <Button
            onClick={() => {
              refetchStats();
              refetchUsers();
            }}
            variant="outline"
            className="border-slate-600"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { id: "overview", label: "Visão Geral", icon: BarChart3 },
            { id: "users", label: "Usuários", icon: Users },
            { id: "analytics", label: "Analytics", icon: TrendingUp },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={selectedTab === tab.id ? "default" : "outline"}
              onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
              className={selectedTab === tab.id ? "bg-purple-600" : "border-slate-600"}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Overview Tab */}
        {selectedTab === "overview" && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-500/20 rounded-xl">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Total Usuários</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                    <p className="text-xs text-green-400">+{stats?.newUsersThisWeek || 0} esta semana</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/20 rounded-xl">
                    <DollarSign className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">MRR</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats?.mrr || 0)}</p>
                    <p className="text-xs text-slate-400">{stats?.paidSubscriptions || 0} assinantes</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-500/20 rounded-xl">
                    <Activity className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Diagnósticos</p>
                    <p className="text-2xl font-bold text-white">{stats?.totalDiagnostics || 0}</p>
                    <p className="text-xs text-slate-400">+{stats?.diagnosticsThisMonth || 0} este mês</p>
                  </div>
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-500/20 rounded-xl">
                    <Star className="w-6 h-6 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Avaliação Média</p>
                    <p className="text-2xl font-bold text-white">{stats?.avgRating || 0}/5</p>
                    <p className="text-xs text-slate-400">NPS dos diagnósticos</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Trials & Referrals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Trials Recentes
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {trials?.slice(0, 5).map((trial: TrialData) => (
                    <div key={trial.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{trial.userName || "Usuário"}</p>
                        <p className="text-xs text-slate-400">{trial.activationMethod}</p>
                      </div>
                      <Badge className={trial.isActive ? "bg-green-500/20 text-green-400" : "bg-slate-500/20 text-slate-400"}>
                        {trial.isActive ? "Ativo" : "Expirado"}
                      </Badge>
                    </div>
                  ))}
                  {(!trials || trials.length === 0) && (
                    <p className="text-slate-500 text-center py-4">Nenhum trial ativo</p>
                  )}
                </div>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-purple-400" />
                  Referrals Recentes
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {referrals?.slice(0, 5).map((ref: ReferralData) => (
                    <div key={ref.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{ref.referrerName || "Usuário"}</p>
                        <p className="text-xs text-slate-400">Código: {ref.referralCode}</p>
                      </div>
                      <Badge className={ref.converted ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}>
                        {ref.converted ? "Convertido" : ref.clicked ? "Clicado" : "Pendente"}
                      </Badge>
                    </div>
                  ))}
                  {(!referrals || referrals.length === 0) && (
                    <p className="text-slate-500 text-center py-4">Nenhum referral ainda</p>
                  )}
                </div>
              </Card>
            </div>
          </>
        )}

        {/* Users Tab */}
        {selectedTab === "users" && (
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Gerenciar Usuários</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 bg-slate-900/50 border-slate-600 w-64"
                  />
                </div>
              </div>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-700">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Usuário</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Plano</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Créditos</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Cadastro</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersData?.users
                        .filter(
                          (user: UserData) =>
                            !searchTerm ||
                            user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.email?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((user: UserData) => (
                          <tr key={user.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-white font-medium">{user.name || "Sem nome"}</p>
                                <p className="text-xs text-slate-400">{user.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Select
                                value={user.subscription?.plan || "free"}
                                onValueChange={(value) =>
                                  updatePlanMutation.mutate({
                                    userId: user.id,
                                    plan: value as "free" | "essencial" | "profissional",
                                  })
                                }
                              >
                                <SelectTrigger className="w-32 bg-slate-900/50 border-slate-600">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="free">Free</SelectItem>
                                  <SelectItem value="essencial">Essencial</SelectItem>
                                  <SelectItem value="profissional">Profissional</SelectItem>
                                </SelectContent>
                              </Select>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <span className="text-white">
                                  {user.subscription?.creditsRemaining === -1
                                    ? "∞"
                                    : user.subscription?.creditsRemaining || 0}
                                </span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    addCreditsMutation.mutate({ userId: user.id, credits: 50 })
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-sm">
                              {formatDate(user.createdAt)}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() =>
                                    updateRoleMutation.mutate({
                                      userId: user.id,
                                      role: user.role === "admin" ? "user" : "admin",
                                    })
                                  }
                                  className={user.role === "admin" ? "text-amber-400" : "text-slate-400"}
                                >
                                  <Shield className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => {
                                    if (confirm("Tem certeza que deseja remover este usuário?")) {
                                      deleteUserMutation.mutate({ userId: user.id });
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Mostrando página {currentPage} de {usersData?.pages || 1}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="border-slate-600"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage >= (usersData?.pages || 1)}
                      className="border-slate-600"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        )}

        {/* Analytics Tab */}
        {selectedTab === "analytics" && (
          <div className="space-y-6">
            {loadingAnalytics ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
              </div>
            ) : (
              <>
                {/* Plan Distribution */}
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribuição de Planos</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {analytics?.planDistribution.map((item: { plan: string; count: number }) => (
                      <div key={item.plan} className="text-center p-4 bg-slate-900/50 rounded-lg">
                        <Badge className={planColors[item.plan] || planColors.free}>
                          {item.plan}
                        </Badge>
                        <p className="text-2xl font-bold text-white mt-2">{item.count}</p>
                        <p className="text-xs text-slate-400">usuários</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Content Types */}
                <Card className="bg-slate-800/50 border-slate-700 p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Gerações por Tipo</h3>
                  <div className="space-y-3">
                    {analytics?.contentTypes.map((item: { type: string; count: number }) => (
                      <div key={item.type} className="flex items-center justify-between">
                        <span className="text-slate-300 capitalize">{item.type}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{
                                width: `${Math.min(100, (item.count / 100) * 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-white font-medium w-12 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </ElevareDashboardLayout>
  );
}
