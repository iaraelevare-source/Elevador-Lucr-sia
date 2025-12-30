
import React, { useState } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { useToast } from '../Toast';
import { UserData } from '../../types';

const ContentCreation: React.FC<{ user: UserData | null }> = ({ user }) => {
    const [formData, setFormData] = useState({
        type: 'Post para Feed',
        theme: '',
        tone: user?.tone || 'Profissional',
    });
    const [generatedContent, setGeneratedContent] = useState<{ imageUrl: string; caption: string; } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.theme) {
            showToast('Por favor, defina um tema para o post.', 'error');
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            // Prompt de Imagem Contextualizado
            const imagePrompt = `Fotografia profissional de estética luxuosa, iluminação suave, foco em: ${formData.theme}. Estilo editorial para Instagram, 4k, cores que remetam a clínica ${user?.clinic || 'de estética'}.`;
            
            const imageResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [{ text: imagePrompt }] },
                config: { responseModalities: [Modality.IMAGE] },
            });
            
            let imageUrl = "";
            const firstPart = imageResponse.candidates?.[0]?.content?.parts?.find(p => 'inlineData' in p);
            if (firstPart && 'inlineData' in firstPart) {
                imageUrl = `data:image/png;base64,${firstPart.inlineData.data}`;
            }

            // Prompt de Legenda com Memória do Usuário
            const systemInstruction = `Você é a LucresIA, a mente de marketing da clínica "${user?.clinic || 'Estética Lucrativa'}".
            Sua dona é a ${user?.name || 'especialista'}. 
            O serviço principal é ${user?.service || 'Estética Geral'}.
            O tom de voz deve ser SEMPRE "${user?.tone || 'Profissional'}".
            Escreva legendas que vendem sem parecer spam, usando gatilhos de autoridade e desejo.`;
            
            const captionPrompt = `Crie uma legenda magnética para um "${formData.type}" sobre "${formData.theme}".
            Inclua:
            1. Um gancho (headline) impossível de ignorar.
            2. Corpo do texto fluido e persuasivo.
            3. Um CTA (chamada para ação) para o WhatsApp ${user?.whatsapp || ''}.
            4. 5 hashtags estratégicas no final.
            Use emojis com moderação, mas de forma elegante.`;

            const captionResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash-preview',
                contents: captionPrompt,
                config: { systemInstruction }
            });

            setGeneratedContent({
                imageUrl,
                caption: captionResponse.text,
            });

            showToast('Conteúdo gerado com estratégia!', 'success');

        } catch (err: any) {
            console.error("Gemini API error:", err);
            setError("Não consegui processar agora. Verifique sua conexão ou API.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-on-scroll is-visible">
            <header className="mb-8">
                <h1 className="text-3xl font-black text-white">Criador de Conteúdo</h1>
                <p className="text-gray-400">Gerando para: <span className="text-purple-400 font-bold">{user?.clinic}</span> ({user?.tone})</p>
            </header>

            <div className="grid lg:grid-cols-5 gap-8">
                {/* Painel de Controle */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-white/5 p-6 rounded-3xl border border-white/10 backdrop-blur-sm">
                        <form onSubmit={handleGenerate} className="space-y-5">
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">O que vamos criar?</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option>Post para Feed</option>
                                    <option>Roteiro para Reels</option>
                                    <option>Sequência de Stories (5 telas)</option>
                                    <option>Carrossel Estratégico</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Tema ou Procedimento</label>
                                <textarea 
                                    name="theme" 
                                    value={formData.theme} 
                                    onChange={handleChange} 
                                    placeholder="Ex: Por que fazer limpeza de pele no inverno? ou Promoção relâmpago de Botox" 
                                    className="w-full bg-black/40 p-3 rounded-xl border border-white/10 text-sm focus:ring-2 focus:ring-purple-500 outline-none h-24 resize-none"
                                />
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-4 rounded-xl font-black shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 transform active:scale-95">
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        LUCresIA PENSANDO...
                                    </span>
                                ) : 'GERAR CONTEÚDO MAGNÉTICO'}
                            </button>
                        </form>
                    </section>
                    
                    <div className="p-6 bg-purple-900/10 border border-purple-500/10 rounded-3xl">
                        <h4 className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-2">
                            <span className="text-lg">💡</span> Dica de Conversão
                        </h4>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                            Posts que resolvem um "medo" ou uma "dor" da sua cliente costumam converter 3x mais que posts puramente estéticos. Tente: "Como não perder o efeito do botox rápido".
                        </p>
                    </div>
                </div>
                
                {/* Visualização do Resultado */}
                <div className="lg:col-span-3 min-h-[500px]">
                    {isLoading ? (
                        <div className="h-full w-full bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center">
                            <div className="w-20 h-20 bg-purple-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <div className="w-10 h-10 bg-purple-500 rounded-full"></div>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 italic">Refinando a copy e buscando a imagem perfeita...</h3>
                            <p className="text-gray-500 text-sm max-w-xs">Isso leva alguns segundos porque eu estou criando algo único para a sua marca.</p>
                        </div>
                    ) : generatedContent ? (
                         <div className="space-y-6 animate-on-scroll is-visible">
                            <div className="bg-white/5 rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                {generatedContent.imageUrl && (
                                    <div className="aspect-square w-full overflow-hidden bg-black">
                                        <img src={generatedContent.imageUrl} alt="IA Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-4 text-[10px] font-bold text-purple-400 uppercase">
                                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-ping"></span> Sugestão de Legenda
                                    </div>
                                    <div className="bg-black/30 p-5 rounded-2xl text-sm leading-relaxed text-gray-200 whitespace-pre-wrap font-sans border border-white/5 max-h-80 overflow-y-auto custom-scrollbar">
                                        {generatedContent.caption}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button onClick={() => showToast('Em breve: Postagem Direta', 'info')} className="flex-1 bg-white text-black py-4 rounded-2xl font-black text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-2">
                                    <span className="text-lg">📲</span> POSTAR NO INSTAGRAM
                                </button>
                                <button onClick={() => {
                                    navigator.clipboard.writeText(generatedContent.caption);
                                    showToast('Legenda copiada!', 'success');
                                }} className="px-6 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all flex items-center justify-center">
                                    <span className="text-lg">📋</span>
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full w-full bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center p-12 text-center text-gray-500">
                            <span className="text-5xl mb-4 opacity-20">🎨</span>
                            <p className="text-sm font-medium">Preencha o tema ao lado para gerar <br/>sua obra-prima estratégica.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentCreation;
