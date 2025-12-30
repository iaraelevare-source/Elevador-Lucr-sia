import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Zap, AlertCircle, CheckCircle, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { toast } from "sonner";

interface DiagnosisResult {
  diagnosisId: number;
  score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  nextSteps: string;
}

export default function RadarBio() {
  const [instagramHandle, setInstagramHandle] = useState("");
  const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Lead capture form state
  const [leadEmail, setLeadEmail] = useState("");
  const [leadWhatsapp, setLeadWhatsapp] = useState("");
  const [leadCaptured, setLeadCaptured] = useState(false);

  const analyzeMutation = trpc.bioRadar.analyze.useMutation();
  const saveLeadMutation = trpc.bioRadar.saveLead.useMutation();

  const handleAnalyze = async () => {
    if (!instagramHandle.trim()) {
      setError("Por favor, digite seu @ do Instagram");
      return;
    }

    setError(null);
    setDiagnosis(null);
    setLeadCaptured(false);
    setLeadEmail("");
    setLeadWhatsapp("");

    try {
      const result = await analyzeMutation.mutateAsync({
        instagramHandle: instagramHandle.replace("@", ""),
      });

      setDiagnosis(result as DiagnosisResult);
      toast.success("Análise concluída!");
    } catch (err) {
      setError("Erro ao analisar bio. Tente novamente.");
      toast.error("Erro ao analisar bio");
      console.error(err);
    }
  };

  const handleCaptureLead = async () => {
    if (!leadEmail.trim() && !leadWhatsapp.trim()) {
      toast.error("Por favor, preencha pelo menos um campo (email ou WhatsApp)");
      return;
    }

    // Validar email se preenchido
    if (leadEmail.trim() && !leadEmail.includes("@")) {
      toast.error("Por favor, digite um email válido");
      return;
    }

    // Validar WhatsApp se preenchido (apenas números)
    if (leadWhatsapp.trim() && !/^\d{10,15}$/.test(leadWhatsapp.replace(/\D/g, ""))) {
      toast.error("Por favor, digite um WhatsApp válido (10-15 dígitos)");
      return;
    }

    if (!diagnosis?.diagnosisId) {
      toast.error("Erro: diagnóstico não encontrado");
      return;
    }

    try {
      await saveLeadMutation.mutateAsync({
        diagnosisId: diagnosis.diagnosisId,
        email: leadEmail || undefined,
        whatsapp: leadWhatsapp || undefined,
      });

      setLeadCaptured(true);
      toast.success("Diagnóstico enviado! Você receberá em breve.");
      
      // Reset form
      setTimeout(() => {
        setLeadEmail("");
        setLeadWhatsapp("");
        setDiagnosis(null);
        setInstagramHandle("");
        setLeadCaptured(false);
      }, 3000);
    } catch (err) {
      toast.error("Erro ao capturar lead. Tente novamente.");
      console.error(err);
    }
  };

  return (
    <ElevareDashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Radar de Bio</h1>
          </div>
          <p className="text-slate-400">
            Analise sua bio do Instagram com IA e receba recomendações
            personalizadas para aumentar conversões
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-slate-800/50 border-slate-700 p-8 mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Seu @ do Instagram
              </label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-3 text-slate-400">@</span>
                  <Input
                    type="text"
                    placeholder="seu_usuario"
                    value={instagramHandle}
                    onChange={(e) => {
                      setInstagramHandle(e.target.value);
                      setError(null);
                    }}
                    className="pl-8 bg-slate-700 border-slate-600 text-white placeholder-slate-500"
                    disabled={analyzeMutation.isPending || diagnosis !== null}
                  />
                </div>
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzeMutation.isPending || diagnosis !== null}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8"
                >
                  {analyzeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Analisar
                    </>
                  )}
                </Button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {diagnosis && (
          <div className="space-y-6">
            {/* Score Card */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 mb-2">Pontuação da Bio</p>
                  <p className="text-5xl font-bold text-white">{diagnosis.score}/100</p>
                </div>
                <div className="text-right">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-white font-bold text-3xl">
                        {diagnosis.score}%
                      </p>
                      <p className="text-amber-100 text-xs mt-1">Otimizada</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Strengths */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-white">
                  Pontos Fortes
                </h3>
              </div>
              <div className="space-y-3">
                {diagnosis.strengths.map((strength, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-200">{strength}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Weaknesses */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-white">
                  Pontos a Melhorar
                </h3>
              </div>
              <div className="space-y-3">
                {diagnosis.weaknesses.map((weakness, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-200">{weakness}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recomendações Personalizadas
              </h3>
              <div className="space-y-3">
                {diagnosis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-200">{rec}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Next Steps */}
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Próximos Passos
              </h3>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <Streamdown>{diagnosis.nextSteps}</Streamdown>
              </div>
            </Card>

            {/* Lead Capture Form */}
            {!leadCaptured && (
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Receba Seu Diagnóstico Completo
                  </h3>
                  <p className="text-slate-300">
                    Deixe seu email ou WhatsApp para receber o diagnóstico
                    detalhado e começar seu teste grátis de 5 dias
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saveLeadMutation.isPending}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      <MessageCircle className="w-4 h-4 inline mr-2" />
                      WhatsApp
                    </label>
                    <Input
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={leadWhatsapp}
                      onChange={(e) => setLeadWhatsapp(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={saveLeadMutation.isPending}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleCaptureLead}
                  disabled={saveLeadMutation.isPending}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-6 text-lg"
                >
                  {saveLeadMutation.isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Receber Diagnóstico Completo
                    </>
                  )}
                </Button>

                <p className="text-xs text-slate-400 text-center mt-4">
                  🎁 Ao se cadastrar, você ganha 5 dias de teste grátis do plano
                  PRO
                </p>
              </Card>
            )}

            {leadCaptured && (
              <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30 p-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Diagnóstico Enviado!
                  </h3>
                  <p className="text-slate-300">
                    Você receberá o diagnóstico completo em breve. Prepare-se
                    para transformar sua bio!
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </ElevareDashboardLayout>
  );
}
