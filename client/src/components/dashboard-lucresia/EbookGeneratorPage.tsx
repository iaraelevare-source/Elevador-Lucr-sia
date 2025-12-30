
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { UserData } from '../../types';
import { useToast } from '../Toast';

export const EbookGeneratorPage: React.FC<{ user: UserData | null }> = ({ user }) => {
    const [activeTab, setActiveTab] = useState<'content' | 'cover'>('content');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    // Estados de Conteúdo
    const [contentForm, setContentForm] = useState({
        theme: '',
        tone: user?.tone || 'Profissional',
        chapters: '5',
    });
    const [generatedDraft, setGeneratedDraft] = useState('');

    // Estados de Capa
    const [coverForm, setCoverForm] = useState({
        title: '',
        description: 'Estilo minimalista e luxuoso, iluminação suave, elementos de estética premium.',
    });
    const [generatedCover, setGeneratedCover] = useState<string | null>(null);

    const handleGenerateContent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!contentForm.theme) return showToast('Defina um tema para o e-book.', 'error');
        
        setIsLoading(true);
        setGeneratedDraft('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Gere um rascunho detalhado de um e-book sobre "${contentForm.theme}". 
            O tom de voz deve ser "${contentForm.tone}". 
            Estruture o conteúdo em exatamente ${contentForm.chapters} capítulos, incluindo Introdução e Conclusão. 
            Use títulos chamativos e parágrafos persuasivos focados no mercado de estética.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: {
                    systemInstruction: `Você é a LucresIA, uma Ghostwriter especialista em marketing para estética. 
                    Seu objetivo é criar conteúdos de e-books que posicionem a clínica "${user?.clinic || 'do usuário'}" como autoridade absoluta.`,
                }
            });

            setGeneratedDraft(response.text || '');
            showToast('Rascunho do e-book gerado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao gerar conteúdo. Tente novamente.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateCover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!coverForm.title) return showToast('O e-book precisa de um título para a capa.', 'error');

        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Capa de e-book profissional para o nicho de estética. 
            Título central: "${coverForm.title}". 
            Contexto visual: ${coverForm.description}. 
            Alta qualidade, 4k, design editorial de luxo.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-image-preview',
                contents: { parts: [{ text: prompt }] },
                config: {
                    imageConfig: {
                        aspectRatio: "3:4",
                        imageSize: "1K"
                    }
                }
            });

            const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (imagePart?.inlineData) {
                setGeneratedCover(`data:image/png;base64,${imagePart.inlineData.data}`);
                showToast('Capa cinematográfica gerada!', 'success');
            }
        } catch (error) {
            console.error(error);
            showToast('Erro ao gerar capa. Verifique sua chave de API.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedDraft);
        showToast('Conteúdo copiado!', 'success');
    };

    return (
        <div className="animate-on-scroll is-visible space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Gerador de E-books IA</h1>
                    <p className="text-gray-400">Transforme seu conhecimento em um produto digital lucrativo em minutos.</p>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                    <button 
                        onClick={() => setActiveTab('content')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'content' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Conteúdo
                    </button>
                    <button 
                        onClick={() => setActiveTab('cover')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'cover' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                    >
                        Capa
                    </button>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Painel de Configuração */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm">
                        {activeTab === 'content' ? (
                            <form onSubmit={handleGenerateContent} className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Tema do E-book</label>
                                    <textarea 
                                        value={contentForm.theme}
                                        onChange={e => setContentForm({...contentForm, theme: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Ex: Guia de Cuidados Pós-Botox: Como manter o resultado por mais tempo"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Capítulos</label>
                                        <select 
                                            value={contentForm.chapters}
                                            onChange={e => setContentForm({...contentForm, chapters: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option value="3">3 Curtos</option>
                                            <option value="5">5 Padrão</option>
                                            <option value="8">8 Completo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Tom de Voz</label>
                                        <select 
                                            value={contentForm.tone}
                                            onChange={e => setContentForm({...contentForm, tone: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        >
                                            <option>Profissional</option>
                                            <option>Acolhedor</option>
                                            <option>Luxo</option>
                                            <option>Didático</option>
                                        </select>
                                    </div>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-500/10 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? 'LUCresIA ESCREVENDO...' : 'ESCREVER E-BOOK'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleGenerateCover} className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Título na Capa</label>
                                    <input 
                                        type="text"
                                        value={coverForm.title}
                                        onChange={e => setCoverForm({...coverForm, title: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Ex: O Segredo da Pele Perfeita"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-500 mb-2 block">Descrição Visual</label>
                                    <textarea 
                                        value={coverForm.description}
                                        onChange={e => setCoverForm({...coverForm, description: e.target.value})}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm h-32 resize-none focus:ring-2 focus:ring-purple-500 outline-none"
                                        placeholder="Descreva as cores, elementos e estilo..."
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-4 rounded-xl shadow-lg shadow-purple-500/10 transition-all transform active:scale-95 disabled:opacity-50"
                                >
                                    {isLoading ? 'DESENHANDO CAPA...' : 'GERAR CAPA 4K'}
                                </button>
                            </form>
                        )}
                    </div>
                    
                    <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-3xl">
                        <p className="text-[11px] text-amber-200/80 leading-relaxed italic">
                            "Um e-book é o melhor 'Ímã de Leads'. Ofereça-o em troca do contato da cliente e construa uma lista de pacientes altamente qualificada."
                        </p>
                    </div>
                </div>

                {/* Área de Preview */}
                <div className="lg:col-span-8">
                    {activeTab === 'content' ? (
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-[500px] flex flex-col shadow-2xl">
                            <div className="bg-black/40 p-4 border-b border-white/10 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Preview do Conteúdo</span>
                                {generatedDraft && (
                                    <button onClick={copyToClipboard} className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2">
                                        📋 Copiar Texto
                                    </button>
                                )}
                            </div>
                            <div className="flex-1 p-8 overflow-y-auto max-h-[600px] custom-scrollbar">
                                {isLoading ? (
                                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                                        <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                                        <p className="text-gray-500 text-sm animate-pulse">A IA está estruturando seu conhecimento...</p>
                                    </div>
                                ) : generatedDraft ? (
                                    <article className="prose prose-invert max-w-none">
                                        <div className="whitespace-pre-wrap font-sans text-gray-200 leading-relaxed">
                                            {generatedDraft}
                                        </div>
                                    </article>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                                        <span className="text-6xl mb-4">📖</span>
                                        <p className="max-w-xs">Preencha o tema ao lado e deixe a LucresIA escrever seu e-book.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden min-h-[500px] flex flex-col items-center justify-center p-8 shadow-2xl">
                             {isLoading ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto">
                                        <div className="w-8 h-8 bg-purple-500 rounded-full animate-ping"></div>
                                    </div>
                                    <p className="text-gray-500 text-sm animate-pulse italic">Criando arte cinematográfica em 4K...</p>
                                </div>
                            ) : generatedCover ? (
                                <div className="relative group max-w-md w-full">
                                    <img src={generatedCover} alt="Capa gerada" className="rounded-2xl shadow-2xl w-full border border-white/10" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4 rounded-2xl backdrop-blur-sm">
                                        <a href={generatedCover} download={`${coverForm.title || 'capa'}-lucresia.png`} className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                                            Baixar Capa
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center opacity-20">
                                    <span className="text-6xl mb-4 block">🖼️</span>
                                    <p className="max-w-xs">Sua capa de e-book de alto padrão aparecerá aqui.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EbookGeneratorPage;
