import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, Loader2, Download, Eye, Sparkles, Printer } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Streamdown } from "streamdown";
import { printEbookAsPDF } from "@/lib/pdfGenerator";
import { CreditGuard, useCredits } from "@/components/CreditGuard";
import { CreditsDisplay } from "@/components/CreditsDisplay";

export default function EbookGenerator() {
  const [topic, setTopic] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [tone, setTone] = useState<"professional" | "casual" | "friendly">(
    "professional"
  );
  const [chapters, setChapters] = useState(5);
  const [generatedEbook, setGeneratedEbook] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  const generateEbook = trpc.content.generateEbook.useMutation();
  const { data: subscription } = trpc.subscription.getSubscription.useQuery();
  const { data: contentList } = trpc.content.listGenerated.useQuery({
    type: "ebook",
    limit: 10,
  });
  
  const { hasCredits, creditsRemaining } = useCredits();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Por favor, digite um tópico para o e-book");
      return;
    }

    // Verificar créditos
    if (!hasCredits(20)) { // E-book custa 20 créditos
      toast.error("Créditos insuficientes. Faça upgrade para gerar e-books.");
      return;
    }

    setGenerating(true);

    try {
      const result = await generateEbook.mutateAsync({
        topic,
        targetAudience: targetAudience || undefined,
        tone,
        chapters,
      });

      setGeneratedEbook(result);
      toast.success("E-book gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar e-book. Tente novamente.");
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedEbook) {
      toast.error("Nenhum e-book para exportar");
      return;
    }

    setDownloadingPDF(true);
    try {
      printEbookAsPDF({
        title: generatedEbook.title || "E-book",
        subtitle: generatedEbook.subtitle,
        description: generatedEbook.description,
        chapters: generatedEbook.chapters || [],
        conclusion: generatedEbook.conclusion,
        callToAction: generatedEbook.callToAction,
      });
      toast.success("PDF aberto para impressão! Use Ctrl+P para salvar como PDF.");
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error("Erro ao gerar PDF. Verifique se popups estão habilitados.");
    } finally {
      setDownloadingPDF(false);
    }
  };

  return (
    <ElevareDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Gerador de E-books</h1>
          </div>
          <p className="text-slate-400">
            Crie e-books profissionais com IA em minutos. Perfeito para lead
            magnets e conteúdo educacional.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800/50 border-slate-700 p-8">
              <h2 className="text-xl font-semibold text-white mb-6">
                Configuração do E-book
              </h2>

              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <Label htmlFor="topic" className="text-white mb-2">
                    Tópico do E-book *
                  </Label>
                  <Input
                    id="topic"
                    placeholder="Ex: Guia Completo de Harmonização Facial"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={generating}
                  />
                </div>

                {/* Target Audience */}
                <div>
                  <Label htmlFor="audience" className="text-white mb-2">
                    Público-alvo (opcional)
                  </Label>
                  <Input
                    id="audience"
                    placeholder="Ex: Profissionais de estética iniciantes"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    disabled={generating}
                  />
                </div>

                {/* Tone */}
                <div>
                  <Label htmlFor="tone" className="text-white mb-2">
                    Tom de Voz
                  </Label>
                  <Select
                    value={tone}
                    onValueChange={(value: any) => setTone(value)}
                    disabled={generating}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Profissional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Amigável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Chapters */}
                <div>
                  <Label htmlFor="chapters" className="text-white mb-2">
                    Número de Capítulos: {chapters}
                  </Label>
                  <input
                    type="range"
                    id="chapters"
                    min="3"
                    max="10"
                    value={chapters}
                    onChange={(e) => setChapters(Number(e.target.value))}
                    className="w-full"
                    disabled={generating}
                  />
                  <div className="flex justify-between text-xs text-slate-500 mt-1">
                    <span>3</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg"
                >
                  {generating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Gerando E-book...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Gerar E-book
                    </>
                  )}
                </Button>

                {!hasCredits(20) && (
                  <p className="text-sm text-amber-400 text-center">
                    ⚠️ Você precisa de 20 créditos para gerar e-books. Créditos atuais: {creditsRemaining}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Recent E-books */}
          <div>
            <Card className="bg-slate-800/50 border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                E-books Recentes
              </h3>
              <div className="space-y-3">
                {contentList && contentList.length > 0 ? (
                  contentList.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                      onClick={() => setGeneratedEbook(item.content)}
                    >
                      <p className="text-white font-medium text-sm truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">
                    Nenhum e-book gerado ainda
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Generated E-book Preview */}
        {generatedEbook && (
          <Card className="bg-slate-800/50 border-slate-700 p-8 mt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {generatedEbook.title}
              </h2>
              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  disabled={downloadingPDF}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {downloadingPDF ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="w-4 h-4 mr-2" />
                  )}
                  {downloadingPDF ? "Gerando..." : "Exportar PDF"}
                </Button>
              </div>
            </div>

            {generatedEbook.subtitle && (
              <p className="text-lg text-slate-400 mb-4">
                {generatedEbook.subtitle}
              </p>
            )}

            {generatedEbook.description && (
              <p className="text-slate-300 mb-8">{generatedEbook.description}</p>
            )}

            {/* Chapters */}
            <div className="space-y-6">
              {generatedEbook.chapters?.map((chapter: any) => (
                <div
                  key={chapter.number}
                  className="p-6 bg-slate-700/30 rounded-lg border border-slate-600"
                >
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Capítulo {chapter.number}: {chapter.title}
                  </h3>
                  <div className="text-slate-300 prose prose-invert max-w-none">
                    <Streamdown>{chapter.content}</Streamdown>
                  </div>
                </div>
              ))}
            </div>

            {/* Conclusion */}
            {generatedEbook.conclusion && (
              <div className="mt-6 p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Conclusão
                </h3>
                <p className="text-slate-300">{generatedEbook.conclusion}</p>
              </div>
            )}

            {/* CTA */}
            {generatedEbook.callToAction && (
              <div className="mt-6 p-6 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Próximos Passos
                </h3>
                <p className="text-slate-300">{generatedEbook.callToAction}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </ElevareDashboardLayout>
  );
}
