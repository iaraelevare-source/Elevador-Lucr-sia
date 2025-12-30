
import React, { useState } from 'react';
import { functions } from '../../firebase/config';
import { PRICE_IDS } from '../../config/priceIds';
import { UserData } from '../../types';

export const Plans: React.FC<{ user: UserData }> = ({ user }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [procedureValue, setProcedureValue] = useState(350);

    const handleSubscribe = async (plan: 'pro' | 'master') => {
        setIsLoading(plan);
        try {
            const priceId = plan === 'pro' ? PRICE_IDS.pro_monthly : PRICE_IDS.master_monthly;
            const createCheckout = functions.httpsCallable('createStripeCheckout');
            const result = await createCheckout({
                priceId,
                successUrl: `${window.location.origin}${window.location.pathname}#/payment/success`,
                cancelUrl: `${window.location.origin}${window.location.pathname}#/payment/cancel`,
            });
            const { url } = result.data as { url: string };
            window.location.href = url;
        } catch (error) {
            console.error(error);
            alert("Erro ao iniciar pagamento.");
            setIsLoading(null);
        }
    };

    // Cálculo do valor anual do Pro e quantas vendas pagam isso
    const annualPro = 87 * 12;
    const salesNeeded = Math.ceil(annualPro / procedureValue);

    return (
        <div className="max-w-5xl mx-auto animate-on-scroll is-visible px-4 py-8">
            <div className="text-center mb-12">
                <span className="text-amber-500 font-black text-[10px] uppercase tracking-widest border border-amber-500/30 px-4 py-1 rounded-full mb-4 inline-block">Investimento Estratégico</span>
                <h1 className="text-4xl font-black mb-4 text-white tracking-tight">Evolua sua Clínica Hoje</h1>
                <p className="text-gray-400 max-w-2xl mx-auto italic font-medium">Saia do modo manual e comece a escalar seu faturamento com inteligência artificial.</p>
            </div>

            {/* Calculadora de ROI - Provando que é barato */}
            <div className="mb-16 bg-gradient-to-br from-[#1E1E2E] to-[#111118] p-10 rounded-[2.5rem] border border-white/10 text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl"></div>
                <h4 className="text-lg font-bold text-white mb-8 flex items-center justify-center gap-2">
                    <span className="text-2xl">🧮</span> Calculadora de ROI LucresIA
                </h4>
                <div className="max-w-md mx-auto space-y-6">
                    <div>
                        <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-4">Valor Médio do seu Procedimento (R$)</p>
                        <input 
                            type="range" min="100" max="3000" step="50" 
                            value={procedureValue} 
                            onChange={(e) => setProcedureValue(Number(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-full appearance-none accent-purple-500 cursor-pointer"
                        />
                        <div className="text-4xl font-black text-white mt-4 tracking-tighter">R$ {procedureValue}</div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mt-8 backdrop-blur-sm">
                        <p className="text-sm text-gray-300 leading-relaxed font-medium">
                            Com apenas <span className="text-amber-400 font-black text-lg">{salesNeeded} {salesNeeded === 1 ? 'venda' : 'vendas'}</span> deste procedimento, você paga <strong className="text-white">1 ANO INTEIRO</strong> do plano Pro.
                        </p>
                        <p className="text-[10px] text-gray-500 mt-2 uppercase font-bold tracking-widest">A LucresIA se paga sozinha.</p>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 items-stretch">
                {/* Plano PRO */}
                <div className={`relative bg-white/5 border-2 ${user.level === 'pro' ? 'border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.1)]' : 'border-white/10'} rounded-[2.5rem] p-10 flex flex-col transition-all group overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    <h3 className="text-2xl font-bold mb-2 flex items-center gap-2 text-white">
                        LucresIA Pro
                        {user.level === 'pro' && <span className="text-[10px] bg-purple-500 text-white px-2.5 py-1 rounded-full uppercase font-black">Ativo</span>}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-10">
                        <span className="text-5xl font-black text-white tracking-tighter">R$87</span>
                        <span className="text-gray-500 font-medium">/mês</span>
                    </div>
                    
                    <ul className="space-y-5 flex-grow mb-12">
                        {[
                            'Posts e Legendas ILIMITADAS',
                            'IA de E-books Completa',
                            'Assistente de Campanhas Ads',
                            'Biblioteca Estratégica VIP',
                            'Suporte WhatsApp Prioritário'
                        ].map(f => (
                            <li key={f} className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                                <svg className="w-5 h-5 text-purple-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                {f}
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={() => handleSubscribe('pro')}
                        disabled={!!isLoading || user.level === 'pro' || user.level === 'master'}
                        className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all transform active:scale-95 ${user.level === 'pro' || user.level === 'master' ? 'bg-white/5 text-gray-500 cursor-default' : 'bg-white text-black hover:bg-gray-100 shadow-xl'}`}
                    >
                        {isLoading === 'pro' ? 'PROCESSANDO...' : user.level === 'pro' ? 'SEU PLANO ATUAL' : user.level === 'master' ? 'JÁ INCLUSO NO MASTER' : 'VIRAR PRO AGORA'}
                    </button>
                </div>

                {/* Plano MASTER */}
                <div className={`relative bg-gradient-to-br from-[#1A1A1A] to-black border-2 ${user.level === 'master' ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.15)]' : 'border-amber-500/20'} rounded-[2.5rem] p-10 flex flex-col transition-all group overflow-hidden shadow-2xl`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
                    <h3 className="text-2xl font-bold mb-2 text-amber-500 flex items-center gap-2">
                        LucresIA Master
                        {user.level === 'master' && <span className="text-[10px] bg-amber-500 text-black px-2.5 py-1 rounded-full uppercase font-black">Ativo</span>}
                    </h3>
                    <div className="flex items-baseline gap-1 mb-10">
                        <span className="text-5xl font-black text-white tracking-tighter">R$117</span>
                        <span className="text-gray-500 font-medium">/mês</span>
                    </div>

                    <ul className="space-y-5 flex-grow mb-12">
                        {[
                            { t: 'Gerador de VÍDEOS IA (VEO)', b: 'Sua marca com visual cinematográfico.' },
                            { t: 'Mentorias Estratégicas Mensais', b: 'Aulas ao vivo para escala de faturamento.' },
                            { t: 'Integração Meta Ads Direta', b: 'Publique campanhas sem sair do app.' },
                            { t: 'Acesso Beta Prioritário', b: 'Seja a primeira a usar novas ferramentas.' }
                        ].map(f => (
                            <li key={f.t} className="flex items-start gap-4">
                                <svg className="w-5 h-5 text-amber-500 mt-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                <div>
                                    <p className="text-sm text-gray-100 font-bold leading-none mb-1">{f.t}</p>
                                    <p className="text-[10px] text-gray-500 font-medium leading-tight">{f.b}</p>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <button 
                        onClick={() => handleSubscribe('master')}
                        disabled={!!isLoading || user.level === 'master'}
                        className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest uppercase transition-all transform active:scale-95 ${user.level === 'master' ? 'bg-white/5 text-gray-500 cursor-default' : 'bg-amber-500 text-black hover:bg-amber-400 shadow-xl shadow-amber-500/20'}`}
                    >
                        {isLoading === 'master' ? 'PROCESSANDO...' : user.level === 'master' ? 'SEU PLANO ATUAL' : 'ELEVAR AO MASTER'}
                    </button>
                </div>
            </div>
            
            <div className="mt-16 flex items-center justify-center gap-2 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                Processamento Seguro via Stripe & Elevare Global
            </div>
        </div>
    );
};
