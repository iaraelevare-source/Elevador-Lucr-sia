/**
 * 🎯 PREMIUM QUIZ - EXPERIÊNCIA VISUAL DE AUTORIDADE
 * 
 * Características:
 * - Uma pergunta por tela com transições suaves
 * - Barra de progresso minimalista (h-1)
 * - Tipografia serifada para autoridade
 * - Ícones técnicos lucide-react (sem emojis)
 * - AnimatePresence para transições elegantes
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { 
  QuizQuestion, 
  PERGUNTAS_CONSCIENCIA,
  PERGUNTAS_MATURIDADE,
  PERGUNTAS_FINANCEIRO,
  PERGUNTAS_POSICIONAMENTO,
} from "@/data/quizData";

// ============================================
// TIPOS
// ============================================
interface PremiumQuizProps {
  nivel: "consciencia" | "maturidade" | "financeiro" | "posicionamento" | "completo";
  onComplete: (respostas: Record<string, number>, pontuacao: number) => void;
  onBack?: () => void;
}

// ============================================
// CONFIGURAÇÃO POR NÍVEL
// ============================================
const NIVEL_CONFIG = {
  consciencia: {
    perguntas: PERGUNTAS_CONSCIENCIA,
    titulo: "Consciência de Negócio",
    subtitulo: "Entenda sua relação com a clínica",
    icone: Target,
  },
  maturidade: {
    perguntas: PERGUNTAS_MATURIDADE,
    titulo: "Maturidade de Gestão",
    subtitulo: "Avalie sua estrutura operacional",
    icone: TrendingUp,
  },
  financeiro: {
    perguntas: PERGUNTAS_FINANCEIRO,
    titulo: "Diagnóstico Financeiro",
    subtitulo: "Descubra seus vazamentos invisíveis",
    icone: Sparkles,
  },
  posicionamento: {
    perguntas: PERGUNTAS_POSICIONAMENTO,
    titulo: "Posicionamento Digital",
    subtitulo: "Analise sua presença estratégica",
    icone: Target,
  },
  completo: {
    perguntas: [
      ...PERGUNTAS_CONSCIENCIA,
      ...PERGUNTAS_MATURIDADE,
      ...PERGUNTAS_FINANCEIRO,
      ...PERGUNTAS_POSICIONAMENTO,
    ],
    titulo: "Diagnóstico Completo",
    subtitulo: "Análise profunda do seu negócio",
    icone: Sparkles,
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function PremiumQuiz({ nivel, onComplete, onBack }: PremiumQuizProps) {
  const config = NIVEL_CONFIG[nivel];
  const perguntas = config.perguntas;
  const Icone = config.icone;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, number>>({});
  const [direction, setDirection] = useState(1); // 1 = próximo, -1 = anterior

  const perguntaAtual = perguntas[currentIndex];
  const progresso = ((currentIndex + 1) / perguntas.length) * 100;
  const isUltima = currentIndex === perguntas.length - 1;

  // Handler de resposta
  const handleResposta = useCallback((valor: number) => {
    const novasRespostas = {
      ...respostas,
      [perguntaAtual.id]: valor,
    };
    setRespostas(novasRespostas);

    // Auto-avançar após pequeno delay
    setTimeout(() => {
      if (isUltima) {
        const pontuacao = Object.values(novasRespostas).reduce((a, b) => a + b, 0);
        onComplete(novasRespostas, pontuacao);
      } else {
        setDirection(1);
        setCurrentIndex(prev => prev + 1);
      }
    }, 300);
  }, [respostas, perguntaAtual, isUltima, onComplete]);

  // Handler de voltar
  const handleVoltar = useCallback(() => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    } else if (onBack) {
      onBack();
    }
  }, [currentIndex, onBack]);

  // Variantes de animação
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -300 : 300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Header com progresso */}
      <header className="sticky top-0 z-10 bg-[#faf9f7]/95 backdrop-blur-sm border-b border-gray-100">
        {/* Barra de Progresso Fina */}
        <div className="h-1 bg-gray-100">
          <motion.div
            className="h-full bg-[#6b2fa8]"
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>

        {/* Info do Quiz */}
        <div className="px-6 py-4 flex items-center justify-between">
          <button
            onClick={handleVoltar}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Voltar</span>
          </button>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Icone className="w-4 h-4" />
            <span>{currentIndex + 1} de {perguntas.length}</span>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={perguntaAtual.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="space-y-8"
            >
              {/* Microcopy de Autoridade */}
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-sm text-[#6b2fa8] font-medium tracking-wide uppercase"
              >
                {perguntaAtual.microcopy}
              </motion.p>

              {/* Pergunta com Tipografia Serifada */}
              <h2 className="font-serif text-2xl md:text-3xl text-[#2d2d2d] leading-relaxed">
                {perguntaAtual.pergunta}
              </h2>

              {/* Opções de Resposta */}
              <div className="space-y-3 pt-4">
                {perguntaAtual.opcoes.map((opcao, index) => {
                  const isSelected = respostas[perguntaAtual.id] === opcao.valor;
                  
                  return (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 1) }}
                      onClick={() => handleResposta(opcao.valor)}
                      className={`
                        w-full p-5 rounded-xl text-left transition-all duration-200
                        border-2 group
                        ${isSelected 
                          ? "border-[#6b2fa8] bg-[#6b2fa8]/5" 
                          : "border-gray-200 hover:border-gray-300 bg-white"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`
                          text-base leading-relaxed
                          ${isSelected ? "text-[#6b2fa8]" : "text-[#2d2d2d]"}
                        `}>
                          {opcao.texto}
                        </span>
                        
                        <ChevronRight className={`
                          w-5 h-5 transition-all
                          ${isSelected 
                            ? "text-[#6b2fa8] translate-x-0 opacity-100" 
                            : "text-gray-300 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                          }
                        `} />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Minimalista */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          LucresIA — Diagnóstico Estratégico para Clínicas de Estética
        </p>
      </footer>
    </div>
  );
}

export default PremiumQuiz;
