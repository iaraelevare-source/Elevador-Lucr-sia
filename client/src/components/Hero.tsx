
import React, { useState, useRef } from 'react';

interface HeroProps {
    onFreeStart?: () => void;
    onPremiumSubscribe?: (plan: 'Pro' | 'Master') => void;
}

export const Hero: React.FC<HeroProps> = ({ onFreeStart, onPremiumSubscribe }) => {
    const [isLoading, setIsLoading] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleFreeStart = () => {
        if (onFreeStart) onFreeStart();
        else window.location.hash = '#/signup';
    };

    const handlePlayVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <section id="hero" className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
            {/* Background Decorativo */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] bg-[#9F8DE6] blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[60%] bg-[#EFD8A3] blur-[120px] rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    
                    {/* Lado Esquerdo: Texto e Ação */}
                    <div className="text-left animate-on-scroll">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-6 border border-purple-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                            </span>
                            IA TREINADA PARA ESTÉTICA
                        </div>
                        
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-6">
                            A IA que trabalha enquanto você <span className="text-[#7158CC]">fatura.</span>
                        </h1>
                        
                        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-xl leading-relaxed">
                            Automatize suas legendas, campanhas e atendimentos em segundos. A LucresIA aprende seu tom de voz e transforma o caos digital em lucro real.
                        </p>

                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <button
                                onClick={handleFreeStart}
                                className="w-full sm:w-auto px-8 py-4 bg-[#7158CC] text-white rounded-2xl shadow-xl shadow-purple-500/20 font-bold text-lg hover:bg-[#5f46b3] transition-all transform hover:-translate-y-1">
                                Começar Agora (Grátis)
                            </button>
                            <button
                                onClick={() => onPremiumSubscribe ? onPremiumSubscribe('Pro') : (window.location.hash = '#/plans')}
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-800 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all">
                                Ver Planos Premium
                            </button>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex -space-x-2">
                                {[1,2,3,4].map(i => (
                                    <img key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200" src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                                ))}
                            </div>
                            <span>+500 esteticistas lucrando com IA</span>
                        </div>
                    </div>

                    {/* Lado Direito: Vídeo Demonstrativo */}
                    <div className="relative animate-on-scroll delay-200">
                        <div className="relative group rounded-3xl overflow-hidden shadow-2xl border-[8px] border-white/50 backdrop-blur-sm bg-white/30 transition-all hover:scale-[1.02] duration-500 video-entrance video-glow">
                            
                            {/* Selo de Tempo */}
                            <div className="absolute top-4 right-4 z-20 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-2 border border-white/10">
                                <svg className="w-3 h-3 text-[#EFD8A3]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path></svg>
                                ASSISTA EM 60s
                            </div>

                            <video 
                                ref={videoRef}
                                className="w-full aspect-video object-cover cursor-pointer"
                                poster="https://images.pexels.com/photos/3985338/pexels-photo-3985338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                loop
                                playsInline
                            >
                                <source src="https://videos.pexels.com/video-files/8743919/8743919-hd_1920_1080_25fps.mp4" type="video/mp4" />
                            </video>

                            {/* Overlay de Play */}
                            {!isPlaying && (
                                <div 
                                    onClick={handlePlayVideo}
                                    className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-all cursor-pointer z-10"
                                >
                                    <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                                        <svg className="w-8 h-8 text-[#7158CC] ml-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z"></path>
                                        </svg>
                                    </div>
                                </div>
                            )}

                            {/* Legenda Flutuante */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white">
                                <p className="text-sm font-bold opacity-90">Veja como a LucresIA automatiza o marketing da sua clínica.</p>
                            </div>
                        </div>

                        {/* Elemento Decorativo flutuante */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#EFD8A3] rounded-3xl -z-10 opacity-50 blur-2xl animate-pulse"></div>
                    </div>

                </div>
            </div>
        </section>
    );
};
