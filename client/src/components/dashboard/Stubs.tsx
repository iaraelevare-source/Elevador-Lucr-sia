import React, { useState } from 'react';
import { auth, db, functions } from '../../firebase/config';
import { UserData } from '../../types';
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { PRICE_IDS } from '../../config/priceIds';

interface ProfileProps {
    user: UserData | null;
    setActivePage: (page: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setActivePage }) => {

    const handleCancelSubscription = async () => {
        if (window.confirm("Tem certeza que deseja cancelar sua assinatura Premium? Você perderá acesso a todos os recursos exclusivos.")) {
            console.log("Simulando chamada para o backend para cancelar a assinatura...");
            alert("Sua assinatura foi cancelada (Simulação). Em um app real, isso seria confirmado via webhook do Stripe.");
            if (auth.currentUser) {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                await updateDoc(userDocRef, {
                    level: 'free',
                    subscriptionStartDate: null
                });
            }
        }
    };
    
    const formatDate = (dateValue?: string | Timestamp | null) => {
        if (!dateValue) return 'N/A';
        const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue.toDate();
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    };

    if (!user) {
        return (
             <div className="flex items-center justify-center h-full">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9F8DE6]"></div>
            </div>
        )
    }

    return (
        <div className="animate-on-scroll is-visible">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Perfil e Assinatura</h1>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Detalhes da Conta</h2>
                    <div className="space-y-3 text-sm">
                        <p><strong className="text-slate-500 w-32 inline-block">Nome:</strong> <span className="text-slate-800">{user.name}</span></p>
                        <p><strong className="text-slate-500 w-32 inline-block">Email:</strong> <span className="text-slate-800">{user.email}</span></p>
                        <p><strong className="text-slate-500 w-32 inline-block">Clínica/Marca:</strong> <span className="text-slate-800">{user.clinic || 'Não informado'}</span></p>
                        <p><strong className="text-slate-500 w-32 inline-block">Tom de Voz:</strong> <span className="text-slate-800">{user.tone || 'Padrão'}</span></p>
                    </div>
                     <button className="mt-6 text-sm px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-semibold transition-colors">Editar Perfil (em breve)</button>
                </div>

                 <div className="bg-white p-8 rounded-2xl border border-slate-200 card-shadow">
                    <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Assinatura</h2>
                    {user.level !== 'free' ? (
                        <div className="space-y-3 text-sm">
                            <p><strong className="text-slate-500 w-32 inline-block">Plano Atual:</strong> <span className="font-bold text-amber-600 capitalize">{user.level}</span></p>
                            <p><strong className="text-slate-500 w-32 inline-block">Status:</strong> <span className="font-bold text-green-600">Ativo</span></p>
                            <p><strong className="text-slate-500 w-32 inline-block">Membro desde:</strong> <span className="text-slate-800">{formatDate(user.subscriptionStartDate)}</span></p>
                            <button 
                                onClick={handleCancelSubscription}
                                className="w-full sm:w-auto mt-6 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors"
                            >
                                Cancelar Assinatura
                            </button>
                        </div>
                    ) : (
                         <div className="text-center">
                            <p className="text-slate-600 mb-4">Você está no plano <strong>Gratuito</strong>. Libere todo o potencial da LucresIA!</p>
                            <button 
                                onClick={() => setActivePage('plans')}
                                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-opacity"
                            >
                                ✨ Fazer Upgrade
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-start">
        <svg className="w-5 h-5 mr-3 mt-1 text-[#9F8DE6] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
        </svg>
        <span className="text-slate-600">{children}</span>
    </li>
);

export const Plans: React.FC = () => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

    const handleSubscribe = async (plan: 'Pro' | 'Master') => {
        setIsLoading(plan);
        try {
            const priceIdMap = {
                monthly: {
                    'Pro': PRICE_IDS.pro_monthly,
                    'Master': PRICE_IDS.master_monthly,
                },
                annual: {
                    'Pro': PRICE_IDS.pro_annual,
                    'Master': PRICE_IDS.master_annual,
                }
            };
            const priceId = priceIdMap[billingCycle][plan];

            const createStripeCheckout = functions.httpsCallable('createStripeCheckout');
            const result = await createStripeCheckout({
                priceId: priceId,
                successUrl: `${window.location.origin}${window.location.pathname}#/payment/success`,
                cancelUrl: `${window.location.origin}${window.location.pathname}#/payment/cancel`,
            });
            
            const { url } = result.data as { url: string };
            window.location.href = url;

        } catch (error) {
            console.error("Stripe checkout error:", error);
            alert("Ocorreu um erro ao iniciar o pagamento. Por favor, tente novamente.");
            setIsLoading(null);
        }
    };
    
    const plansData = [
        {
            name: 'Pro',
            priceMonthly: '87',
            priceAnnual: '72,50',
            annualBilling: '870',
            color: 'amber',
            features: [
                'Geração de conteúdo ilimitada',
                'Biblioteca estratégica completa',
                'Criação automática de E-books',
                'Criação de campanhas de marketing',
                'LucresIA Mentora (modo CEO)',
            ],
            cta: 'Virar Pro',
            isPopular: true,
            planId: 'Pro',
            buttonClass: 'bg-amber-400 text-black hover:bg-amber-300'
        },
        {
            name: 'Master',
            priceMonthly: '117',
            priceAnnual: '97,50',
            annualBilling: '1170',
            color: 'slate',
            features: [
                'Tudo do Pro',
                'Criação de vídeos com IA (em breve)',
                'Integração com Meta Business',
                'Acesso a mentorias e mini-cursos',
            ],
            cta: 'Virar Master',
            planId: 'Master',
            buttonClass: 'bg-violet-600 text-white hover:bg-violet-700'
        },
    ];


    return (
        <div className="animate-on-scroll is-visible">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 text-center mb-4">Escolha o plano que acelera seu lucro</h1>
            <p className="text-center text-slate-500 max-w-2xl mx-auto mb-12">Menos que o valor de uma limpeza de pele — mais que um salto de autoridade.</p>

            <div className="flex justify-center items-center gap-4 mb-10">
                <span className={`font-semibold transition-colors ${billingCycle === 'monthly' ? 'text-violet-700' : 'text-slate-500'}`}>
                    Pagamento Mensal
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={billingCycle === 'annual'}
                        onChange={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')} 
                    />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-violet-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div>
                </label>
                <div className="relative">
                    <span className={`font-semibold transition-colors ${billingCycle === 'annual' ? 'text-violet-700' : 'text-slate-500'}`}>
                        Pagamento Anual
                    </span>
                     <span className="absolute -top-5 -right-2 transform translate-x-full inline-block bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                        Economize 2 meses
                    </span>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
                {plansData.map(plan => (
                    <div key={plan.name} className={`bg-white p-8 rounded-2xl border flex flex-col card-shadow ${plan.isPopular ? 'border-amber-400' : 'border-slate-200'}`}>
                        {plan.isPopular && (
                            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                <span className="inline-block bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-sm font-bold">MAIS COMPLETO</span>
                            </div>
                        )}
                        <h3 className={`text-2xl font-bold text-${plan.color}-500`}>LucresIA {plan.name}</h3>
                        <div className="my-4">
                            <span className="text-5xl font-black text-slate-900">
                                R${billingCycle === 'monthly' ? plan.priceMonthly : plan.priceAnnual}
                            </span>
                            <span className="text-lg font-bold text-slate-500">/mês</span>
                            {billingCycle === 'annual' && <p className="text-sm text-slate-500 mt-1">Cobrado R${plan.annualBilling} anualmente</p>}
                        </div>
                        <ul className="space-y-3 text-left my-6 flex-grow">
                            {plan.features.map(feature => <PlanFeature key={feature}>{feature}</PlanFeature>)}
                        </ul>
                        <button 
                            onClick={() => handleSubscribe(plan.planId as 'Pro' | 'Master')} 
                            disabled={!!isLoading}
                            className={`w-full mt-6 px-6 py-4 rounded-lg font-bold text-lg transition-colors disabled:opacity-70 ${plan.buttonClass}`}
                        >
                            {isLoading === plan.planId ? 'Processando...' : plan.cta}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};