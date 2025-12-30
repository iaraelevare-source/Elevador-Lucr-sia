import React from 'react';
import { UserData } from '../../types';

const QuickActionCard: React.FC<{ title: string, description: string, icon: string, onClick: () => void }> = ({ title, description, icon, onClick }) => (
    <button onClick={onClick} className="bg-white p-6 rounded-2xl border border-slate-200 text-left hover-lift card-shadow w-full h-full flex flex-col">
        <span className="text-3xl">{icon}</span>
        <h3 className="font-bold text-slate-800 mt-3">{title}</h3>
        <p className="text-sm text-slate-500 mt-1 flex-grow">{description}</p>
    </button>
);

const JourneyProgress: React.FC<{ user: UserData | null }> = ({ user }) => {
    const points = user?.points || 0;
    const nextRewardPoints = 60; // In a real app, this would be dynamic
    const progress = Math.min((points / nextRewardPoints) * 100, 100);

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow h-full">
            <h3 className="font-bold text-slate-800 mb-4">Sua Jornada</h3>
            <div className="flex items-center justify-between text-sm font-semibold text-slate-500 mb-2">
                <span>Pontuação</span>
                <span>{points} / {nextRewardPoints}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Próxima recompensa: <strong>Desbloqueio de E-books IA</strong></p>
        </div>
    );
}

interface HomePageProps {
    user: UserData | null;
    setActivePage: (page: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, setActivePage }) => {
    return (
        <div className="animate-on-scroll is-visible">
            <h1 className="text-4xl font-extrabold text-slate-900">Olá, {user?.name?.split(' ')[0] || 'LucresIA'}! 👋</h1>
            <p className="text-slate-500 mt-2 text-lg">O que vamos criar hoje para acelerar seu lucro?</p>

            <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard 
                    icon="✨" 
                    title="Criar Post Rápido" 
                    description="Gere legendas e ideias para feed, stories ou reels em segundos." 
                    onClick={() => setActivePage('create')} 
                />
                 <QuickActionCard 
                    icon="🎯" 
                    title="Planejar Campanha" 
                    description="Receba um pacote completo para seus anúncios no Meta Ads." 
                    onClick={() => setActivePage('campaigns')} 
                />
                 <QuickActionCard 
                    icon="📚" 
                    title="Explorar Biblioteca" 
                    description="Acesse e-books, checklists e prompts estratégicos." 
                    onClick={() => setActivePage('library')} 
                />
            </div>
            
            <div className="mt-10 grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <JourneyProgress user={user} />
                </div>
                <div className="bg-violet-100 p-6 rounded-2xl border border-violet-200 text-center flex flex-col justify-center">
                     <h3 className="font-bold text-violet-800">Desbloqueie seu Potencial</h3>
                     <p className="text-sm text-violet-600 mt-1 mb-4">Acesse todos os recursos com o plano premium.</p>
                     <button onClick={() => setActivePage('plans')} className="w-full bg-violet-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-violet-700 transition-colors">Ver Planos</button>
                </div>
            </div>
        </div>
    );
};

export default HomePage;
