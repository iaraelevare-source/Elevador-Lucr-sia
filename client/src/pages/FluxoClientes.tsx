import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Loader2,
  Plus,
  Trash2,
  MessageCircle,
  Phone,
  Mail,
  Thermometer,
  ThermometerSun,
  ThermometerSnowflake,
  Flame,
  Copy,
  Send,
  Calendar,
  Filter,
  Search,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

// Types from backend
type Lead = {
  id: number;
  userId: number;
  nome: string;
  telefone: string | null;
  email: string | null;
  procedimento: string | null;
  origem: string | null;
  temperatura: "frio" | "morno" | "quente";
  ultimoContato: Date | null;
  observacoes: string | null;
  status: "novo" | "contatado" | "agendado" | "convertido" | "perdido";
  createdAt: Date;
  updatedAt: Date;
};

const temperaturaBadge = {
  frio: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: ThermometerSnowflake, label: "Frio" },
  morno: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: ThermometerSun, label: "Morno" },
  quente: { color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Flame, label: "Quente 🔥" },
};

const statusBadge = {
  novo: { color: "bg-purple-500/20 text-purple-400", label: "Novo" },
  contatado: { color: "bg-blue-500/20 text-blue-400", label: "Contatado" },
  agendado: { color: "bg-green-500/20 text-green-400", label: "Agendado" },
  convertido: { color: "bg-emerald-500/20 text-emerald-400", label: "Convertido ✓" },
  perdido: { color: "bg-slate-500/20 text-slate-400", label: "Perdido" },
};

// Scripts de WhatsApp pré-definidos
const whatsappScripts = {
  primeiro_contato: `Olá {nome}! 👋

Vi que você demonstrou interesse em {procedimento}. 

Sou da [Nome da Clínica] e gostaria de te ajudar a tirar suas dúvidas.

Posso te contar mais sobre o procedimento? 💜`,

  follow_up: `Oi {nome}! 

Passando para saber se você teve alguma dúvida sobre {procedimento}.

Temos horários disponíveis essa semana. Posso verificar um melhor para você? 📅`,

  urgencia: `{nome}, tudo bem? 

Lembrei de você! Essa semana temos uma condição especial para {procedimento}.

Quer que eu reserve um horário para você? ⏰`,

  pos_agendamento: `{nome}, confirmado seu horário para {procedimento}! ✨

📅 Data: [DATA]
⏰ Horário: [HORÁRIO]

Alguma dúvida antes do procedimento? Estou à disposição! 💜`,
};

