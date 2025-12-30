/**
 * 🕳️ QUIZ RESULT - O ABISMO ELEGANTE
 * 
 * Implementa a tensão estratégica após o quiz:
 * - Classificação de Nível (Desbravadora/Estrategista/Rainha)
 * - Mensagens de "Espelho" que confrontam a realidade
 * - Card do Abismo (bg-slate-900) com tensão elegante
 */

import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, Sparkles, Crown, Target } from "lucide-react";
import { 
  classificarNivel, 
  MENSAGENS_ESPELHO 
} from "@/data/quizData";

// ============================================
// TIPOS
// ============================================
interface QuizResultProps {
  pontuacao: number;
  totalPerguntas: number;
  onContinuar: () => void;
  onVerDiagnostico?: () => void;
}

// ============================================
// ÍCONES POR NÍVEL
// ============================================
const ICONE_NIVEL = {
  desbravadora: Target,
  estrategista: Sparkles,
  rainha: Crown,
};

const COR_NIVEL = {
  desbravadora: "#b8975a", // dourado fosco
  estrategista: "#6b2fa8", // roxo elevare
  rainha: "#2d2d2d", // grafite
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export function QuizResult({ 
  pontuacao, 
  totalPerguntas,
  onContinuar,
  onVerDiagnostico,
}: QuizResultProps) {
  const nivel = classificarNivel(pontuacao);
  const mensagem = MENSAGENS_ESPELHO[nivel];
  const Icone = ICONE_NIVEL[nivel];
  const cor = COR_NIVEL[nivel];
  const maxPontos = totalPerguntas * 3;
  const percentual = Math.round((pontuacao / maxPontos) * 100);

  return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      {/* Header */}
      <header className="px-6 py-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div 
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `${cor}15` }}
          >
            <Icone className="w-8 h-8" style={{ color: cor }} />
          </div>
          
          <h1 className="font-serif text-2xl md:text-3xl text-[#2d2d2d] mb-2">
            {mensagem.titulo}
          </h1>
          
          <p className="text-sm text-gray-500">
            Pontuação: {pontuacao} de {maxPontos} ({percentual}%)
          </p>
        </motion.div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 px-6 pb-12">
        <div className="max-w-xl mx-auto space-y-8">
          
          {/* Mensagem Espelho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm"
          >
            <p className="text-lg text-[#2d2d2d] leading-relaxed font-light">
              {mensagem.espelho}
            </p>
          </motion.div>

          {/* ─────────────────────────────────────────────────────── */}
          {/* CARD DO ABISMO - O coração da tensão estratégica */}
          {/* ─────────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white"
          >
            {/* Decoração sutil */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
            
            {/* Ícone de alerta elegante */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-serif text-xl text-white">
                {mensagem.abismo}
              </h3>
            </div>
            
            {/* Descrição do abismo */}
            <p className="text-gray-300 leading-relaxed mb-8">
              {mensagem.descricaoAbismo}
            </p>
            
            {/* Linha divisória sutil */}
            <div className="w-12 h-px bg-white/20 mb-8" />
            
            {/* Provocação final */}
            <p className="text-sm text-gray-400 italic mb-8">
              "A diferença entre quem sonha e quem conquista não é talento. É clareza sobre o que está invisível."
            </p>
            
            {/* CTA Principal */}
            <button
              onClick={onContinuar}
              className="w-full py-4 rounded-xl bg-white text-slate-900 font-medium 
                         hover:bg-gray-100 transition-all duration-200
                         flex items-center justify-center gap-2 group"
            >
              <span>{mensagem.cta}</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Barra de Classificação Visual */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-2xl p-6 border border-gray-100"
          >
            <p className="text-sm text-gray-500 mb-4 text-center">
              Sua fase atual de maturidade
            </p>
            
            <div className="relative">
              {/* Barra de fundo */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentual}%` }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: cor }}
                />
              </div>
              
              {/* Labels */}
              <div className="flex justify-between mt-3 text-xs">
                <span className={nivel === "desbravadora" ? "text-[#b8975a] font-medium" : "text-gray-400"}>
                  Desbravadora
                </span>
                <span className={nivel === "estrategista" ? "text-[#6b2fa8] font-medium" : "text-gray-400"}>
                  Estrategista
                </span>
                <span className={nivel === "rainha" ? "text-[#2d2d2d] font-medium" : "text-gray-400"}>
                  Rainha
                </span>
              </div>
            </div>
          </motion.div>

          {/* Link secundário */}
          {onVerDiagnostico && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-center"
            >
              <button
                onClick={onVerDiagnostico}
                className="text-sm text-gray-500 hover:text-[#6b2fa8] transition-colors underline underline-offset-4"
              >
                Ver detalhamento completo
              </button>
            </motion.div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 text-center">
        <p className="text-xs text-gray-400">
          LucresIA — Diagnóstico baseado em dados, não em achismo.
        </p>
      </footer>
    </div>
  );
}

export default QuizResult;
