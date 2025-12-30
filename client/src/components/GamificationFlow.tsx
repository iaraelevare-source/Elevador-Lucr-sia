
import React from 'react';

const Step: React.FC<{ title: string; description: string; points?: string; icon: React.ReactNode, isLast?: boolean; className?: string }> = ({ title, description, points, icon, isLast, className }) => (
    <div className={`relative flex items-start ${className}`}>
        <div className="flex flex-col items-center mr-6">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#9F8DE6] text-white flex items-center justify-center z-10 shadow-lg shadow-[#9F8DE6]/30">
                {icon}
            </div>
            {!isLast && <div className="w-px h-full bg-white/20 mt-2"></div>}
        </div>
        <div className="pt-2">
            <h4 className="font-bold text-white">{title} {points && <span className="text-sm font-semibold text-black bg-[#EFD8A3] px-2 py-1 rounded-full ml-2">{points}</span>}</h4>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
        </div>
    </div>
);

export const GamificationFlow: React.FC = () => {
    return (
        <section id="gamification" className="py-16">
            <div className="text-center mb-12 animate-on-scroll">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Sua Progressão Para o Sucesso</h2>
                <p className="mt-4 text-lg text-slate-400">Desbloqueie todo o potencial da plataforma etapa por etapa.</p>
            </div>
            <div className="max-w-2xl mx-auto">
                 <Step 
                    className="animate-on-scroll delay-100"
                    title="Cadastro Gratuito"
                    description="Acesso imediato à Etapa 1 para sentir o gostinho da automação."
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.789-2.75 9.566-1.74 2.777-2.55 4.21-2.55 4.21h10.5c0 0-.81-1.433-2.55-4.21A18.049 18.049 0 0012 11z" /></svg>}
                />
                 <Step 
                    className="animate-on-scroll delay-200"
                    title="Assinatura Premium"
                    description="Desbloqueia a LucresIA completa, biblioteca, planejador e mais."
                    points="R$ 27/mês"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4M17 3v4m-2-2h4m2 10v4m-2-2h4M5 11h14M5 11a2 2 0 110-4h14a2 2 0 110 4M5 11v2m14-2v2m-6-4v2" /></svg>}
                />
                 <Step 
                    className="animate-on-scroll delay-300"
                    title="Módulo E-books"
                    description="Libera a produção automática de e-books completos."
                    points="60 Pontos"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                />
                 <Step 
                    className="animate-on-scroll delay-400"
                    title="Módulo Aplicativos"
                    description="Aprenda a criar seus próprios apps com IA para escalar ainda mais."
                    points="150 Pontos"
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>}
                    isLast={true}
                />
            </div>
             <div className="mt-8 text-center text-sm text-slate-400 max-w-2xl mx-auto bg-black/30 p-4 rounded-lg animate-on-scroll delay-500">
                <strong>Como ganhar pontos?</strong> Conclua uma etapa (+5 pontos) e compartilhe a jornada (+20 pontos).
            </div>
        </section>
    );
};
