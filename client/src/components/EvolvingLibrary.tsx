
import React, { useState } from 'react';

// Icons for each stage
const Stage1Icon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
const Stage2Icon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const Stage3Icon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const Stage4Icon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
const Stage5Icon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zM3 18h18" /></svg>;
const ChevronIcon: React.FC = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 chevron-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;

const libraryData = [
    {
        stage: 1,
        title: "Impulso Lucrativo",
        access: "Acesso gratuito imediato – sem cartão",
        objective: "Gerar resultados rápidos, ganhar confiança e ativar o lucro.",
        contents: ["Prompt Start LucresIA", "Banco de Frases Magnéticas", "Copy de Luxo Express", "Checklist: Erros de Comunicação que Matam Vendas", "Kit Visual Elevare"],
        unlock: "Publicar 1 conteúdo feito com LucresIA.",
        icon: <Stage1Icon />,
        color: "text-green-600",
        bg: "bg-green-50",
    },
    {
        stage: 2,
        title: "Mente Estratégica",
        access: "Liberado após conclusão da Etapa 1",
        objective: "Pensar como empresária e criar diferenciais claros.",
        contents: ["Manual da Esteticista Estratégica", "Consultas que Criam Valor", "O Método Água no Deserto", "A Arte de Encantar no Silêncio"],
        unlock: "Criar 1 pacote de serviço nomeado e com promessa.",
        icon: <Stage2Icon />,
        color: "text-blue-600",
        bg: "bg-blue-50",
    },
    {
        stage: 3,
        title: "Neurovendas e Desejo",
        access: "Liberado após conclusão da Etapa 2",
        objective: "Dominar psicologia da venda e persuasão ética.",
        contents: ["Cérebro da Beleza – neurovendas aplicadas", "Decodificando o Desejo – gatilhos mentais", "Coaching Estético – comunicação de alta frequência"],
        unlock: "Concluir o quiz “Como o cliente decide confiar em você”.",
        icon: <Stage3Icon />,
        color: "text-pink-600",
        bg: "bg-pink-50",
    },
    {
        stage: 4,
        title: "Inteligência Aplicada",
        access: "Liberado após conclusão da Etapa 3",
        objective: "Automatizar conteúdo, atendimento e captação.",
        contents: ["Prompt Lab LucresIA – IA para copy, imagem e funis", "Automação Estética – fluxos para WhatsApp e e-mail", "Calendário Elevare 12M – planejamento anual"],
        unlock: "Automatizar o primeiro atendimento com IA.",
        icon: <Stage4Icon />,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
    },
    {
        stage: 5,
        title: "Elevare Master",
        access: "Liberado após conclusão da Etapa 4",
        objective: "Criar produtos, programas e sistemas lucrativos.",
        contents: ["Arquitetura de Conteúdo Premium", "Planejamento Anual Elevare", "Mentoria Lucrativa – transforme experiência em programa"],
        unlock: "Entregar o desafio “Meu método em 3 páginas”.",
        icon: <Stage5Icon />,
        color: "text-amber-600",
        bg: "bg-amber-50",
    },
];

interface StageCardProps extends Omit<typeof libraryData[0], 'access'> {
    className?: string;
    isExpanded: boolean;
    onToggleExpand: (stage: number) => void;
}


const StageCard: React.FC<StageCardProps> = ({ 
    stage, title, objective, contents, unlock, icon, color, bg, className,
    isExpanded, onToggleExpand
}) => (
    <div className={`border rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${className}`}>
        <button
            onClick={() => onToggleExpand(stage)}
            className="w-full text-left transition-colors"
            aria-expanded={isExpanded}
            aria-controls={`stage-content-library-${stage}`}
        >
            <div className={`p-6 ${bg} flex items-center gap-4 border-b border-black/5`}>
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-white ${color} flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <p className={`text-sm font-bold ${color}`}>ETAPA {stage}</p>
                    <h3 className="text-2xl font-extrabold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-600 font-medium mt-1 italic">"{objective}"</p>
                </div>
                <div className={`text-slate-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                    <ChevronIcon />
                </div>
            </div>
        </button>

        <div id={`stage-content-library-${stage}`} className={`stage-content ${isExpanded ? 'expanded' : ''}`}>
            <div> {/* Inner div for smooth grid transition */}
                <div className="p-6 bg-white text-slate-800">
                    <p className="font-bold mb-2">Conteúdos inclusos:</p>
                    <ul className="space-y-2 mb-4">
                        {contents.map((item, index) => (
                             <li key={index} className="flex items-start text-sm">
                                <svg className="w-4 h-4 mr-2 mt-0.5 text-violet-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                <span className="text-slate-700">{item}</span>
                            </li>
                        ))}
                    </ul>
                     <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-xs font-semibold text-slate-700">🔓 CONDIÇÃO DE DESBLOQUEIO:</p>
                        <p className="text-sm text-slate-600">{unlock}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


export const EvolvingLibrary: React.FC = () => {
    const [expandedStage, setExpandedStage] = useState<number | null>(null);

    const handleToggleExpand = (stage: number) => {
        setExpandedStage(current => (current === stage ? null : stage));
    };

    return (
        <section id="library" className="py-16">
            <div className="text-center mb-12 animate-on-scroll">
                <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Biblioteca Evolutiva Estética Lucrativa</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-3xl mx-auto">Sua jornada guiada, da confiança nos primeiros posts à criação do seu próprio método lucrativo.</p>
            </div>
            <div className="space-y-8">
                {libraryData.map((item, index) => (
                    <StageCard 
                        key={item.stage} 
                        {...item} 
                        className={`animate-on-scroll delay-${(index + 1) * 100}`}
                        isExpanded={expandedStage === item.stage}
                        onToggleExpand={handleToggleExpand}
                    />
                ))}
            </div>
        </section>
    );
};
