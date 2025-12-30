import React, { useEffect } from 'react';

// Re-implemented UI components to avoid external dependencies.
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`shadow-lg hover:shadow-2xl bg-white border border-slate-200 rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 ${className}`}>
        {children}
    </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`text-white p-6 ${className}`}>
        {children}
    </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`p-6 space-y-4 bg-white ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <h2 className={`text-lg font-semibold leading-tight ${className}`}>
        {children}
    </h2>
);

const Button: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <button className={`w-full bg-[#9F8DE6] hover:bg-violet-500 text-white font-medium py-2.5 px-4 rounded-lg transition-colors ${className}`}>
        {children}
    </button>
);

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
    <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${className}`}>
        <div className="bg-violet-500 h-full transition-all duration-500" style={{ width: `${value}%` }}></div>
    </div>
);

export const MinhaConsciencia: React.FC = () => {
  const quizzes = [
    {
      id: 1,
      title: "Nível de Consciência Estética Empresarial",
      icon: "🧠",
      description: "Descubra sua mentalidade atual e ative sua trilha de evolução.",
      color: "from-violet-400 to-violet-600",
      action: "Iniciar Quiz",
    },
    {
      id: 2,
      title: "Você Pensou Como CEO Este Mês?",
      icon: "🔄",
      description: "Avalie suas decisões e descubra se agiu com estratégia.",
      color: "from-indigo-400 to-indigo-600",
      action: "Avaliar Mês",
    },
    {
      id: 3,
      title: "Quem Comanda Sua Clínica: Você ou Sua Sabotadora?",
      icon: "🔺",
      description: "Identifique padrões mentais e desbloqueie sua confiança.",
      color: "from-pink-400 to-pink-600",
      action: "Revelar Padrões",
    },
    {
      id: 4,
      title: "Quanto Você Realmente Ganha por Atender?",
      icon: "💲",
      description: "Entenda seu lucro real e reposicione seus preços.",
      color: "from-yellow-400 to-yellow-600",
      action: "Calcular Lucro",
    },
    {
      id: 5,
      title: "Sua Marca Fala o Que Você É?",
      icon: "📱",
      description: "Descubra o que sua imagem comunica no digital.",
      color: "from-rose-400 to-rose-600",
      action: "Analisar Marca",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-center text-slate-900 mb-10 animate-on-scroll is-visible">
        🌸 Minha Consciência Elevare
      </h1>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz, index) => (
          <div key={quiz.id} className={`animate-on-scroll is-visible delay-${(index + 1) * 100}`}>
            <Card>
              <CardHeader className={`bg-gradient-to-r ${quiz.color}`}>
                <span className="text-3xl mb-3 block" aria-hidden="true">{quiz.icon}</span>
                <CardTitle>
                  {quiz.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 text-sm">{quiz.description}</p>
                <Progress value={(quiz.id * 15 + 10) % 100} className="h-2" />
                <Button>
                  {quiz.action}
                </Button>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      <div className="text-center mt-16 text-slate-500 animate-on-scroll is-visible delay-500">
        <p className="text-lg italic mb-2">
          “Você não precisa mudar tudo. Só precisa se enxergar com clareza.”
        </p>
        <p className="text-sm text-[#9F8DE6] font-medium">
          A ELEVARE revela. Você decide.
        </p>
      </div>
    </div>
  );
}

// Fix: Add default export for lazy loading.
export default MinhaConsciencia;
