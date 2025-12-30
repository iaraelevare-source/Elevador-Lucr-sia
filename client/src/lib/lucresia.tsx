import { ReactNode } from "react";

// ============================================
// LUCRESIA™ — BRANDING PSICOLÓGICO OFICIAL
// ============================================

/**
 * Definição da marca
 */
export const LUCRESIA_BRAND = {
  name: "Lucresia™",
  tagline: "Inteligência estratégica para clínicas que operam como negócio",
  
  // Definição clara
  definition: {
    isNot: ["assistente", "chatbot", "suporte"],
    is: "A camada de inteligência que lê o negócio da esteticista e devolve direção"
  },
  
  // Tom de voz
  voice: {
    traits: ["Firme", "Executiva", "Clara"],
    avoids: ["elogio fácil", "romantização", "parabéns"],
    uses: ["atenção", "ajuste", "avance"]
  }
};

/**
 * Manifesto da Lucresia para exibição no app
 */
export const MANIFESTO = {
  title: "Lucresia™",
  subtitle: "Plano Pro",
  content: [
    "Ela observa padrões, identifica gargalos",
    "e aponta decisões que você está adiando.",
    "",
    "Lucresia existe para impedir que clínicas cresçam no improviso",
    "e para tirar empresárias do modo sobrevivência."
  ]
};

/**
 * Tipos de alertas Lucresia
 */
export type AlertaLucresia = 
  | "ZONA_RISCO"
  | "ZONA_ESTAGNACAO"
  | "ATENCAO"
  | "AJUSTE"
  | "AVANCE";

/**
 * Configuração visual dos alertas
 */
export const ALERTAS_CONFIG: Record<AlertaLucresia, {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}> = {
  ZONA_RISCO: {
    label: "Zona de Risco",
    color: "#991b1b",
    bgColor: "#fef2f2",
    borderColor: "#fecaca",
    icon: "⚠️"
  },
  ZONA_ESTAGNACAO: {
    label: "Zona de Estagnação",
    color: "#92400e",
    bgColor: "#fef3cd",
    borderColor: "#f59e0b",
    icon: "⏸️"
  },
  ATENCAO: {
    label: "Atenção",
    color: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#fcd34d",
    icon: "👁️"
  },
  AJUSTE: {
    label: "Ajuste necessário",
    color: "#1e40af",
    bgColor: "#eff6ff",
    borderColor: "#93c5fd",
    icon: "🔧"
  },
  AVANCE: {
    label: "Avance",
    color: "#166534",
    bgColor: "#f0fdf4",
    borderColor: "#86efac",
    icon: "→"
  }
};

/**
 * Frases padrão da Lucresia por tipo de alerta
 */
export const FRASES_LUCRESIA: Record<AlertaLucresia, string[]> = {
  ZONA_RISCO: [
    "Seus indicadores entraram em zona crítica. Ação imediata necessária.",
    "Padrão identificado: você está repetindo um ciclo que já falhou antes.",
    "Esse gargalo não vai se resolver sozinho. Priorize agora."
  ],
  ZONA_ESTAGNACAO: [
    "Nenhuma evolução significativa nos últimos 30 dias.",
    "Você está operando no automático. Isso não é estratégia.",
    "Falta de movimento é decisão. E essa decisão está custando caro."
  ],
  ATENCAO: [
    "Esse ponto precisa da sua atenção antes de virar problema.",
    "Padrão detectado que merece análise.",
    "Observe: sua energia está sendo mal alocada aqui."
  ],
  AJUSTE: [
    "Pequena correção necessária para manter a rota.",
    "Ajuste esse ponto antes de seguir em frente.",
    "Refinamento detectado: aplique antes da próxima fase."
  ],
  AVANCE: [
    "Condições favoráveis identificadas. Aja agora.",
    "Janela de oportunidade aberta. Não hesite.",
    "Momento de execução. Você tem os dados, agora execute."
  ]
};

/**
 * Componente de Alerta da Lucresia
 */
interface AlertaLucresiaProps {
  tipo: AlertaLucresia;
  mensagem?: string;
  detalhe?: string;
}

