import { useState } from "react";

const perguntas = [
  {
    pergunta: "Sua bio hoje deixa claro:",
    opcoes: [
      { texto: "Só quem eu sou", pontos: 1 },
      { texto: "O que faço, mas não pra quem", pontos: 2 },
      { texto: "Para quem é e por que me escolher", pontos: 3 }
    ]
  },
  {
    pergunta: "Quando alguém entra no seu Instagram:",
    opcoes: [
      { texto: "Precisa procurar o WhatsApp", pontos: 1 },
      { texto: "Encontra, mas sem incentivo", pontos: 2 },
      { texto: "É conduzida direto ao agendamento", pontos: 3 }
    ]
  },
  {
    pergunta: "Sua comunicação é mais:",
    opcoes: [
      { texto: "Informativa", pontos: 1 },
      { texto: "Bonita, mas genérica", pontos: 2 },
      { texto: "Desejável e persuasiva", pontos: 3 }
    ]
  },
  {
    pergunta: "Seus destaques:",
    opcoes: [
      { texto: "Estão desatualizados", pontos: 1 },
      { texto: "Mostram procedimentos", pontos: 2 },
      { texto: "Conduzem à decisão", pontos: 3 }
    ]
  }
];

interface QuizBioProps {
  onFinish: (score: number, respostas: number[]) => void;
}

export default function QuizBio({ onFinish }: QuizBioProps) {
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
      {/* Progress Bar - Minimal */}
      <div className="mb-10">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>{index + 1} de {perguntas.length}</span>
        </div>
        <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-800 transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>

      {/* Pergunta */}
      <div className="text-center mb-12">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 leading-tight">
          {perguntas[index].pergunta}
        </h2>
      </div>

      {/* Opções - Clean */}
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
