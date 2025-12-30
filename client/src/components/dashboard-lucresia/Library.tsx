import React, { useState, useEffect } from 'react';
import { useToast } from '../Toast';
import { auth } from '../../firebase/config';
import { UserData } from '../../types';

const libraryData = [
    { title: "Ebook Estética Estratégica Express", isLocked: false, icon: '📘' },
    { title: "Checklist Stories que Vendem", isLocked: false, icon: '✅' },
    { title: "Guia 10 Frases que Sabotam Suas Vendas", isLocked: false, icon: '🚫' },
    { title: "Gerador de E-book com IA", isLocked: false, icon: '📖' },
    { title: "Prompt Lab", isLocked: true, icon: '🧪' },
    { title: "Calendário Elevare 12M", isLocked: true, icon: '🗓️' },
    { title: "Arquitetura de Conteúdo Premium", isLocked: true, icon: '🏗️' },
    { title: "Mentoria Lucrativa", isLocked: true, icon: '💡' },
    { title: "Criar Meu Método Elevare", isLocked: true, icon: '🚀' },
];

const UpgradeModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleUpgrade = async () => {
        setIsLoading(true);
        // --- SIMULATION of backend call to create Stripe session ---
        console.log("Simulating backend call to create Stripe checkout session...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Redirect to our success page, mimicking Stripe's behavior.
        window.location.hash = '#/payment/success';
    };

    return (
        <div className="modal-backdrop animate-on-scroll is-visible">
            <div className="modal-content p-8 text-center">
                <span className="text-4xl">💎</span>
                <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Desbloqueie todo o seu potencial!</h2>
                <p className="text-slate-500 mb-6">Desbloqueie todos os recursos por R$27/mês ou R$57/mês (Master).</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                        onClick={handleUpgrade} 
                        disabled={isLoading}
                        className="px-6 py-3 bg-[#9F8DE6] text-white rounded-lg font-bold hover:bg-violet-500 transition-colors disabled:opacity-70"
                    >
                        {isLoading ? 'Processando...' : 'Desbloquear Tudo — R$27/mês'}
                    </button>
                    <button onClick={onClose} disabled={isLoading} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors disabled:opacity-70">Continuar no Free</button>
                </div>
            </div>
        </div>
    );
};

