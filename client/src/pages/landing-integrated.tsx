import { Hero } from "@/components/Hero";
import { ComparisonTable } from "@/components/ComparisonTable";
import { GamificationFlow } from "@/components/GamificationFlow";
import { EvolvingLibrary } from "@/components/EvolvingLibrary";
import { Footer } from "@/components/Footer";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function LandingIntegrated() {
  const [, setLocation] = useLocation();
  const [timeLeft, setTimeLeft] = useState({ minutes: 47, seconds: 12 });

  // Timer de urgência
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

  const handleSubscribe = (plan: 'Pro' | 'Master') => {
    setLocation('/pricing');
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
    .animate-on-scroll {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .animate-on-scroll.is-visible {
        opacity: 1;
        transform: translateY(0);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/20">E</div>
            <div>
              <div className="font-bold text-slate-800">Elevare AI</div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">NeuroVendas</div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold">
            <a href="#recursos" className="text-slate-600 hover:text-purple-600">Recursos</a>
            <a href="#planos" className="text-purple-600 underline decoration-2 underline-offset-4">Planos Premium</a>
            <a href="/login" className="text-slate-400 hover:text-slate-900 transition-colors">Entrar</a>
            <a href="/signup" className="px-6 py-2.5 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg shadow-black/10">Teste Grátis</a>
          </div>
        </nav>
      </header>

      <main className="isolate">
        <Hero 
            onFreeStart={() => setLocation('/signup')} 
            onPremiumSubscribe={handleSubscribe} 
        />

        {/* Trust Bar */}
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

        {/* Seção ROI */}
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
                    <h4 className="text-3xl font-black text-amber-400 mb-6">A Solução Elevare AI</h4>
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
                        <p className="text-xs text-slate-400 italic">"Com a Elevare AI, meu faturamento subiu 40% em 60 dias apenas melhorando o desejo visual do meu Instagram."</p>
                        <p className="text-[10px] font-black mt-3 text-purple-400 uppercase">— Dra. Camila, Harmonização Facial</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Gamificação */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <GamificationFlow />
          </div>
        </section>

        {/* Biblioteca Evolutiva */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <EvolvingLibrary />
          </div>
        </section>

        {/* Comparação de Planos */}
        <section id="planos" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <ComparisonTable />
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}
