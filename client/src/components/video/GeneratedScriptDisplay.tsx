import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Copy, Film } from "lucide-react";
import { Streamdown } from "streamdown";

type GeneratedScriptDisplayProps = {
  script: string | null;
  onCopy: () => void;
};

export function GeneratedScriptDisplay({
  script,
  onCopy,
}: GeneratedScriptDisplayProps) {
  if (!script) {
    return (
      <Card className="bg-slate-800/30 border-slate-700 border-dashed p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <Film className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-slate-400 mb-2">
          Roteiro aparecerá aqui
        </h3>
        <p className="text-slate-500 max-w-sm">
          Preencha os dados e clique em gerar para criar um roteiro
          cinematográfico profissional para seus procedimentos
        </p>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          <Play className="w-5 h-5 text-rose-400" />
          Roteiro Gerado
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar
        </Button>
      </div>
      
      <div className="prose prose-invert max-w-none">
        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <Streamdown>{script}</Streamdown>
        </div>
      </div>

      <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg">
        <p className="text-rose-300 text-sm">
          💡 <strong>Dica:</strong> Envie este roteiro para sua produtora de vídeo 
          ou use como guia para gravar você mesma com o celular.
        </p>
      </div>
    </Card>
  );
}
