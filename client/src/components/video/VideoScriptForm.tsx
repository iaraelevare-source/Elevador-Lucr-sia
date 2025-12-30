import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Video, Loader2, Clapperboard } from "lucide-react";

type VideoScriptFormProps = {
  procedimento: string;
  estilo: string;
  duracao: string;
  objetivo: string;
  detalhes: string;
  generating: boolean;
  onProcedimentoChange: (value: string) => void;
  onEstiloChange: (value: string) => void;
  onDuracaoChange: (value: string) => void;
  onObjetivoChange: (value: string) => void;
  onDetalhesChange: (value: string) => void;
  onGenerate: () => void;
};

export function VideoScriptForm({
  procedimento,
  estilo,
  duracao,
  objetivo,
  detalhes,
  generating,
  onProcedimentoChange,
  onEstiloChange,
  onDuracaoChange,
  onObjetivoChange,
  onDetalhesChange,
  onGenerate,
}: VideoScriptFormProps) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Clapperboard className="w-5 h-5 text-rose-400" />
        Configurar Roteiro
      </h2>

      <div className="space-y-5">
        <div>
          <Label htmlFor="procedimento" className="text-white mb-2 block">
            Procedimento / Tratamento *
          </Label>
          <Input
            id="procedimento"
            placeholder="Ex: Harmonização Facial, Limpeza de Pele, Peeling..."
            value={procedimento}
            onChange={(e) => onProcedimentoChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white"
            disabled={generating}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-white mb-2 block">Estilo Visual</Label>
            <Select value={estilo} onValueChange={onEstiloChange} disabled={generating}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cinematografico">🎬 Cinematográfico Premium</SelectItem>
                <SelectItem value="dinamico">⚡ Dinâmico e Moderno</SelectItem>
                <SelectItem value="minimalista">✨ Minimalista Elegante</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white mb-2 block">Duração</Label>
            <Select value={duracao} onValueChange={onDuracaoChange} disabled={generating}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 segundos (Story)</SelectItem>
                <SelectItem value="30">30 segundos (Reels)</SelectItem>
                <SelectItem value="60">60 segundos (Reels longo)</SelectItem>
                <SelectItem value="90">90 segundos (YouTube Shorts)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-white mb-2 block">Objetivo do Vídeo</Label>
          <Select value={objetivo} onValueChange={onObjetivoChange} disabled={generating}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="autoridade">🎓 Transmitir Autoridade</SelectItem>
              <SelectItem value="desejo">💫 Gerar Desejo</SelectItem>
              <SelectItem value="resultados">📊 Mostrar Resultados</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="detalhes" className="text-white mb-2 block">
            Detalhes Adicionais (opcional)
          </Label>
          <Textarea
            id="detalhes"
            placeholder="Ex: Foco no antes/depois, mostrar equipamentos, incluir depoimento..."
            value={detalhes}
            onChange={(e) => onDetalhesChange(e.target.value)}
            className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
            disabled={generating}
          />
        </div>

        <Button
          onClick={onGenerate}
          disabled={generating || !procedimento.trim()}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-6"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Criando Roteiro...
            </>
          ) : (
            <>
              <Video className="w-5 h-5 mr-2" />
              Gerar Roteiro Cinematográfico
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
