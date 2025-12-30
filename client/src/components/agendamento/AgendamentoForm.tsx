import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type FormData = {
  clienteNome: string;
  procedimento: string;
  valor: string;
  data: string;
  horario: string;
  observacoes: string;
};

type AgendamentoFormProps = {
  isOpen: boolean;
  formData: FormData;
  onFormChange: (field: keyof FormData, value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
};

export function AgendamentoForm({
  isOpen,
  formData,
  onFormChange,
  onSubmit,
  onClose,
  isSubmitting,
}: AgendamentoFormProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="bg-slate-800 border-slate-700 p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Novo Agendamento</h2>
        
        <div className="space-y-4">
          <div>
            <Label className="text-white">Nome da Cliente *</Label>
            <Input
              value={formData.clienteNome}
              onChange={(e) => onFormChange("clienteNome", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Nome completo"
            />
          </div>
          
          <div>
            <Label className="text-white">Procedimento *</Label>
            <Input
              value={formData.procedimento}
              onChange={(e) => onFormChange("procedimento", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Ex: Harmonização Facial"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-white">Valor (R$) *</Label>
              <Input
                type="number"
                value={formData.valor}
                onChange={(e) => onFormChange("valor", e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="0,00"
              />
            </div>
            <div>
              <Label className="text-white">Horário</Label>
              <Select 
                value={formData.horario} 
                onValueChange={(v) => onFormChange("horario", v)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 11 }, (_, i) => {
                    const hour = 8 + i;
                    return [
                      `${hour.toString().padStart(2, '0')}:00`, 
                      `${hour.toString().padStart(2, '0')}:30`
                    ];
                  }).flat().map(time => (
                    <SelectItem key={time} value={time}>{time}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-white">Data</Label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => onFormChange("data", e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="border-slate-600"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onSubmit} 
            className="bg-violet-500 hover:bg-violet-600"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Adicionar
          </Button>
        </div>
      </Card>
    </div>
  );
}
