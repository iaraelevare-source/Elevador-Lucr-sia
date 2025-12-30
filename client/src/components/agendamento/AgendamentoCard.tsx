import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, User, Trash2, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatting";

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

const statusConfig = {
  confirmado: { color: "bg-green-500/20 text-green-400 border-green-500/30", label: "Confirmado ✓" },
  pendente: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Pendente" },
  realizado: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Realizado 💰" },
  cancelado: { color: "bg-red-500/20 text-red-400 border-red-500/30", label: "Cancelado" },
  remarcado: { color: "bg-purple-500/20 text-purple-400 border-purple-500/30", label: "Remarcado" },
};

type AgendamentoCardProps = {
  agendamento: Agendamento;
  onStatusChange: (id: number, newStatus: Agendamento["status"]) => void;
  onDelete: (id: number) => void;
  isDeleting: boolean;
};

export function AgendamentoCard({
  agendamento,
  onStatusChange,
  onDelete,
  isDeleting,
}: AgendamentoCardProps) {
  return (
    <div 
      className={`flex items-center justify-between p-4 rounded-lg border ${
        agendamento.status === "cancelado" 
          ? 'bg-slate-900/30 border-slate-700 opacity-50' 
          : 'bg-slate-900/50 border-slate-700'
      }`}
    >
      <div className="flex items-center gap-4">
        <div className="text-center">
          <Clock className="w-4 h-4 text-slate-400 mx-auto mb-1" />
          <span className="text-white font-medium">{agendamento.horario}</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span className="text-white font-medium">{agendamento.clienteNome}</span>
            <Badge className={statusConfig[agendamento.status].color}>
              {statusConfig[agendamento.status].label}
            </Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">{agendamento.procedimento}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-lg font-bold ${
          agendamento.status === "realizado" ? 'text-green-400' : 'text-white'
        }`}>
          {formatCurrency(agendamento.valor)}
        </span>

        <Select 
          value={agendamento.status} 
          onValueChange={(v) => onStatusChange(agendamento.id, v as Agendamento["status"])}
        >
          <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600 text-white text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pendente">Pendente</SelectItem>
            <SelectItem value="confirmado">Confirmado</SelectItem>
            <SelectItem value="realizado">✓ Realizado</SelectItem>
            <SelectItem value="remarcado">Remarcado</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          variant="outline"
          className="border-red-500/30 text-red-400 hover:bg-red-500/10"
          onClick={() => onDelete(agendamento.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