const EbookGenerationModal: React.FC<{ onClose: () => void; user: UserData | null }> = ({ onClose, user }) => {
    const [topic, setTopic] = useState('');
    const [tone, setTone] = useState('Profissional');
    const [structure, setStructure] = useState('3 Capítulos');
    const [isLoading, setIsLoading] = useState(false);
    const [draft, setDraft] = useState('');
    const [generationsUsed, setGenerationsUsed] = useState(0);
    
    const isPremium = user?.level !== 'free';
    const FREE_GENERATION_LIMIT = 3;

    // This part still uses localStorage because generation counts are client-side only in this version.
    // A full backend would store this in Firestore.
    const getGenerationCountKey = () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return null;
        const today = new Date();
        const monthYear = `${today.getFullYear()}-${today.getMonth()}`;
        return `lucresia-ebook-count-${currentUser.uid}-${monthYear}`;
    };
    
    useEffect(() => {
        if (!isPremium) {
            const key = getGenerationCountKey();
            if (key) {
                const savedCount = parseInt(localStorage.getItem(key) || '0', 10);
                setGenerationsUsed(savedCount);
            }
        }
    }, [user, isPremium]);

    const generationsLeft = FREE_GENERATION_LIMIT - generationsUsed;
    const hasGenerationsLeft = generationsLeft > 0;

    const handleGenerate = () => {
        if (!topic.trim()) return;
        if (!isPremium && !hasGenerationsLeft) return;

        setIsLoading(true);
        setDraft('');
        
        // Simulate API call
        setTimeout(() => {
            const generatedDraft = `## Rascunho do E-book: ${topic}\n\n**Tom de Voz:** ${isPremium ? tone : 'Profissional (Padrão)'}\n**Estrutura:** ${isPremium ? structure : '3 Capítulos (Padrão)'}\n\n### Capítulo 1: Introdução\n\nEste capítulo introduz o conceito fundamental de ${topic}, explorando sua importância no mercado de estética atual...\n\n### Capítulo 2: Tópicos Avançados\n\nAprofundando no assunto, abordamos técnicas avançadas e segredos profissionais...\n\n### Capítulo 3: Conclusão e Próximos Passos\n\nResumindo os pontos chave e guiando o leitor para a ação...\n\n*Este é um rascunho gerado pela IA. Revise e personalize para a sua marca.*`;
            setDraft(generatedDraft);
            setIsLoading(false);

            if (!isPremium) {
                const key = getGenerationCountKey();
                if (key) {
                    const newCount = generationsUsed + 1;
                    setGenerationsUsed(newCount);
                    localStorage.setItem(key, newCount.toString());
                }
            }
        }, 2500);
    };
    
    const resetForm = () => {
        setTopic('');
        setDraft('');
    }

    return (
        <div className="modal-backdrop animate-on-scroll is-visible">
            <div className="modal-content p-8 text-left w-full max-w-3xl">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Gerador de E-book com IA</h2>
                         <p className="text-slate-500 text-sm">Crie rascunhos de e-books em segundos.</p>
                    </div>
                    <button onClick={onClose} className="text-2xl text-slate-400 hover:text-slate-800 transition-colors">&times;</button>
                </div>

                {!draft ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-slate-600 block mb-2">Tema Principal</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ex: Guia completo de skincare para pele oleosa"
                                className="w-full h-20 p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9F8DE6] transition-colors"
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-sm font-bold text-slate-600 block mb-2">Tom de Voz</label>
                                <select value={tone} onChange={e => setTone(e.target.value)} disabled={isLoading || !isPremium} className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9F8DE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option>Profissional</option>
                                    <option>Acolhedor</option>
                                    <option>Luxo</option>
                                    <option>Direto</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-600 block mb-2">Estrutura do E-book</label>
                                 <select value={structure} onChange={e => setStructure(e.target.value)} disabled={isLoading || !isPremium} className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9F8DE6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <option>3 Capítulos</option>
                                    <option>5 Capítulos</option>
                                    <option>Lista de Dicas</option>
                                 </select>
                            </div>
                        </div>

                        <div className="text-xs text-amber-700 bg-amber-100 p-3 rounded-lg border border-amber-200">
                           {!isPremium ? (
                                <><strong>Você está no plano Free.</strong> Opções avançadas são exclusivas do plano Premium. 
                                <br/>Você tem <strong>{generationsLeft > 0 ? generationsLeft : 0} de {FREE_GENERATION_LIMIT}</strong> gerações restantes este mês.</>
                           ) : (
                               <><strong>Você é Premium!</strong> Use as opções avançadas para personalizar seu e-book com gerações ilimitadas.</>
                           )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button onClick={handleGenerate} disabled={isLoading || !topic.trim() || (!isPremium && !hasGenerationsLeft)} className="px-6 py-3 bg-[#9F8DE6] text-white rounded-lg font-bold hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? 'Gerando...' : (!isPremium && !hasGenerationsLeft) ? 'Limite Atingido' : 'Gerar Rascunho'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="bg-slate-100 p-4 rounded-lg whitespace-pre-wrap text-slate-700 text-sm h-72 overflow-y-auto border border-slate-200">
                            {draft}
                        </div>
                        <div className="mt-6 flex justify-end gap-4">
                             <button onClick={resetForm} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-lg font-bold hover:bg-slate-300 transition-colors">
                                Gerar Novo Rascunho
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};


const LibraryCard: React.FC<{ item: typeof libraryData[0], onClick: () => void }> = ({ item, onClick }) => (
    <div 
        className={`bg-white p-6 rounded-2xl border border-slate-200 transition-all duration-300 hover:border-[#9F8DE6] hover:-translate-y-1 card-shadow ${item.isLocked ? 'library-card-locked' : 'cursor-pointer'}`}
        onClick={onClick}
    >
        <div className="card-content">
            <span className="text-4xl">{item.icon}</span>
            <h3 className="text-lg font-bold text-slate-900 mt-4 font-inter">{item.title}</h3>
        </div>
    </div>
);


export const Library: React.FC<{ user: UserData | null }> = ({ user }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
    const { showToast } = useToast();
    
    const handleCardClick = (item: typeof libraryData[0]) => {
        if (item.title === "Gerador de E-book com IA") {
            setIsGenerationModalOpen(true);
        } else if (item.isLocked) {
            setIsModalOpen(true);
        } else {
            showToast("Acessando conteúdo...", 'info');
        }
    };

    return (
        <>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Biblioteca Curada</h1>
            <div className="mb-6 bg-slate-100 text-center p-3 rounded-lg border border-slate-200">
                <p className="font-semibold text-slate-700">Você já acessou 4 de 9 recursos da LucresIA 💜</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {libraryData.map((item, index) => (
                    <div key={item.title} className={`animate-on-scroll delay-${(index + 1) * 100}`}>
                        <LibraryCard item={item} onClick={() => handleCardClick(item)} />
                    </div>
                ))}
            </div>
            {isModalOpen && <UpgradeModal onClose={() => setIsModalOpen(false)} />}
            {isGenerationModalOpen && <EbookGenerationModal user={user} onClose={() => setIsGenerationModalOpen(false)} />}
        </>
    );
};

// Fix: Add default export for lazy loading.
export default Library;