export function AlertaLucresiaCard({ tipo, mensagem, detalhe }: AlertaLucresiaProps) {
  const config = ALERTAS_CONFIG[tipo];
  const frasePadrao = FRASES_LUCRESIA[tipo][Math.floor(Math.random() * FRASES_LUCRESIA[tipo].length)];
  
  return (
    <div 
      className="p-5 border"
      style={{ 
        backgroundColor: config.bgColor,
        borderColor: config.borderColor
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span>{config.icon}</span>
        <span 
          className="text-[12px] uppercase tracking-wide font-medium"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
      </div>
      <p 
        className="text-[15px] leading-relaxed"
        style={{ color: config.color }}
      >
        {mensagem || frasePadrao}
      </p>
      {detalhe && (
        <p 
          className="text-[13px] mt-2 opacity-80"
          style={{ color: config.color }}
        >
          {detalhe}
        </p>
      )}
    </div>
  );
}

/**
 * Componente de Manifesto da Lucresia
 */
export function ManifestoLucresia() {
  return (
    <div className="bg-[#111827] text-white p-8">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[24px]">◆</span>
        <span className="font-serif text-[20px]">{MANIFESTO.title}</span>
        <span className="text-[11px] text-[#9ca3af] uppercase tracking-wide ml-auto">
          {MANIFESTO.subtitle}
        </span>
      </div>
      <div className="text-[15px] text-[#d1d5db] leading-relaxed">
        {MANIFESTO.content.map((line, i) => (
          <p key={i} className={line === "" ? "h-4" : ""}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

/**
 * Componente de Assinatura Institucional
 */
export function AssinaturaLucresia({ variant = "default" }: { variant?: "default" | "minimal" }) {
  if (variant === "minimal") {
    return (
      <span className="text-[12px] text-[#6b7280]">
        Lucresia™
      </span>
    );
  }
  
  return (
    <div className="flex items-center gap-2 text-[13px] text-[#6b7280]">
      <span className="text-[16px]">◆</span>
      <span>{LUCRESIA_BRAND.name}</span>
      <span className="text-[#d1d5db]">—</span>
      <span className="text-[#9ca3af]">{LUCRESIA_BRAND.tagline}</span>
    </div>
  );
}

/**
 * Hook para gerar frases no tom da Lucresia
 */
export function useLucresiaVoice() {
  const speak = (tipo: "atencao" | "ajuste" | "avance", contexto: string): string => {
    const prefixos = {
      atencao: "Atenção:",
      ajuste: "Ajuste necessário:",
      avance: "Avance:"
    };
    
    return `${prefixos[tipo]} ${contexto}`;
  };
  
  const formatarDiagnostico = (texto: string): string => {
    // Remove linguagem submissa
    return texto
      .replace(/parabéns/gi, "")
      .replace(/você está indo bem/gi, "continue monitorando")
      .replace(/ótimo trabalho/gi, "progresso registrado")
      .replace(/incrível/gi, "consistente")
      .replace(/maravilhoso/gi, "adequado")
      .trim();
  };
  
  return { speak, formatarDiagnostico };
}

/**
 * Determina nível de "dureza" da Lucresia baseado na maturidade
 */
export function getNivelDureza(meses: number, score: number): "suave" | "firme" | "dura" {
  // Primeiros 2 meses: mais gentil para não assustar
  if (meses <= 2) return "suave";
  
  // Score baixo após 2 meses: hora de ser firme
  if (meses > 2 && score < 50) return "dura";
  
  // Score médio: tom firme padrão
  if (score < 70) return "firme";
  
  // Score alto: pode ser mais direta
  return "firme";
}

/**
 * Frases por nível de dureza
 */
export const FRASES_POR_DUREZA = {
  suave: {
    abertura: "Vamos analisar seus dados juntas.",
    gargalo: "Identifiquei um ponto que precisa de atenção.",
    fechamento: "Continue acompanhando sua evolução."
  },
  firme: {
    abertura: "Seus dados mostram o seguinte cenário.",
    gargalo: "Esse gargalo está limitando seu crescimento.",
    fechamento: "Ação necessária antes da próxima análise."
  },
  dura: {
    abertura: "Direto ao ponto.",
    gargalo: "Você está ignorando esse problema há semanas.",
    fechamento: "Ou você age agora, ou aceita as consequências."
  }
};
