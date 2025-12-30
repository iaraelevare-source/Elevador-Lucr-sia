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
  Target,
  Loader2,
  Copy,
  DollarSign,
  Users,
  TrendingUp,
  Megaphone,
  BarChart3,
  Lightbulb,
  CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdsManager() {
  // Campaign Planner State
  const [objetivo, setObjetivo] = useState("agendamentos");
  const [orcamento, setOrcamento] = useState("");
  const [publico, setPublico] = useState("");
  const [procedimentos, setProcedimentos] = useState("");
  const [diferenciais, setDiferenciais] = useState("");
  
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  // Ad Creator State
  const [adProcedimento, setAdProcedimento] = useState("");
  const [adPlataforma, setAdPlataforma] = useState("instagram");
  const [adTom, setAdTom] = useState("premium");
  const [generatedAd, setGeneratedAd] = useState<string | null>(null);
  const [generatingAd, setGeneratingAd] = useState(false);

  const generateMutation = trpc.content.generateContent.useMutation();

  const handleGeneratePlan = async () => {
    if (!orcamento.trim() || !procedimentos.trim()) {
      toast.error("Preencha orçamento e procedimentos");
      return;
    }

    setGenerating(true);
    setGeneratedPlan(null);

    try {
      const prompt = `Você é um estrategista de tráfego pago especializado em clínicas de estética. 

Crie um PLANO DE CAMPANHAS completo para uma clínica de estética com as seguintes informações:

📊 **DADOS DA CLÍNICA**
- Orçamento mensal: R$ ${orcamento}
- Objetivo principal: ${objetivo === "agendamentos" ? "Gerar agendamentos" : objetivo === "reconhecimento" ? "Aumentar reconhecimento de marca" : "Captar leads para WhatsApp"}
- Principais procedimentos: ${procedimentos}
- Público-alvo: ${publico || "Mulheres 25-55 anos, classe A/B"}
- Diferenciais: ${diferenciais || "Não informado"}

O plano deve incluir:

📅 **CALENDÁRIO DE CAMPANHAS (30 dias)**
- Semana 1: Campanha de aquecimento
- Semana 2-3: Campanhas principais
- Semana 4: Remarketing e otimização

💰 **DISTRIBUIÇÃO DE ORÇAMENTO**
- % para cada tipo de campanha
- Valores diários sugeridos
- Reserva para testes

🎯 **ESTRUTURA DE CAMPANHAS**
Para cada campanha sugerida:
- Nome da campanha
- Objetivo de anúncio
- Público-alvo detalhado
- Criativos sugeridos (imagem/vídeo)
- Copy principal
- CTA

📈 **MÉTRICAS DE SUCESSO**
- KPIs esperados
- CPM/CPC médio do setor
- Taxa de conversão esperada
- ROI projetado

⚠️ **ALERTAS E DICAS**
- Erros comuns a evitar
- Melhores horários de publicação
- Dicas de otimização

Seja específico e prático. O plano deve ser executável por alguém sem experiência avançada em tráfego pago.`;

      const result = await generateMutation.mutateAsync({
        type: "ads_plan",
        prompt,
      });

      setGeneratedPlan(result.content);
      toast.success("Plano gerado com sucesso!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar plano");
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!adProcedimento.trim()) {
      toast.error("Digite o procedimento");
      return;
    }

    setGeneratingAd(true);
    setGeneratedAd(null);

    try {
      const prompt = `Crie um anúncio completo para ${adPlataforma === "instagram" ? "Instagram/Facebook Ads" : adPlataforma === "google" ? "Google Ads" : "TikTok Ads"} sobre o procedimento "${adProcedimento}".

TOM: ${adTom === "premium" ? "Premium e sofisticado" : adTom === "acessivel" ? "Acessível e acolhedor" : "Urgente e promocional"}

Inclua:
1. 🎯 HEADLINE PRINCIPAL (máx 40 caracteres)
2. 📝 TEXTO PRIMÁRIO (150-200 caracteres)
3. 💬 DESCRIÇÃO (máx 90 caracteres)
4. 🔘 CTA SUGERIDO
5. 🖼️ DESCRIÇÃO DO CRIATIVO (o que mostrar na imagem/vídeo)
6. 🎨 3 VARIAÇÕES de headline para teste A/B
7. 👥 PÚBLICO SUGERIDO (interesses e demographics)
8. 💡 DICA DE OTIMIZAÇÃO`;

      const result = await generateMutation.mutateAsync({
        type: "ad",
        prompt,
      });

      setGeneratedAd(result.content);
      toast.success("Anúncio gerado!");
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar anúncio");
    } finally {
      setGeneratingAd(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  return (
    <ElevareDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Ads Manager Inteligente</h1>
              <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>
            </div>
          </div>
          <p className="text-slate-400">
            Planeje campanhas de tráfego pago focadas em pacientes premium.
            Invista melhor, não aposte no escuro.
          </p>
        </div>

        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700 mb-6">
            <TabsTrigger value="planner" className="data-[state=active]:bg-blue-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Planejador de Campanhas
            </TabsTrigger>
            <TabsTrigger value="creator" className="data-[state=active]:bg-cyan-500">
              <Megaphone className="w-4 h-4 mr-2" />
              Criador de Anúncios
            </TabsTrigger>
          </TabsList>

          {/* Campaign Planner Tab */}
          <TabsContent value="planner">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Dados da Campanha
                </h2>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Orçamento Mensal *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="500"
                          value={orcamento}
                          onChange={(e) => setOrcamento(e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white pl-9"
                          disabled={generating}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Objetivo Principal</Label>
                      <Select value={objetivo} onValueChange={setObjetivo} disabled={generating}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendamentos">📅 Gerar Agendamentos</SelectItem>
                          <SelectItem value="reconhecimento">🎯 Reconhecimento de Marca</SelectItem>
                          <SelectItem value="leads">💬 Captar Leads (WhatsApp)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Procedimentos Principais *</Label>
                    <Textarea
                      placeholder="Ex: Harmonização Facial, Limpeza de Pele, Peeling de Diamante..."
                      value={procedimentos}
                      onChange={(e) => setProcedimentos(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generating}
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Público-Alvo</Label>
                    <Input
                      placeholder="Ex: Mulheres 25-45 anos, classe A/B, região X"
                      value={publico}
                      onChange={(e) => setPublico(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generating}
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-2 block">Diferenciais da Clínica</Label>
                    <Input
                      placeholder="Ex: Única com aparelho X, 10 anos de experiência..."
                      value={diferenciais}
                      onChange={(e) => setDiferenciais(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generating}
                    />
                  </div>

                  <Button
                    onClick={handleGeneratePlan}
                    disabled={generating || !orcamento.trim() || !procedimentos.trim()}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Criando Plano...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-5 h-5 mr-2" />
                        Gerar Plano de Campanhas
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Result */}
              <div>
                {generatedPlan ? (
                  <Card className="bg-slate-800/50 border-slate-700 p-6 max-h-[600px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-slate-800/90 py-2">
                      <h3 className="text-xl font-semibold text-white">Plano de Campanhas</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedPlan)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <Streamdown>{generatedPlan}</Streamdown>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/30 border-slate-700 border-dashed p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <BarChart3 className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      Plano aparecerá aqui
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Preencha os dados e gere um plano estratégico de campanhas
                      personalizado para sua clínica
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Ad Creator Tab */}
          <TabsContent value="creator">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-cyan-400" />
                  Criar Anúncio
                </h2>

                <div className="space-y-5">
                  <div>
                    <Label className="text-white mb-2 block">Procedimento / Oferta *</Label>
                    <Input
                      placeholder="Ex: Harmonização Facial, Limpeza de Pele..."
                      value={adProcedimento}
                      onChange={(e) => setAdProcedimento(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generatingAd}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white mb-2 block">Plataforma</Label>
                      <Select value={adPlataforma} onValueChange={setAdPlataforma} disabled={generatingAd}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instagram">📸 Instagram/Facebook</SelectItem>
                          <SelectItem value="google">🔍 Google Ads</SelectItem>
                          <SelectItem value="tiktok">🎵 TikTok Ads</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white mb-2 block">Tom da Comunicação</Label>
                      <Select value={adTom} onValueChange={setAdTom} disabled={generatingAd}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="premium">✨ Premium</SelectItem>
                          <SelectItem value="acessivel">💜 Acessível</SelectItem>
                          <SelectItem value="urgente">🔥 Urgente/Promo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateAd}
                    disabled={generatingAd || !adProcedimento.trim()}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-6"
                  >
                    {generatingAd ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-5 h-5 mr-2" />
                        Gerar Anúncio
                      </>
                    )}
                  </Button>
                </div>

                {/* Quick Tips */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Dicas Rápidas
                  </h4>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Use imagens de alta qualidade (antes/depois)</li>
                    <li>• Inclua depoimentos reais de clientes</li>
                    <li>• Teste 3 variações de copy</li>
                    <li>• Comece com orçamento de teste pequeno</li>
                  </ul>
                </div>
              </Card>

              {/* Result */}
              <div>
                {generatedAd ? (
                  <Card className="bg-slate-800/50 border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-white">Anúncio Gerado</h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedAd)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <Streamdown>{generatedAd}</Streamdown>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/30 border-slate-700 border-dashed p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                    <Megaphone className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-400 mb-2">
                      Anúncio aparecerá aqui
                    </h3>
                    <p className="text-slate-500 max-w-sm">
                      Selecione as opções e gere anúncios otimizados
                      para suas campanhas de tráfego pago
                    </p>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ElevareDashboardLayout>
  );
}
