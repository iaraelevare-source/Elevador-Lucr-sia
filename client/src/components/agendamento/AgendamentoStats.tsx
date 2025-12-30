import { Card } from "@/components/ui/card";
import { DollarSign, TrendingUp, Target, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

type AgendamentoStatsProps = {
  faturamentoRealizado: number;
  faturamentoPrevisto: number;
  metaMensal: number;
  progressoMeta: number;
};

export function AgendamentoStats({
  faturamentoRealizado,
  faturamentoPrevisto,
  metaMensal,
  progressoMeta,
}: AgendamentoStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-4 h-4 text-green-400" />
          <p className="text-slate-400 text-sm">Realizado (Mês)</p>
        </div>
        <p className="text-2xl font-bold text-green-400">
          {formatCurrency(faturamentoRealizado)}
        </p>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <p className="text-slate-400 text-sm">Previsto (Mês)</p>
        </div>
        <p className="text-2xl font-bold text-amber-400">
          {formatCurrency(faturamentoPrevisto)}
        </p>
      </Card>
      
      <Card className="bg-slate-800/50 border-slate-700 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-violet-400" />
          <p className="text-slate-400 text-sm">Meta Mensal</p>
        </div>
        <p className="text-2xl font-bold text-violet-400">
          {formatCurrency(metaMensal * 100)}
        </p>
      </Card>
      
      <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-500/30 p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-white" />
          <p className="text-slate-300 text-sm">Progresso</p>
        </div>
        <p className="text-2xl font-bold text-white">{progressoMeta.toFixed(0)}%</p>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all" 
            style={{ width: `${progressoMeta}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
