import { useState } from "react";

const perguntas = [
  {
    pergunta: "Quando você pensa no valor dos seus serviços:",
    opcoes: [
      { texto: "Tenho medo de cobrar mais e perder clientes", pontos: 1 },
      { texto: "Sei que poderia cobrar mais, mas ainda não me sinto segura", pontos: 2 },
      { texto: "Cobro pelo valor que entrego e não negocio", pontos: 3 }
    ]
  },
  {
    pergunta: "Sobre sua rotina de trabalho:",
    opcoes: [
      { texto: "Atendo de tudo, a qualquer hora, para não perder ninguém", pontos: 1 },
      { texto: "Tenho horários definidos, mas faço exceções frequentes", pontos: 2 },
      { texto: "Minha agenda é estratégica e eu controlo os horários", pontos: 3 }
    ]
  },
  {
    pergunta: "Quando uma cliente pede desconto:",
    opcoes: [
      { texto: "Geralmente dou, para não perder a venda", pontos: 1 },
      { texto: "Nego, mas fico insegura se fiz certo", pontos: 2 },
      { texto: "Ofereço valor agregado, nunca desconto", pontos: 3 }
    ]
  },
  {
    pergunta: "Sua visão de longo prazo para a clínica:",
    opcoes: [
      { texto: "Penso mês a mês, sobrevivendo", pontos: 1 },
      { texto: "Tenho ideias, mas falta tempo para planejar", pontos: 2 },
      { texto: "Tenho metas claras e estou construindo para escalar", pontos: 3 }
    ]
  }
];

interface QuizConscienciaProps {
  onFinish: (score: number, respostas: number[]) => void;
}

export default function QuizConsciencia({ onFinish }: QuizConscienciaProps) {
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
          Nível 2 — Maturidade
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
