
import React from 'react';

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);

const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
     <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const ComparisonTable: React.FC = () => {
    const features = [
        { name: "IA de Conteúdo", free: "Básica (1 prompt/semana)", premium: "Completa e ilimitada" },
        { name: "Biblioteca Estratégica", free: "Amostra", premium: "Completa + atualizações" },
        { name: "Planejador de Conteúdo", free: false, premium: true },
        { name: "Produção de E-books", free: false, premium: true },
        { name: "Gamificação Elevare", free: "Parcial", premium: "Com recompensas e upgrades" },
        { name: "Mini Cursos e Mentorias", free: false, premium: "Liberados por pontos" },
        { name: "Suporte e Comunidade", free: "Básico", premium: "Prioritário" },
    ];

    return (
        <section id="pricing" className="py-16">
            <div className="text-center mb-12 animate-on-scroll">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Compare os Planos</h2>
                <p className="mt-4 text-lg text-slate-400">Escolha o caminho que acelera seu lucro.</p>
            </div>
            <div className="bg-[#2a2a2a] rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden animate-on-scroll delay-100">
                <div className="grid grid-cols-3">
                    <div className="p-6 font-bold text-slate-300">Recurso</div>
                    <div className="p-6 text-center font-bold text-slate-300 bg-black/20 border-x border-white/10">Gratuito</div>
                    <div className="p-6 text-center font-bold text-[#EFD8A3] bg-[#EFD8A3]/10">💎 Premium</div>
                </div>
                {features.map((feature, index) => (
                    <div key={index} className="grid grid-cols-3 border-t border-white/10 text-sm">
                        <div className="p-4 sm:p-6 font-medium text-slate-200 flex items-center">{feature.name}</div>
                        
                        <div className="p-4 sm:p-6 text-center text-slate-400 bg-black/20 border-x border-white/10 flex flex-col justify-center items-center">
                            {typeof feature.free === 'boolean' ? (
                                feature.free ? <CheckIcon className="text-green-500" /> : <CloseIcon className="text-red-500" />
                            ) : (
                                <span>{feature.free}</span>
                            )}
                        </div>
                        
                        <div className="p-4 sm:p-6 text-center text-[#EFD8A3] bg-[#EFD8A3]/10 flex flex-col justify-center items-center font-semibold">
                             {typeof feature.premium === 'boolean' ? (
                                feature.premium ? <CheckIcon className="text-green-400" /> : <CloseIcon className="text-slate-500" />
                            ) : (
                                <span>{feature.premium}</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
             <div className="mt-12 text-center animate-on-scroll delay-200">
                <p className="text-xl font-bold text-white">R$ 27/mês = menos que 1 café por dia.</p>
                <p className="text-slate-400 mt-2">💡 A diferença? A LucresIA não gasta — ela <span className="text-[#9F8DE6] font-bold">multiplica</span>.</p>
            </div>
        </section>
    );
};
