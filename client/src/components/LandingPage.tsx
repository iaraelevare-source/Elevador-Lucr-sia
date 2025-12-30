
import React, { useState, useEffect } from 'react';
import { auth, functions } from '../firebase/config';
import { PRICE_IDS } from '../config/priceIds';
import { Hero } from './Hero';

export const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ minutes: 47, seconds: 12 });

  // Simulador de contagem regressiva para urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (plan: 'Pro' | 'Master') => {
    setIsLoading(plan);
    if (!auth.currentUser) {
        window.location.hash = '#/signup';
        return;
    }
    try {
        const priceIdMap = {
            'Pro': PRICE_IDS.pro_monthly,
            'Master': PRICE_IDS.master_monthly,
        };
        const priceId = priceIdMap[plan];
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
        alert("Ocorreu um erro ao iniciar o pagamento.");
        setIsLoading(null);
    }
  };

  const landingPageStyles = `
    :root{
      --lavanda:#A36BFF;
      --lavanda-700:#7158CC;
      --dourado:#F6C86A;
      --amber-glow: rgba(246, 200, 106, 0.4);
    }
    .card-shadow{box-shadow: 0 12px 24px rgba(0,0,0,0.04);}    
    .shimmer-btn {
        position: relative;
        overflow: hidden;
    }
    .shimmer-btn::after {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: linear-gradient(to bottom right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 100%);
        transform: rotate(45deg);
        animation: shimmer 3s infinite;
    }
    @keyframes shimmer {
        0% { transform: translateX(-100%) rotate(45deg); }
        100% { transform: translateX(100%) rotate(45deg); }
    }
    .master-card {
        background: linear-gradient(145deg, #1a1a1a, #0d0d0d);
        border: 1px solid rgba(246, 200, 106, 0.2);
    }
    .master-glow {
        box-shadow: 0 0 40px var(--amber-glow);
    }
  `;

  return (
    <div className="bg-[#F6F9FB] min-h-screen font-sans text-slate-900">
      <style>{landingPageStyles}</style>
      
      {/* Banner de Escassez */}
      <div className="bg-slate-900 text-white py-2 px-4 text-center text-[10px] md:text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-4 z-50 relative">
        <span className="flex items-center gap-1">
            <span className="text-amber-400">⚡ OFERTA DE LANÇAMENTO:</span> 
            DESCONTO DE 30% NAS PRIMEIRAS 100 ASSINATURAS
        </span>
        <span className="hidden sm:block text-slate-500">|</span>
        <span className="flex items-center gap-1 font-mono">
            EXPIRA EM: <span className="text-amber-400">00:{String(timeLeft.minutes).padStart(2,'0')}:{String(timeLeft.seconds).padStart(2,'0')}</span>
        </span>
      </div>

      <header className="sticky top-0 left-0 right-0 backdrop-blur-md bg-white/70 z-40 border-b border-slate-200/50 transition-all">
        <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">L</div>
            <div>
              <div className="font-bold text-slate-800">LucresIA</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Estética & Lucro</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#recursos" className="text-slate-600 hover:text-purple-600">Recursos</a>
            <a href="#planos" className="text-purple-600 underline decoration-2 underline-offset-4">Planos Premium</a>
            <a href="#/login" className="text-slate-400 hover:text-slate-900 transition-colors">Entrar</a>
            <a href="#/signup" className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-black/10">Teste Grátis</a>
          </div>
        </nav>
      </header>

      <main className="isolate">
        <Hero 
            onFreeStart={() => window.location.hash = '#/signup'} 
            onPremiumSubscribe={handleSubscribe} 
        />

        {/* Trust Bar (Logos de Autoridade) */}
        <section className="py-12 bg-white border-y border-slate-100 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <p className="text-center text-[10px] uppercase font-black text-slate-300 tracking-[0.4em] mb-10">Tecnologia de Ponta & Estratégia de Alto Nível</p>
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <span className="font-black text-xl italic tracking-tighter">Gemini 3 Pro</span>
                    <span className="font-serif text-2xl font-bold italic tracking-tighter">Elevare Global</span>
                    <span className="font-sans text-xl font-black flex items-center gap-1">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63 1.562-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
                        Meta Strategy
                    </span>
                    <span className="font-serif text-2xl font-black italic">Stripe Secure</span>
                </div>
            </div>
        </section>

        {/* Seção ROI - O Custo do Não */}
        <section className="py-24 bg-slate-50">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
                <div className="animate-on-scroll">
                    <span className="text-red-500 font-bold text-xs uppercase tracking-widest mb-4 block">O problema invisível</span>
                    <h3 className="text-3xl md:text-5xl font-black mb-8 leading-[1.1]">Quanto custa um <span className="text-red-500">perfil amador?</span></h3>
                    <div className="space-y-6">
                        {[
                            { icon: "📉", text: "Perda de 3 a 5 pacientes por semana por falta de desejo visual." },
                            { icon: "💸", text: "Gasto médio de R$ 2.000,00 com agências que não entendem seu nicho." },
                            { icon: "⌛", text: "Sua hora clínica vale R$ 300,00. Você gasta 4h criando posts? Perda de R$ 1.200,00." }
                        ].map((item, idx) => (
                            <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-white border border-slate-200 shadow-sm transition-transform hover:scale-[1.02]">
                                <span className="text-2xl">{item.icon}</span>
                                <p className="text-sm text-slate-600 leading-relaxed font-medium">{item.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] -mr-32 -mt-32"></div>
                    <h4 className="text-3xl font-black text-amber-400 mb-6">A Solução LucresIA</h4>
                    <ul className="space-y-6">
                        <li className="flex items-start gap-4">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">✔</span>
                            <p className="text-slate-300 font-bold">Conteúdo infinito treinado com neurovendas.</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">✔</span>
                            <p className="text-slate-300 font-bold">Tom de voz de luxo para atrair público A/B.</p>
                        </li>
                        <li className="flex items-start gap-4">
                            <span className="w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">✔</span>
                            <p className="text-slate-300 font-bold">E-books e vídeos que vendem por você 24h.</p>
                        </li>
                    </ul>
                    <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                        <p className="text-xs text-slate-400 italic">"Com a LucresIA, meu faturamento subiu 40% em 60 dias apenas melhorando o desejo visual do meu Instagram."</p>
                        <p className="text-[10px] font-black mt-3 text-purple-400 uppercase">— Dra. Camila, Harmonização Facial</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Planos Premium Otimizados */}
        <section id="planos" className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16 animate-on-scroll">
            <span className="text-purple-600 font-black text-[10px] uppercase tracking-[0.3em] bg-purple-100 px-5 py-2 rounded-full mb-6 inline-block">Planos & Investimento</span>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">O investimento que se paga <span className="italic">no primeiro dia</span></h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Free */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 flex flex-col hover:border-slate-300 transition-all opacity-80 grayscale hover:grayscale-0">
              <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Modo Descoberta</h4>
              <p className="text-3xl font-black mt-3 text-slate-800 tracking-tighter">Grátis</p>
              <ul className="mt-10 text-sm text-slate-500 space-y-5 flex-grow font-medium">
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> 4 conteúdos/mês</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> Legendas Básicas</li>
                <li className="flex items-center gap-3 opacity-30">✖ Gerador de E-books</li>
              </ul>
              <div className="mt-12">
                <a href="#/signup" className="block text-center py-4 rounded-2xl bg-slate-100 text-slate-600 font-black text-sm hover:bg-slate-200 transition-all">Começar Agora</a>
              </div>
            </div>

            {/* Pro */}
            <div className="bg-white rounded-[2.5rem] p-10 border-2 border-purple-500 relative flex flex-col shadow-2xl shadow-purple-500/10 transform scale-105 z-10 transition-transform hover:scale-[1.07]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-6 py-1.5 rounded-full text-[10px] font-black shadow-lg">MAIS ESCOLHIDO</div>
              <h4 className="font-bold text-purple-600 uppercase tracking-widest text-[10px]">LucresIA Pro</h4>
              <p className="text-5xl font-black mt-3 text-slate-900 tracking-tighter">R$87<span className="text-sm font-normal text-slate-400">/mês</span></p>
              <ul className="mt-10 text-sm text-slate-700 space-y-5 flex-grow font-bold">
                <li className="flex items-center gap-3"><span className="text-purple-600 text-lg">✔</span> Posts Ilimitados</li>
                <li className="flex items-center gap-3"><span className="text-purple-600 text-lg">✔</span> IA de E-books Completa</li>
                <li className="flex items-center gap-3"><span className="text-purple-600 text-lg">✔</span> Assistente de Ads (Meta)</li>
                <li className="flex items-center gap-3"><span className="text-purple-600 text-lg">✔</span> Suporte Prioritário VIP</li>
              </ul>
              <div className="mt-12">
                 <button onClick={() => handleSubscribe('Pro')} disabled={!!isLoading} className="shimmer-btn w-full py-5 rounded-2xl bg-purple-600 text-white font-black text-lg shadow-xl shadow-purple-600/20 hover:bg-purple-700 transition-all active:scale-95">
                    {isLoading === 'Pro' ? 'PROCESSANDO...' : 'SER PRO AGORA'}
                </button>
                <div className="flex items-center justify-center gap-2 mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"></path></svg>
                    Seguro via Stripe
                </div>
              </div>
            </div>

            {/* Master */}
            <div className="master-card master-glow rounded-[2.5rem] p-10 relative flex flex-col text-white transform transition-transform hover:scale-[1.03]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-black px-6 py-1.5 rounded-full text-[10px] font-black shadow-lg">LUXO & VÍDEO</div>
              <h4 className="font-bold text-amber-500 uppercase tracking-widest text-[10px]">LucresIA Master</h4>
              <p className="text-5xl font-black mt-3 text-white tracking-tighter">R$117<span className="text-sm font-normal text-slate-500">/mês</span></p>
              <ul className="mt-10 text-sm text-slate-300 space-y-5 flex-grow">
                <li className="flex items-center gap-3"><span className="text-amber-500 font-bold">✔</span> Tudo do Plano Pro</li>
                <li className="flex items-center gap-3 font-black text-white"><span className="text-amber-500">✔</span> VEO: Gerador de Vídeos IA</li>
                <li className="flex items-center gap-3"><span className="text-amber-500 font-bold">✔</span> Mentorias Mensais</li>
                <li className="flex items-center gap-3"><span className="text-amber-500 font-bold">✔</span> Acesso Beta Vitalício</li>
              </ul>
              <div className="mt-12">
                <button onClick={() => handleSubscribe('Master')} disabled={!!isLoading} className="w-full py-5 rounded-2xl bg-white text-slate-900 font-black text-lg hover:bg-amber-50 transition-all active:scale-95 shadow-xl shadow-white/5">
                    {isLoading === 'Master' ? 'PROCESSANDO...' : 'QUERO O MASTER'}
                </button>
              </div>
            </div>
          </div>

          {/* Selo de Garantia */}
          <div className="mt-20 flex flex-col items-center">
            <div className="bg-white border border-slate-200 px-10 py-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-8 shadow-sm max-w-4xl">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-4xl font-black border border-green-100 shadow-inner">7</div>
                <div className="text-center md:text-left">
                    <h5 className="font-black text-slate-900 text-xl mb-1">Satisfação Total ou Estorno Imediato</h5>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">Assine sem medo. Se em 7 dias você achar que o marketing de luxo da LucresIA não é para você, devolvemos seu dinheiro com um clique. Zero burocracia.</p>
                </div>
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-24 bg-gradient-to-br from-purple-600 to-indigo-700 text-white text-center rounded-[4rem] mx-6 mb-16 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="relative z-10 max-w-4xl mx-auto px-6">
                <h3 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Sua clínica é um negócio, <br/>não um hobby.</h3>
                <p className="text-purple-100 text-xl mb-12 italic font-medium opacity-80">Pare de postar por postar. Comece a lucrar com inteligência.</p>
                <a href="#/signup" className="inline-block px-12 py-6 rounded-2xl bg-white text-purple-600 font-black text-2xl shadow-2xl hover:scale-105 transition-transform active:scale-95">Quero Começar Agora</a>
            </div>
        </section>
      </main>

      <footer className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">L</div>
            <span className="font-bold text-slate-800 tracking-tighter">LucresIA</span>
          </div>
          <div className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.3em]">
             © 2025 Elevare Global • Inteligência Estética Aplicada
          </div>
          <div className="flex gap-8 text-xs font-bold text-slate-400">
            <a href="#" className="hover:text-purple-600">Termos</a>
            <a href="#" className="hover:text-purple-600">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
