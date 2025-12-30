
import React from 'react';
import { SocialShare } from './SocialShare';

interface FooterProps {
    currentStage: number;
    score: number;
    onShare: () => void;
}

export const Footer: React.FC<FooterProps> = ({ currentStage, score, onShare }) => {
    const pageUrl = "https://lucresia.elevare.global"; // Substitua pela URL real, se dinâmica
    const shareTitle = "LucresIA – Biblioteca Evolutiva Estética Lucrativa";
    const shareSummary = "Evolua do operacional ao império digital, passo a passo, com a inteligência estética que mais entende de lucro.";

    // O componente Footer calcula dinamicamente o progresso com base na prop currentStage do App.tsx.
    const completedStages = currentStage > 1 ? currentStage - 1 : 0;
    const totalProgress = (completedStages / 5) * 100;

    const getNextReward = () => {
        if (score < 60) return "Desbloqueia E-books IA (60 pts)";
        if (score < 150) return "Libera Módulo de Apps (150 pts)";
        return "Novas recompensas em breve!";
    };

    return (
        <footer className="sticky bottom-0 bg-[#1A1A1A]/80 backdrop-blur-lg z-40 border-t border-white/10 shadow-2xl shadow-black/50">
            <div className="max-w-5xl mx-auto px-6 lg:px-8 py-6">
                <div className="grid md:grid-cols-3 gap-6 items-center">
                    
                    {/* Painel de Evolução */}
                    <div className="md:col-span-2 bg-black/30 p-4 rounded-lg">
                        <h4 className="font-bold text-lg text-[#EFD8A3]">Painel de Evolução</h4>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                            <div>
                                <p className="font-semibold text-slate-300">Progresso Total:</p>
                                {/* O texto e a barra de progresso são atualizados automaticamente conforme o estado currentStage muda. */}
                                <p className="text-white font-bold">Etapa {completedStages} de 5 Concluída</p>
                                <div className="progress-bar-container mt-1">
                                    <div className="progress-bar" style={{ width: `${totalProgress}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-300">Pontuação e Recompensas:</p>
                                <p className="text-white font-bold">{score} Pontos</p>
                                <p className="text-xs text-slate-400 mt-1">
                                   Próxima: <span className="font-bold text-white">{getNextReward()}</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                         <button className="w-full px-6 py-3 bg-[#EFD8A3] text-[#1A1A1A] rounded-lg shadow-lg font-bold text-md hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105">
                            Ver Minhas Recompensas
                        </button>
                        <p className="text-xs text-slate-400 mt-2">Ganhe pontos por indicar, assinar e publicar!</p>
                    </div>
                </div>

                 <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-slate-500 space-y-4">
                    <SocialShare url={pageUrl} title={shareTitle} summary={shareSummary} onShare={onShare} />
                    <p>© 2024 Estética Lucrativa — Desenvolvido por Elevare Global</p>
                 </div>
            </div>
        </footer>
    );
};
