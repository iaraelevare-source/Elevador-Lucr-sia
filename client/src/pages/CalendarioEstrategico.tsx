import ElevareDashboardLayout from "@/components/ElevareDashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sparkles,
  Target,
  Heart,
  MessageCircle,
  Crown,
  Plus,
  Trash2,
  Loader2,
  RefreshCw,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

type Post = {
  id: number;
  userId: number;
  contentId: number | null;
  titulo: string;
  tipo: "autoridade" | "desejo" | "fechamento" | "conexao";
  plataforma: string;
  dataAgendada: string;
  horario: string;
  legenda: string | null;
  hashtags: string | null;
  status: "pendente" | "publicado" | "cancelado";
  engajamento: string | null;
  publicadoEm: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

const tipoConfig = {
  autoridade: { 
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30", 
    icon: Crown, 
    label: "Autoridade",
    descricao: "Posiciona você como referência"
  },
  desejo: { 
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30", 
    icon: Heart, 
    label: "Desejo",
    descricao: "Desperta vontade de agendar"
  },
  fechamento: { 
    color: "bg-green-500/20 text-green-400 border-green-500/30", 
    icon: Target, 
    label: "Fechamento",
    descricao: "Converte em agendamento"
  },
  conexao: { 
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30", 
    icon: MessageCircle, 
    label: "Conexão",
    descricao: "Cria relacionamento"
  },
};

export default function CalendarioEstrategico() {
  // ========== TRPC QUERIES & MUTATIONS ==========
  const utils = trpc.useUtils();

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString().split('T')[0];
  });

  const { data: postsData, isLoading, refetch } = trpc.calendar.getWeekPosts.useQuery({
    weekStart: currentWeekStart,
  });

  const createPostMutation = trpc.calendar.createPost.useMutation({
    onSuccess: () => {
      toast.success("Post agendado!");
      utils.calendar.getWeekPosts.invalidate();
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const updatePostMutation = trpc.calendar.updatePost.useMutation({
    onSuccess: () => {
      toast.success("Post atualizado!");
      utils.calendar.getWeekPosts.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const markPublishedMutation = trpc.calendar.markAsPublished.useMutation({
    onSuccess: () => {
      toast.success("Post marcado como publicado! 🎉");
      utils.calendar.getWeekPosts.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const deletePostMutation = trpc.calendar.deletePost.useMutation({
    onSuccess: () => {
      toast.success("Post removido!");
      utils.calendar.getWeekPosts.invalidate();
      setSelectedPost(null);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  const generateSuggestionsMutation = trpc.calendar.generateWeekSuggestions.useMutation({
    onSuccess: () => {
      toast.success("Sugestões geradas com IA! 🤖");
      utils.calendar.getWeekPosts.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao gerar: ${error.message}`);
    },
  });

  // ========== LOCAL STATE ==========
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: "",
    tipo: "conexao" as Post["tipo"],
    dataAgendada: "",
    horario: "19:00",
    legenda: "",
    hashtags: "",
  });

  const posts = postsData?.posts || [];
  const postsByDay = postsData?.postsByDay || {};

  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setCurrentWeekStart(newDate.toISOString().split('T')[0]);
    setSelectedPost(null);
  };

  const getWeekDays = () => {
    const days = [];
    const start = new Date(currentWeekStart);
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const weekDays = getWeekDays();
  const hoje = new Date().toISOString().split('T')[0];

  const resetForm = () => {
    setFormData({
      titulo: "",
      tipo: "conexao",
      dataAgendada: "",
      horario: "19:00",
      legenda: "",
      hashtags: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.dataAgendada) {
      toast.error("Título e data são obrigatórios");
      return;
    }

    createPostMutation.mutate({
      titulo: formData.titulo,
      tipo: formData.tipo,
      dataAgendada: formData.dataAgendada,
      horario: formData.horario,
      legenda: formData.legenda || undefined,
      hashtags: formData.hashtags || undefined,
    });
  };

  const copiarLegenda = (legenda: string, hashtags: string) => {
    navigator.clipboard.writeText(`${legenda}\n\n${hashtags}`);
    toast.success("Legenda copiada! Cole no Instagram.");
  };

  const handleGenerateSuggestions = () => {
    generateSuggestionsMutation.mutate({
      weekStart: currentWeekStart,
      nicho: "estética",
      tom: "profissional",
    });
  };

  if (isLoading) {
    return (
      <ElevareDashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
          <span className="ml-3 text-slate-400">Carregando calendário...</span>
        </div>
      </ElevareDashboardLayout>
    );
  }

  return (
    <ElevareDashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg">
                <CalendarDays className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Calendário de Conteúdo e Vendas</h1>
                <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">PRO</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => refetch()}
                className="border-slate-600"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateSuggestions}
                disabled={generateSuggestionsMutation.isPending}
                className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
              >
                {generateSuggestionsMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                Gerar com IA
              </Button>
              <Button
                onClick={() => {
                  setFormData({ ...formData, dataAgendada: hoje });
                  setShowForm(true);
                }}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Post
              </Button>
            </div>
          </div>
          <p className="text-slate-400 mt-2">
            Sugestões prontas do que postar, quando postar e com que intenção. 
            <span className="text-emerald-400 ml-2">✓ Dados salvos no banco</span>
          </p>
        </div>

        {/* Legenda dos tipos */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {Object.entries(tipoConfig).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <Card key={key} className={`p-3 ${config.color} border`}>
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-semibold text-sm">{config.label}</span>
                </div>
                <p className="text-xs opacity-80 mt-1">{config.descricao}</p>
              </Card>
            );
          })}
        </div>

        {/* Navegação da Semana */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} className="border-slate-600">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Semana Anterior
          </Button>
          <span className="text-white font-medium">
            {weekDays[0].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })} — {weekDays[6].toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} className="border-slate-600">
            Próxima Semana
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Grade Semanal */}
        <div className="grid grid-cols-7 gap-3 mb-8">
          {weekDays.map((day) => {
            const dateStr = day.toISOString().split('T')[0];
            const dayPosts = postsByDay[dateStr] || [];
            const isToday = dateStr === hoje;
            
            return (
              <Card 
                key={dateStr}
                className={`cursor-pointer transition-all p-4 min-h-[160px] ${
                  isToday 
                    ? 'bg-pink-500/10 border-pink-500' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                }`}
              >
                <div className="text-center mb-3">
                  <p className={`text-xs ${isToday ? 'text-pink-400' : 'text-slate-500'}`}>
                    {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </p>
                  <p className={`text-xl font-bold ${isToday ? 'text-white' : 'text-slate-300'}`}>
                    {day.getDate()}
                  </p>
                </div>
                
                {dayPosts.length === 0 ? (
                  <div className="text-center text-slate-500 text-xs">
                    Sem posts
                  </div>
                ) : (
                  <div className="space-y-2">
                    {dayPosts.map((post: Post) => {
                      const TipoIcon = tipoConfig[post.tipo]?.icon || Sparkles;
                      return (
                        <div 
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className={`p-2 rounded-lg ${tipoConfig[post.tipo].color} border cursor-pointer hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <TipoIcon className="w-3 h-3" />
                            <span className="text-xs font-semibold">{tipoConfig[post.tipo].label}</span>
                            {post.status === "publicado" && (
                              <Check className="w-3 h-3 ml-auto" />
                            )}
                          </div>
                          <p className="text-xs line-clamp-2">{post.titulo}</p>
                          <p className="text-xs opacity-70 mt-1">⏰ {post.horario}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Detalhe do Post Selecionado */}
        {selectedPost && (
          <Card className="bg-slate-800/70 border-slate-700 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Badge className={tipoConfig[selectedPost.tipo].color}>
                  {tipoConfig[selectedPost.tipo].label}
                </Badge>
                <h2 className="text-xl font-bold text-white mt-2">{selectedPost.titulo}</h2>
                <p className="text-slate-400 mt-1">{tipoConfig[selectedPost.tipo].descricao}</p>
                {selectedPost.status === "publicado" && (
                  <Badge className="bg-green-500/20 text-green-400 mt-2">✓ Publicado</Badge>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">Melhor horário</p>
                <p className="text-lg font-bold text-pink-400">{selectedPost.horario}</p>
              </div>
            </div>
            
            {selectedPost.legenda && (
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700 mb-4">
                <p className="text-sm text-slate-500 mb-2 font-semibold">📝 LEGENDA PRONTA:</p>
                <p className="text-white whitespace-pre-line text-sm leading-relaxed">
                  {selectedPost.legenda}
                </p>
                {selectedPost.hashtags && (
                  <p className="text-blue-400 text-xs mt-4">
                    {selectedPost.hashtags}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex gap-3">
              {selectedPost.legenda && (
                <Button
                  onClick={() => copiarLegenda(selectedPost.legenda || "", selectedPost.hashtags || "")}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar Legenda
                </Button>
              )}
              
              {selectedPost.status === "pendente" && (
                <Button 
                  variant="outline" 
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  onClick={() => markPublishedMutation.mutate({ id: selectedPost.id })}
                  disabled={markPublishedMutation.isPending}
                >
                  {markPublishedMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Marcar Publicado
                </Button>
              )}
              
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  if (confirm("Remover este post?")) {
                    deletePostMutation.mutate({ id: selectedPost.id });
                  }
                }}
                disabled={deletePostMutation.isPending}
              >
                {deletePostMutation.isPending ? (
                  <Loader2 className="w-4 h-4" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
              
              <Button variant="outline" className="border-slate-600 ml-auto" onClick={() => setSelectedPost(null)}>
                Fechar
              </Button>
            </div>
          </Card>
        )}

        {/* Dica */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 p-4 mt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-white font-semibold">Dica de Ouro</p>
              <p className="text-slate-400 text-sm mt-1">
                Alterne entre posts de <strong>Autoridade</strong>, <strong>Desejo</strong> e <strong>Fechamento</strong>. 
                Não venda o tempo todo — primeiro gere valor, depois converta.
              </p>
            </div>
          </div>
        </Card>

        {/* Add Post Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <Card className="bg-slate-800 border-slate-700 p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-white mb-4">Novo Post</h2>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Título *</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Ex: Antes e Depois com Explicação"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Tipo de Post</Label>
                    <Select value={formData.tipo} onValueChange={(v) => setFormData({...formData, tipo: v as Post["tipo"]})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="autoridade">👑 Autoridade</SelectItem>
                        <SelectItem value="desejo">💖 Desejo</SelectItem>
                        <SelectItem value="fechamento">🎯 Fechamento</SelectItem>
                        <SelectItem value="conexao">💬 Conexão</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Horário</Label>
                    <Select value={formData.horario} onValueChange={(v) => setFormData({...formData, horario: v})}>
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">08:00</SelectItem>
                        <SelectItem value="09:00">09:00</SelectItem>
                        <SelectItem value="10:00">10:00</SelectItem>
                        <SelectItem value="12:00">12:00</SelectItem>
                        <SelectItem value="18:00">18:00</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                        <SelectItem value="20:00">20:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-white">Data *</Label>
                  <Input
                    type="date"
                    value={formData.dataAgendada}
                    onChange={(e) => setFormData({...formData, dataAgendada: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Legenda</Label>
                  <Textarea
                    value={formData.legenda}
                    onChange={(e) => setFormData({...formData, legenda: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white min-h-[120px]"
                    placeholder="Escreva a legenda do post..."
                  />
                </div>

                <div>
                  <Label className="text-white">Hashtags</Label>
                  <Input
                    value={formData.hashtags}
                    onChange={(e) => setFormData({...formData, hashtags: e.target.value})}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="#estetica #beleza #harmonizacao"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-600">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  className="bg-pink-500 hover:bg-pink-600"
                  disabled={createPostMutation.isPending}
                >
                  {createPostMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Agendar Post
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </ElevareDashboardLayout>
  );
}
