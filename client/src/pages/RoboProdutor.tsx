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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  Loader2,
  Copy,
  Image as ImageIcon,
  Megaphone,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function RoboProdutor() {
  // Prompt Generator State
  const [promptDescription, setPromptDescription] = useState("");
  const [promptStyle, setPromptStyle] = useState<
    "realistic" | "artistic" | "minimalist" | "professional" | "creative"
  >("professional");
  const [promptPlatform, setPromptPlatform] = useState<
    "midjourney" | "dalle" | "stable-diffusion"
  >("dalle");
  const [generatedPrompt, setGeneratedPrompt] = useState<any>(null);
  const [generatingPrompt, setGeneratingPrompt] = useState(false);

  // Ad Generator State
  const [adProduct, setAdProduct] = useState("");
  const [adPlatform, setAdPlatform] = useState<
    "instagram" | "facebook" | "google"
  >("instagram");
  const [adObjective, setAdObjective] = useState<
    "awareness" | "consideration" | "conversion"
  >("conversion");
  const [adAudience, setAdAudience] = useState("");
  const [generatedAd, setGeneratedAd] = useState<any>(null);
  const [generatingAd, setGeneratingAd] = useState(false);

  const generatePromptMutation = trpc.content.generatePrompt.useMutation();
  const generateAdMutation = trpc.content.generateAd.useMutation();
  const { data: subscription } = trpc.subscription.getSubscription.useQuery();

  const handleGeneratePrompt = async () => {
    if (!promptDescription.trim()) {
      toast.error("Por favor, descreva a imagem que deseja gerar");
      return;
    }

    if (subscription && subscription.plan === "free") {
      toast.error("Upgrade para PRO para gerar prompts");
      return;
    }

    setGeneratingPrompt(true);

    try {
      const result = await generatePromptMutation.mutateAsync({
        description: promptDescription,
        style: promptStyle,
        platform: promptPlatform,
      });

      setGeneratedPrompt(result);
      toast.success("Prompt gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar prompt. Tente novamente.");
      console.error(error);
    } finally {
      setGeneratingPrompt(false);
    }
  };

  const handleGenerateAd = async () => {
    if (!adProduct.trim()) {
      toast.error("Por favor, descreva o produto/serviço");
      return;
    }

    if (subscription && subscription.plan === "free") {
      toast.error("Upgrade para PRO para gerar anúncios");
      return;
    }

    setGeneratingAd(true);

    try {
      const result = await generateAdMutation.mutateAsync({
        product: adProduct,
        platform: adPlatform,
        objective: adObjective,
        targetAudience: adAudience || undefined,
      });

      setGeneratedAd(result);
      toast.success("Anúncio gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar anúncio. Tente novamente.");
      console.error(error);
    } finally {
      setGeneratingAd(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência!");
  };

  return (
    <ElevareDashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Robô Produtor</h1>
          </div>
          <p className="text-slate-400">
            Gere prompts otimizados e anúncios de alta conversão com IA baseada
            em neurovendas
          </p>
        </div>

        <Tabs defaultValue="prompts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 border border-slate-700">
            <TabsTrigger value="prompts" className="data-[state=active]:bg-purple-500">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gerador de Prompts
            </TabsTrigger>
            <TabsTrigger value="ads" className="data-[state=active]:bg-pink-500">
              <Megaphone className="w-4 h-4 mr-2" />
              Gerador de Anúncios
            </TabsTrigger>
          </TabsList>

          {/* Prompt Generator Tab */}
          <TabsContent value="prompts" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card className="bg-slate-800/50 border-slate-700 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Configuração do Prompt
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="prompt-desc" className="text-white mb-2">
                      Descreva a imagem que deseja *
                    </Label>
                    <Textarea
                      id="prompt-desc"
                      placeholder="Ex: Uma clínica de estética moderna com ambiente luxuoso e acolhedor"
                      value={promptDescription}
                      onChange={(e) => setPromptDescription(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                      disabled={generatingPrompt}
                    />
                  </div>

                  <div>
                    <Label htmlFor="prompt-style" className="text-white mb-2">
                      Estilo
                    </Label>
                    <Select
                      value={promptStyle}
                      onValueChange={(value: any) => setPromptStyle(value)}
                      disabled={generatingPrompt}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realista</SelectItem>
                        <SelectItem value="artistic">Artístico</SelectItem>
                        <SelectItem value="minimalist">Minimalista</SelectItem>
                        <SelectItem value="professional">
                          Profissional
                        </SelectItem>
                        <SelectItem value="creative">Criativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="prompt-platform" className="text-white mb-2">
                      Plataforma
                    </Label>
                    <Select
                      value={promptPlatform}
                      onValueChange={(value: any) => setPromptPlatform(value)}
                      disabled={generatingPrompt}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dalle">DALL-E</SelectItem>
                        <SelectItem value="midjourney">Midjourney</SelectItem>
                        <SelectItem value="stable-diffusion">
                          Stable Diffusion
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleGeneratePrompt}
                    disabled={generatingPrompt || !promptDescription.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6"
                  >
                    {generatingPrompt ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Gerando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Gerar Prompt
                      </>
                    )}
                  </Button>
                </div>
              </Card>

              {/* Result */}
              <div>
                {generatedPrompt ? (
                  <Card className="bg-slate-800/50 border-slate-700 p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Prompt Otimizado
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white">Prompt Principal</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(generatedPrompt.prompt)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <p className="text-slate-200 text-sm">
                            {generatedPrompt.prompt}
                          </p>
                        </div>
                      </div>

                      {generatedPrompt.negativePrompt && (
                        <div>
                          <Label className="text-white mb-2">
                            Prompt Negativo
                          </Label>
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <p className="text-slate-200 text-sm">
                              {generatedPrompt.negativePrompt}
                            </p>
                          </div>
                        </div>
                      )}

                      {generatedPrompt.suggestions && (
                        <div>
                          <Label className="text-white mb-2">Variações</Label>
                          <div className="space-y-2">
                            {generatedPrompt.suggestions.map(
                              (suggestion: string, idx: number) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-slate-700/50 rounded-lg border border-slate-600 text-sm text-slate-300"
                                >
                                  {suggestion}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}

                      {generatedPrompt.tips && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <p className="text-sm text-purple-200">
                            💡 {generatedPrompt.tips}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700 p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">
                        Seu prompt otimizado aparecerá aqui
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Ad Generator Tab */}
          <TabsContent value="ads" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card className="bg-slate-800/50 border-slate-700 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Configuração do Anúncio
                </h2>

                <div className="space-y-6">
                  <div>
                    <Label htmlFor="ad-product" className="text-white mb-2">
                      Produto/Serviço *
                    </Label>
                    <Input
                      id="ad-product"
                      placeholder="Ex: Harmonização Facial com Ácido Hialurônico"
                      value={adProduct}
                      onChange={(e) => setAdProduct(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generatingAd}
                    />
                  </div>

                  <div>
                    <Label htmlFor="ad-platform" className="text-white mb-2">
                      Plataforma
                    </Label>
                    <Select
                      value={adPlatform}
                      onValueChange={(value: any) => setAdPlatform(value)}
                      disabled={generatingAd}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                        <SelectItem value="google">Google Ads</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ad-objective" className="text-white mb-2">
                      Objetivo
                    </Label>
                    <Select
                      value={adObjective}
                      onValueChange={(value: any) => setAdObjective(value)}
                      disabled={generatingAd}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="awareness">
                          Reconhecimento
                        </SelectItem>
                        <SelectItem value="consideration">
                          Consideração
                        </SelectItem>
                        <SelectItem value="conversion">Conversão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="ad-audience" className="text-white mb-2">
                      Público-alvo (opcional)
                    </Label>
                    <Input
                      id="ad-audience"
                      placeholder="Ex: Mulheres 25-45 anos, classe A/B"
                      value={adAudience}
                      onChange={(e) => setAdAudience(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white"
                      disabled={generatingAd}
                    />
                  </div>

                  <Button
                    onClick={handleGenerateAd}
                    disabled={generatingAd || !adProduct.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6"
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
              </Card>

              {/* Result */}
              <div>
                {generatedAd ? (
                  <Card className="bg-slate-800/50 border-slate-700 p-8">
                    <h3 className="text-xl font-semibold text-white mb-6">
                      Anúncio Gerado
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white">Título</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(generatedAd.headline)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <p className="text-slate-200 font-semibold">
                            {generatedAd.headline}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white">Texto Principal</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              copyToClipboard(generatedAd.primaryText)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <p className="text-slate-200 text-sm">
                            {generatedAd.primaryText}
                          </p>
                        </div>
                      </div>

                      {generatedAd.description && (
                        <div>
                          <Label className="text-white mb-2">Descrição</Label>
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <p className="text-slate-200 text-sm">
                              {generatedAd.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {generatedAd.callToAction && (
                        <div>
                          <Label className="text-white mb-2">
                            Call-to-Action
                          </Label>
                          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                            <p className="text-green-200 font-semibold">
                              {generatedAd.callToAction}
                            </p>
                          </div>
                        </div>
                      )}

                      {generatedAd.hashtags && (
                        <div>
                          <Label className="text-white mb-2">Hashtags</Label>
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <p className="text-blue-400 text-sm">
                              {generatedAd.hashtags.join(" ")}
                            </p>
                          </div>
                        </div>
                      )}

                      {generatedAd.tips && (
                        <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                          <p className="text-sm text-pink-200">
                            💡 {generatedAd.tips}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ) : (
                  <Card className="bg-slate-800/50 border-slate-700 p-8 h-full flex items-center justify-center">
                    <div className="text-center">
                      <Megaphone className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">
                        Seu anúncio otimizado aparecerá aqui
                      </p>
                    </div>
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
