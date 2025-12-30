import { useMemo } from "react";

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

/**
 * Hook for calculating financial metrics from appointments
 * @param agendamentos - List of appointments
 * @param metaMensal - Monthly target in reais (will be converted to cents)
 * @returns Calculated financial metrics
 */
export function useAgendamentoCalculations(
  agendamentos: Agendamento[],
  metaMensal: number = 25000
) {
  const calculations = useMemo(() => {
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();

    // Filter appointments for current month
    const agendamentosDoMes = agendamentos.filter((a) => {
      const d = new Date(a.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    });

    // Calculate realized revenue (completed appointments)
    const faturamentoRealizado = agendamentosDoMes
      .filter((a) => a.status === "realizado")
      .reduce((acc, a) => acc + a.valor, 0);

    // Calculate projected revenue (confirmed and pending appointments)
    const faturamentoPrevisto = agendamentosDoMes
      .filter((a) => a.status === "confirmado" || a.status === "pendente")
      .reduce((acc, a) => acc + a.valor, 0);

    // Calculate total revenue
    const faturamentoTotal = faturamentoRealizado + faturamentoPrevisto;

    // Calculate progress towards monthly target
    const progressoMeta = Math.min(
      (faturamentoTotal / (metaMensal * 100)) * 100,
      100
    );

    return {
      agendamentosDoMes,
      faturamentoRealizado,
      faturamentoPrevisto,
      faturamentoTotal,
      progressoMeta,
    };
  }, [agendamentos, metaMensal]);

  return calculations;
}
