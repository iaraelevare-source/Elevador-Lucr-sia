
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

interface Message {
    role: 'user' | 'bot';
    text: string;
}

export const SupportChat: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { role: 'bot', text: 'Olá! Sou a Assistente de Suporte da LucresIA. Como posso ajudar sua clínica a lucrar mais hoje?' }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: userMsg,
                config: {
                    systemInstruction: `Você é a Assistente de Suporte da LucresIA – Estética Lucrativa. 
                    Seu objetivo é ajudar donas de clínicas de estética. 
                    Regras:
                    1. Seja profissional, acolhedora e use termos do nicho de beleza.
                    2. Explique os planos: Free (4 posts/mês), Pro (Ilimitado + E-books, R$87/mês), Master (Vídeos Veo + Mentorias, R$117/mês).
                    3. Se o problema for técnico ou de pagamento, sugira falar com o suporte humano no WhatsApp: (99) 99999-9999.
                    4. Respostas curtas e diretas.`
                }
            });

            setMessages(prev => [...prev, { role: 'bot', text: response.text || 'Desculpe, tive um pequeno problema. Pode repetir?' }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', text: 'Estou com instabilidade no sinal. Se for urgente, clique no link do WhatsApp abaixo!' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Botão Flutuante */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full bg-purple-600 text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'rotate-90 bg-slate-800' : 'animate-bounce-slow'}`}
            >
                {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                )}
            </button>

            {/* Janela de Chat */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[350px] max-h-[500px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
                            <div>
                                <h4 className="font-bold text-sm">Suporte LucresIA</h4>
                                <p className="text-[10px] opacity-80 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Online agora
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Mensagens */}
                    <div ref={scrollRef} className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50 min-h-[300px] max-h-[350px] custom-scrollbar">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-xs leading-relaxed ${
                                    msg.role === 'user' 
                                    ? 'bg-purple-600 text-white rounded-br-none shadow-md' 
                                    : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'
                                }`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                    <div className="w-1 h-1 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Sua dúvida..."
                            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button type="submit" className="bg-purple-600 text-white p-2 rounded-xl hover:bg-purple-700 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                        </button>
                    </form>
                    
                    <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                        <a href="https://wa.me/5599999999999" target="_blank" rel="noopener noreferrer" className="text-[10px] text-purple-600 font-bold hover:underline">
                            Falar com humano no WhatsApp
                        </a>
                    </div>
                </div>
            )}
            
            <style>{`
                .animate-bounce-slow {
                    animation: bounce-slow 3s infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
        </div>
    );
};
