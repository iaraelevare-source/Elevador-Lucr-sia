import React from 'react';

interface JourneyStepProps {
    step: number;
    title: string;
    description: string;
    points: number;
    isCompleted: boolean;
    isCurrent: boolean;
    icon: string;
}

const JourneyStep: React.FC<JourneyStepProps> = ({ step, title, description, points, isCompleted, isCurrent, icon }) => {
    const statusColor = isCompleted ? 'bg-green-500' : isCurrent ? 'bg-violet-500' : 'bg-slate-300';
    const textColor = isCompleted ? 'text-green-700' : isCurrent ? 'text-violet-700' : 'text-slate-500';

    return (
        <div className="flex gap-6 relative">
            {/* Timeline */}
            <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl z-10 ${statusColor} shadow-lg`}>{icon}</div>
                <div className="w-1 bg-slate-200 h-full"></div>
            </div>
            {/* Content */}
            <div className={`pb-12 w-full transition-all duration-300 ${isCurrent ? 'transform -translate-y-1' : ''}`}>
                <div className={`p-6 rounded-2xl border bg-white ${isCurrent ? 'border-violet-300' : 'border-slate-200'}`}>
                    <p className={`text-sm font-bold ${textColor}`}>ETAPA {step}</p>
                    <h3 className="text-xl font-bold text-slate-800">{title}</h3>
                    <p className="text-slate-500 mt-1">{description}</p>
                    <div className="mt-3 text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block">
                        +{points} Pontos
                    </div>
                </div>
            </div>
        </div>
    );
};

export const Gamification: React.FC = () => {
    const journeyData = [
        { id: 1, title: "Comece com o Pé Direito", description: "Complete seu perfil e crie seu primeiro post.", points: 20, icon: '🚀' },
        { id: 2, title: "Mente Estratégica", description: "Explore a biblioteca e defina seus objetivos.", points: 50, icon: '🧠' },
        { id: 3, title: "Primeira Campanha", description: "Use o assistente para criar sua primeira campanha.", points: 100, icon: '🎯' },
        { id: 4, title: "Automação", description: "Crie seu primeiro E-book e analise seu perfil.", points: 150, icon: '🤖' },
        { id: 5, title: "Nível Master", description: "Desbloqueie todos os recursos e se torne um mestre.", points: 200, icon: '👑' },
    ];
    
    // This would come from user data in a real app
    const currentStep = 2;

    return (
        <div className="animate-on-scroll is-visible">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Sua Jornada de Lucro</h1>
            <p className="text-slate-500 mb-8">Complete as etapas para ganhar pontos e desbloquear recompensas exclusivas.</p>
            
            <div className="max-w-3xl mx-auto">
                {journeyData.map(item => (
                    <JourneyStep 
                        key={item.id}
                        step={item.id}
                        title={item.title}
                        description={item.description}
                        points={item.points}
                        icon={item.icon}
                        isCompleted={item.id < currentStep}
                        isCurrent={item.id === currentStep}
                    />
                ))}
                 <div className="flex gap-6 relative">
                    <div className="flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl z-10 bg-slate-300">🏆</div>
                    </div>
                    <div className="pb-12">
                        <p className="text-sm font-bold text-slate-500">FIM DA JORNADA INICIAL</p>
                        <h3 className="text-xl font-bold text-slate-800">Parabéns!</h3>
                        <p className="text-slate-500 mt-1">Você completou sua jornada inicial. Novas aventuras aguardam!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Gamification;
