import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Film } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/clipboard";
import { useGenerationState } from "@/hooks/useGenerationState";
import { VideoScriptForm } from "@/components/video/VideoScriptForm";
import { GeneratedScriptDisplay } from "@/components/video/GeneratedScriptDisplay";
import { VideoExamplesSection } from "@/components/video/VideoExamplesSection";

export default function VeoCinema() {
  const [procedimento, setProcedimento] = useState("");
  const [estilo, setEstilo] = useState("cinematografico");
  const [duracao, setDuracao] = useState("30");
  const [objetivo, setObjetivo] = useState("autoridade");
  const [detalhes, setDetalhes] = useState("");
  
  const { 
    isGenerating, 
    result: generatedScript, 
    startGeneration, 
    completeGeneration, 
    failGeneration 
  } = useGenerationState<string>();

  const generateMutation = trpc.content.generateContent.useMutation();

  const buildPrompt = () => {
    return `Você é um roteirista especializado em vídeos cinematográficos para clínicas de estética. 
      
Crie um ROTEIRO CINEMATOGRÁFICO completo para um vídeo de ${duracao} segundos sobre o procedimento "${procedimento}".

ESTILO: ${estilo === "cinematografico" ? "Cinematográfico premium (luz suave, movimentos lentos, sofisticado)" : estilo === "dinamico" ? "Dinâmico e moderno (cortes rápidos, energia)" : "Minimalista e elegante (clean, foco no essencial)"}

OBJETIVO: ${objetivo === "autoridade" ? "Transmitir autoridade e expertise técnica" : objetivo === "desejo" ? "Gerar desejo e transformação emocional" : "Mostrar resultados e depoimentos"}

${detalhes ? `DETALHES ADICIONAIS: ${detalhes}` : ""}

O roteiro deve incluir:

📹 **ABERTURA (${Math.round(parseInt(duracao) * 0.2)}s)**
- Gancho visual impactante
- Descrição da cena de abertura
- Música/ambiente sugerido

🎬 **DESENVOLVIMENTO (${Math.round(parseInt(duracao) * 0.5)}s)**
- Sequência de cenas detalhada
- Movimentos de câmera sugeridos
- Pontos de destaque do procedimento
- Texto/narração sugerida

✨ **FECHAMENTO (${Math.round(parseInt(duracao) * 0.3)}s)**
- Call-to-action visual
- Texto de encerramento
- Sugestão de logo/contato

🎨 **DIREÇÃO DE ARTE**
- Paleta de cores sugerida
- Iluminação recomendada
- Props e elementos visuais

📝 **LEGENDAS PARA INSTAGRAM**
- 3 opções de legenda para o post

Seja específico e profissional. O roteiro deve ser executável por uma produtora de vídeo.`;
  };

  const handleGenerate = async () => {
    if (!procedimento.trim()) {
      toast.error("Digite o nome do procedimento");
      return;
    }

    startGeneration();

    try {
      const result = await generateMutation.mutateAsync({
        type: "video_script",
        prompt: buildPrompt(),
      });

      completeGeneration(result.content);
      toast.success("Roteiro gerado com sucesso!");
    } catch (error: any) {
      failGeneration(error.message || "Erro ao gerar roteiro");
      toast.error(error.message || "Erro ao gerar roteiro");
    }
  };

  const handleCopy = () => {
    if (generatedScript) {
      copyToClipboard(generatedScript);
    }
  };

  return (
    <ElevareDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-rose-500 to-pink-600 rounded-lg">
              <Film className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Veo Cinema</h1>
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>
            </div>
          </div>
          <p className="text-slate-400">
            Crie roteiros cinematográficos profissionais para seus procedimentos.
            Vídeos que elevam o valor percebido do seu trabalho.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form */}
          <VideoScriptForm
            procedimento={procedimento}
            estilo={estilo}
            duracao={duracao}
            objetivo={objetivo}
            detalhes={detalhes}
            generating={isGenerating}
            onProcedimentoChange={setProcedimento}
            onEstiloChange={setEstilo}
            onDuracaoChange={setDuracao}
            onObjetivoChange={setObjetivo}
            onDetalhesChange={setDetalhes}
            onGenerate={handleGenerate}
          />

          {/* Result */}
          <GeneratedScriptDisplay
            script={generatedScript}
            onCopy={handleCopy}
          />
        </div>

        {/* Examples */}
        <VideoExamplesSection />
      </div>
    </ElevareDashboardLayout>
  );
}
