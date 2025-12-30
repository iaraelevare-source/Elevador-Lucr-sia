import { useState } from "react";

const perguntas = [
  {
    pergunta: "Você sabe exatamente quanto precisa faturar por mês para ter lucro real?",
    opcoes: [
      { texto: "Não tenho essa conta clara", pontos: 1 },
      { texto: "Tenho uma ideia aproximada", pontos: 2 },
      { texto: "Sim, com margem e pró-labore definidos", pontos: 3 }
    ]
  },
  {
    pergunta: "Sobre seu ticket médio:",
    opcoes: [
      { texto: "Faço muito procedimento de valor baixo", pontos: 1 },
      { texto: "Misturo alto e baixo, sem estratégia", pontos: 2 },
      { texto: "Priorizo protocolos de alto valor agregado", pontos: 3 }
    ]
  },
  {
    pergunta: "Quando o mês está fraco, você:",
    opcoes: [
      { texto: "Faz promoção e baixa preço", pontos: 1 },
      { texto: "Posta mais, mas sem estratégia", pontos: 2 },
      { texto: "Ativa lista de espera ou campanha planejada", pontos: 3 }
    ]
  },
  {
    pergunta: "Sua clínica funciona sem você presente?",
    opcoes: [
      { texto: "Não, tudo depende de mim", pontos: 1 },
      { texto: "Parcialmente, mas preciso supervisionar", pontos: 2 },
      { texto: "Sim, tenho processos e equipe estruturada", pontos: 3 }
    ]
  }
];

interface QuizFinanceiroProps {
  onFinish: (score: number, respostas: number[]) => void;
}

export default function QuizFinanceiro({ onFinish }: QuizFinanceiroProps) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const responder = (pontos: number, opcaoIndex: number) => {
    setSelectedOption(opcaoIndex);
    
    setTimeout(() => {
      const novoScore = score + pontos;
      const novasRespostas = [...respostas, opcaoIndex];
      
      setScore(novoScore);
      setRespostas(novasRespostas);
      setSelectedOption(null);

      if (index + 1 < perguntas.length) {
        setIndex(index + 1);
      } else {
        onFinish(novoScore, novasRespostas);
      }
    }, 300);
  };

  const progresso = ((index + 1) / perguntas.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <span className="inline-block px-4 py-1.5 bg-gray-100 text-gray-700 rounded-full text-sm font-medium tracking-wide">
          Nível 3 — Gestão e Escala
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Pergunta {index + 1} de {perguntas.length}</span>
          <span>{Math.round(progresso)}%</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-800 transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="text-center mb-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
          {perguntas[index].pergunta}
        </h2>
      </div>

      {/* Opções */}
      <div className="space-y-4">
        {perguntas[index].opcoes.map((opcao, i) => (
          <button
            key={i}
            onClick={() => responder(opcao.pontos, i)}
            disabled={selectedOption !== null}
            className={`
              w-full p-5 text-left rounded-xl border transition-all duration-200
              ${selectedOption === i 
                ? 'border-gray-900 bg-gray-50 scale-[0.98]' 
                : 'border-gray-200 bg-white hover:border-gray-400'
              }
              ${selectedOption !== null && selectedOption !== i ? 'opacity-50' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${selectedOption === i 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-600'
                }
              `}>
                {String.fromCharCode(65 + i)}
              </div>
              <span className="text-gray-800">{opcao.texto}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
