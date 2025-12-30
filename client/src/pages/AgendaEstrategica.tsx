import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar, Plus, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { formatCurrency } from "@/lib/formatting";
import { useModalState } from "@/hooks/useModalState";
import { useAgendamentoCalculations } from "@/hooks/useAgendamentoCalculations";
import { useWeekNavigation } from "@/hooks/useWeekNavigation";
import { AgendamentoStats } from "@/components/agendamento/AgendamentoStats";
import { WeekCalendar } from "@/components/agendamento/WeekCalendar";
import { AgendamentoCard } from "@/components/agendamento/AgendamentoCard";
import { AgendamentoForm } from "@/components/agendamento/AgendamentoForm";

type Agendamento = {
  id: number;
  userId: number;
  leadId: number | null;
  clienteNome: string;
  procedimento: string;
  valor: number;
  data: string;
  horario: string;
  status: "confirmado" | "pendente" | "realizado" | "cancelado" | "remarcado";
  observacoes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export default function AgendaEstrategica() {
  // ========== TRPC QUERIES & MUTATIONS ==========
  const utils = trpc.useUtils();
  
  const { data: agendamentosData, isLoading, refetch } = trpc.crm.getAgendamentos.useQuery({
    limit: 100,
  });
  
  const { data: statsData } = trpc.crm.getCrmStats.useQuery();

  const createAgendamentoMutation = trpc.crm.createAgendamento.useMutation({
    onSuccess: () => {
      toast.success("Agendamento criado!");
      utils.crm.getAgendamentos.invalidate();
      utils.crm.getCrmStats.invalidate();
      closeForm();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updateAgendamentoMutation = trpc.crm.updateAgendamento.useMutation({
    onSuccess: (_, variables) => {
      if (variables.status === "realizado") {
        toast.success("Procedimento marcado como realizado! 💰");
      } else {
        toast.success("Status atualizado!");
      }
      utils.crm.getAgendamentos.invalidate();
      utils.crm.getCrmStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deleteAgendamentoMutation = trpc.crm.deleteAgendamento.useMutation({
    onSuccess: () => {
      toast.success("Agendamento removido");
      utils.crm.getAgendamentos.invalidate();
      utils.crm.getCrmStats.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // ========== LOCAL STATE ==========
  const hoje = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(hoje);
  const [metaMensal] = useState(25000);
  const { isOpen: showForm, open: openForm, close: closeForm } = useModalState();

  // Form state
  const [formData, setFormData] = useState({
    clienteNome: "",
    procedimento: "",
    valor: "",
    data: selectedDate,
    horario: "09:00",
    observacoes: "",
  });

  const agendamentos = agendamentosData?.agendamentos || [];

  // Use custom hooks for calculations and navigation
  const { 
    faturamentoRealizado, 
    faturamentoPrevisto, 
    progressoMeta 
  } = useAgendamentoCalculations(agendamentos, metaMensal);
  
  const { weekDays } = useWeekNavigation(selectedDate);

  // Derived state for current day
  const agendamentosDoDia = agendamentos
    .filter((a: Agendamento) => a.data === selectedDate)
    .sort((a: Agendamento, b: Agendamento) => a.horario.localeCompare(b.horario));

  const faturamentoDoDia = agendamentosDoDia
    .filter((a: Agendamento) => a.status !== "cancelado")
    .reduce((acc: number, a: Agendamento) => acc + a.valor, 0);

  const resetForm = () => {
    setFormData({
      clienteNome: "",
      procedimento: "",
      valor: "",
      data: selectedDate,
      horario: "09:00",
      observacoes: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.clienteNome || !formData.procedimento || !formData.valor) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createAgendamentoMutation.mutate({
      clienteNome: formData.clienteNome,
      procedimento: formData.procedimento,
      valor: Math.round(parseFloat(formData.valor) * 100), // Converter para centavos
      data: formData.data,
      horario: formData.horario,
      observacoes: formData.observacoes || undefined,
    });
  };

  const handleStatusChange = (id: number, newStatus: Agendamento["status"]) => {
    updateAgendamentoMutation.mutate({ id, status: newStatus });
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover este agendamento?")) {
      deleteAgendamentoMutation.mutate({ id });
    }
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + (direction === "next" ? 7 : -7));
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleFormChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (isLoading) {
    return (
      <ElevareDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-slate-400">Carregando agenda...</span>
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
              <div className="p-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Agenda Estratégica de Faturamento</h1>
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
                onClick={() => {
                  setFormData({ ...formData, data: selectedDate });
                  openForm();
                }}
                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>
            </div>
          </div>
          <p className="text-slate-400 mt-2">
            Organize sua agenda para vender mais, reduzir faltas e priorizar procedimentos de maior ticket.
            <span className="text-emerald-400 ml-2">✓ Dados salvos no banco</span>
          </p>
        </div>

        {/* Financial Stats */}
        <AgendamentoStats
          faturamentoRealizado={faturamentoRealizado}
          faturamentoPrevisto={faturamentoPrevisto}
          metaMensal={metaMensal}
          progressoMeta={progressoMeta}
        />

        {/* Week Navigation and Calendar */}
        <WeekCalendar
          weekDays={weekDays}
          selectedDate={selectedDate}
          hoje={hoje}
          agendamentos={agendamentos}
          onSelectDate={setSelectedDate}
          onNavigateWeek={navigateWeek}
          onGoToToday={() => setSelectedDate(hoje)}
        />

        {/* Day Detail */}
        <Card className="bg-slate-800/50 border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Previsão:</span>
              <span className="text-xl font-bold text-green-400">{formatCurrency(faturamentoDoDia)}</span>
            </div>
          </div>

          {agendamentosDoDia.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-400 mb-2">Nenhum agendamento</h3>
              <p className="text-slate-500 mb-4">Não há agendamentos para este dia</p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setFormData({ ...formData, data: selectedDate });
                  openForm();
                }}
                className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Agendamento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {agendamentosDoDia.map((agendamento: Agendamento) => (
                <AgendamentoCard
                  key={agendamento.id}
                  agendamento={agendamento}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  isDeleting={deleteAgendamentoMutation.isPending}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Add Agendamento Modal */}
        <AgendamentoForm
          isOpen={showForm}
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={closeForm}
          isSubmitting={createAgendamentoMutation.isPending}
        />
      </div>
    </ElevareDashboardLayout>
  );
}