export default function FluxoClientes() {
  // ========== TRPC QUERIES & MUTATIONS ==========
  const utils = trpc.useUtils();
  
  const { data: leadsData, isLoading, refetch } = trpc.crm.getLeads.useQuery({});
  const { data: statsData } = trpc.crm.getCrmStats.useQuery();
  
  const createLeadMutation = trpc.crm.createLead.useMutation({
    onSuccess: () => {
      toast.success("Lead adicionado!");
      utils.crm.getLeads.invalidate();
      utils.crm.getCrmStats.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateLeadMutation = trpc.crm.updateLead.useMutation({
    onSuccess: () => {
      toast.success("Lead atualizado!");
      utils.crm.getLeads.invalidate();
      utils.crm.getCrmStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteLeadMutation = trpc.crm.deleteLead.useMutation({
    onSuccess: () => {
      toast.success("Lead removido!");
      utils.crm.getLeads.invalidate();
      utils.crm.getCrmStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // ========== LOCAL STATE ==========
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [filtroTemperatura, setFiltroTemperatura] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedScript, setSelectedScript] = useState<string>("primeiro_contato");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    procedimento: "",
    origem: "instagram",
    temperatura: "morno" as "frio" | "morno" | "quente",
    observacoes: "",
  });

  const leads = leadsData?.leads || [];
  const stats = statsData?.stats || {
    totalLeads: 0,
    leadsPorStatus: { novo: 0, contatado: 0, agendado: 0, convertido: 0, perdido: 0 },
    leadsPorTemperatura: { frio: 0, morno: 0, quente: 0 },
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      telefone: "",
      email: "",
      procedimento: "",
      origem: "instagram",
      temperatura: "morno",
      observacoes: "",
    });
    setEditingLead(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.telefone) {
      toast.error("Nome e telefone são obrigatórios");
      return;
    }

    if (editingLead) {
      updateLeadMutation.mutate({
        id: editingLead.id,
        ...formData,
        ultimoContato: new Date().toISOString(),
      });
    } else {
      createLeadMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este lead?")) {
      deleteLeadMutation.mutate({ id });
    }
  };

  const handleStatusChange = (id: number, newStatus: Lead["status"]) => {
    updateLeadMutation.mutate({ id, status: newStatus });
  };

  const handleTemperaturaChange = (id: number, newTemp: Lead["temperatura"]) => {
    updateLeadMutation.mutate({ id, temperatura: newTemp });
  };

  const getScriptForLead = (lead: Lead, scriptKey: string) => {
    const script = whatsappScripts[scriptKey as keyof typeof whatsappScripts];
    return script
      .replace("{nome}", lead.nome.split(" ")[0])
      .replace("{procedimento}", lead.procedimento || "[Procedimento]");
  };

  const openWhatsApp = (lead: Lead, message: string) => {
    const phone = (lead.telefone || "").replace(/\D/g, "");
    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Filtrar leads localmente
  const filteredLeads = leads.filter((lead: Lead) => {
    const matchTemp = filtroTemperatura === "todos" || lead.temperatura === filtroTemperatura;
    const matchStatus = filtroStatus === "todos" || lead.status === filtroStatus;
    const matchSearch = lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       (lead.procedimento || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchTemp && matchStatus && matchSearch;
  });

  if (isLoading) {
    return (
      <ElevareDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-slate-400">Carregando leads...</span>
        </div>
      </ElevareDashboardLayout>
    );
  }

  return (
    <ElevareDashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Fluxo Inteligente de Clientes</h1>
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="border-slate-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Cliente
              </Button>
            </div>
          </div>
          <p className="text-slate-400 mt-2">
            Organiza cada cliente do primeiro contato ao fechamento. Nunca mais perca uma venda.
            <span className="text-emerald-400 ml-2">✓ Dados salvos no banco</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Total de Leads</p>
            <p className="text-3xl font-bold text-white">{stats.totalLeads}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Leads Quentes 🔥</p>
            <p className="text-3xl font-bold text-red-400">{stats.leadsPorTemperatura.quente}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Agendados</p>
            <p className="text-3xl font-bold text-green-400">{stats.leadsPorStatus.agendado}</p>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 p-4">
            <p className="text-slate-400 text-sm">Convertidos</p>
            <p className="text-3xl font-bold text-emerald-400">{stats.leadsPorStatus.convertido}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome ou procedimento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white pl-10"
            />
          </div>
          <Select value={filtroTemperatura} onValueChange={setFiltroTemperatura}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
              <Thermometer className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Temperatura" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas</SelectItem>
              <SelectItem value="quente">🔥 Quente</SelectItem>
              <SelectItem value="morno">🌤️ Morno</SelectItem>
              <SelectItem value="frio">❄️ Frio</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="novo">Novo</SelectItem>
              <SelectItem value="contatado">Contatado</SelectItem>
              <SelectItem value="agendado">Agendado</SelectItem>
              <SelectItem value="convertido">Convertido</SelectItem>
              <SelectItem value="perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads List */}
        <div className="space-y-4">
          {filteredLeads.length === 0 ? (
            <Card className="bg-slate-800/30 border-slate-700 border-dashed p-12 text-center">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-400 mb-2">Nenhum lead encontrado</h3>
              <p className="text-slate-500">Adicione seu primeiro lead clicando em "Nova Cliente"</p>
            </Card>
          ) : (
            filteredLeads.map((lead: Lead) => {
              const TempIcon = temperaturaBadge[lead.temperatura].icon;
              return (
                <Card key={lead.id} className="bg-slate-800/50 border-slate-700 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg ${temperaturaBadge[lead.temperatura].color}`}>
                        <TempIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{lead.nome}</h3>
                          <Badge className={statusBadge[lead.status].color}>
                            {statusBadge[lead.status].label}
                          </Badge>
                        </div>
                        <p className="text-slate-400 text-sm">{lead.procedimento || "Sem procedimento definido"}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          {lead.telefone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {lead.telefone}
                            </span>
                          )}
                          {lead.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {lead.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Criado: {new Date(lead.createdAt).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        {lead.observacoes && (
                          <p className="text-slate-500 text-xs mt-2 italic">"{lead.observacoes}"</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Temperatura */}
                      <Select 
                        value={lead.temperatura} 
                        onValueChange={(v) => handleTemperaturaChange(lead.id, v as Lead["temperatura"])}
                      >
                        <SelectTrigger className="w-[120px] bg-slate-700 border-slate-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frio">❄️ Frio</SelectItem>
                          <SelectItem value="morno">🌤️ Morno</SelectItem>
                          <SelectItem value="quente">🔥 Quente</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Status */}
                      <Select 
                        value={lead.status} 
                        onValueChange={(v) => handleStatusChange(lead.id, v as Lead["status"])}
                      >
                        <SelectTrigger className="w-[130px] bg-slate-700 border-slate-600 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="novo">Novo</SelectItem>
                          <SelectItem value="contatado">Contatado</SelectItem>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="convertido">Convertido</SelectItem>
                          <SelectItem value="perdido">Perdido</SelectItem>
                        </SelectContent>
                      </Select>

                      {/* WhatsApp */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                        onClick={() => {
                          setSelectedLead(lead);
                          setSelectedScript("primeiro_contato");
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </Button>

                      {/* Delete */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleDelete(lead.id)}
                        disabled={deleteLeadMutation.isPending}
                      >
                        {deleteLeadMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Add/Edit Lead Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-800 border-slate-700 p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-white mb-4">
                {editingLead ? "Editar Lead" : "Novo Lead"}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Nome *</Label>
                  <Input
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Telefone *</Label>
                    <Input
                      value={formData.telefone}
                      onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="(27) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Email</Label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Procedimento de Interesse</Label>
                  <Input
                    value={formData.procedimento}
                    onChange={(e) => setFormData({...formData, procedimento: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Ex: Harmonização Facial"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Origem</Label>
                    <Select value={formData.origem} onValueChange={(v) => setFormData({...formData, origem: v})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Temperatura</Label>
                    <Select value={formData.temperatura} onValueChange={(v) => setFormData({...formData, temperatura: v as any})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="frio">❄️ Frio</SelectItem>
                        <SelectItem value="morno">🌤️ Morno</SelectItem>
                        <SelectItem value="quente">🔥 Quente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Anotações sobre o lead..."
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={resetForm} className="border-slate-600">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-emerald-500 hover:bg-emerald-600"
                  disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                >
                  {(createLeadMutation.isPending || updateLeadMutation.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingLead ? "Salvar" : "Adicionar"}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* WhatsApp Script Modal */}
        {selectedLead && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-800 border-slate-700 p-6 w-full max-w-lg">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-green-400" />
                Enviar WhatsApp para {selectedLead.nome.split(" ")[0]}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white mb-2 block">Escolha o Script</Label>
                  <Select value={selectedScript} onValueChange={setSelectedScript}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="primeiro_contato">👋 Primeiro Contato</SelectItem>
                      <SelectItem value="follow_up">🔄 Follow-up</SelectItem>
                      <SelectItem value="urgencia">⏰ Urgência/Promoção</SelectItem>
                      <SelectItem value="pos_agendamento">✅ Pós-Agendamento</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <p className="text-slate-300 whitespace-pre-line text-sm">
                    {getScriptForLead(selectedLead, selectedScript)}
                  </p>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(getScriptForLead(selectedLead, selectedScript));
                      toast.success("Script copiado!");
                    }}
                    className="border-slate-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedLead(null)} className="border-slate-600">
                      Fechar
                    </Button>
                    <Button
                      onClick={() => {
                        openWhatsApp(selectedLead, getScriptForLead(selectedLead, selectedScript));
                        // Atualizar último contato
                        updateLeadMutation.mutate({
                          id: selectedLead.id,
                          status: "contatado",
                        });
                        setSelectedLead(null);
                      }}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Abrir WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ElevareDashboardLayout>
  );
}
