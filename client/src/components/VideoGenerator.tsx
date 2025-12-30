import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';

// Fix: Removed the conflicting global declaration for `window.aistudio` to resolve type errors.
// The type is assumed to be provided by the execution environment's global type definitions.
export const VideoGenerator: React.FC = () => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [prompt, setPrompt] = useState('Um holograma de néon de um gato dirigindo em alta velocidade');
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
                setApiKeySelected(true);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume success to handle potential race condition where hasSelectedApiKey is not immediately true
            setApiKeySelected(true);
        }
    };

    const handleGenerateVideo = async () => {
        if (!prompt) {
            setError('Por favor, insira um prompt para gerar o vídeo.');
            return;
        }

        // Verificação robusta da chave de API antes de prosseguir
        if (!process.env.API_KEY) {
            setError("Nenhuma chave de API foi encontrada. Por favor, selecione uma chave para continuar.");
            setApiKeySelected(false); // Força a reexibição da UI de seleção
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        setVideoUrl(null);
        setLoadingMessage('Inicializando o gerador de vídeo...');

        try {
            // Create a new GoogleGenAI instance right before the API call
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            setLoadingMessage('Enviando prompt para o modelo Veo... Isso pode levar alguns minutos.');
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: aspectRatio
                }
            });

            setLoadingMessage('Processando o vídeo... Quase lá!');
            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            if (operation.response?.generatedVideos?.[0]?.video?.uri) {
                setLoadingMessage('Download do vídeo finalizado...');
                const downloadLink = operation.response.generatedVideos[0].video.uri;
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);

                if (!response.ok) {
                    throw new Error('Falha ao baixar o vídeo gerado.');
                }

                const videoBlob = await response.blob();
                const url = URL.createObjectURL(videoBlob);
                setVideoUrl(url);
            } else {
                throw new Error('Não foi possível encontrar o URI do vídeo na resposta.');
            }

        } catch (err: any) {
            console.error('Video generation error:', err);
            const errorMessage = err.message || 'Ocorreu um erro desconhecido.';
            setError(`Erro na geração: ${errorMessage}`);
            
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("Sua chave de API parece inválida. Por favor, selecione uma nova chave.");
                setApiKeySelected(false);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    return (
        <section id="video-generator" className="py-16 animate-on-scroll">
            <div className="bg-[#2a2a2a] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-black/30 text-[#9F8DE6] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Gerador de Vídeo com IA (Veo)</h2>
                        <p className="text-slate-400">Transforme suas ideias em vídeos curtos e impactantes para redes sociais.</p>
                    </div>
                </div>

                {!apiKeySelected ? (
                    <div className="text-center bg-black/30 p-6 rounded-lg">
                        <h3 className="font-bold text-lg text-white">Requer Chave de API</h3>
                        <p className="text-sm text-slate-400 mt-2 mb-4">Para usar o gerador de vídeo Veo, você precisa selecionar uma chave de API do Google AI Studio.</p>
                        <button onClick={handleSelectKey} className="w-full sm:w-auto px-6 py-3 bg-[#EFD8A3] text-[#1A1A1A] rounded-lg shadow-lg font-bold text-md hover:bg-yellow-300 transition-all duration-300">
                            Selecionar Chave de API
                        </button>
                        <p className="text-xs text-slate-500 mt-3">A geração de vídeo pode incorrer em custos. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#EFD8A3]">Saiba mais sobre o faturamento</a>.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="prompt" className="block text-sm font-bold text-slate-300 mb-2">Prompt (A ideia do seu vídeo)</label>
                            <textarea
                                id="prompt"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="Ex: Uma esteticista aplicando um creme dourado que brilha com magia"
                                className="w-full h-24 p-3 bg-black/30 border border-white/10 rounded-lg focus:ring-2 focus:ring-[#9F8DE6] focus:border-[#9F8DE6] transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Proporção (Aspect Ratio)</label>
                            <div className="flex gap-4">
                                <button onClick={() => setAspectRatio('16:9')} disabled={isLoading} className={`flex-1 p-3 rounded-lg border-2 transition-colors ${aspectRatio === '16:9' ? 'bg-[#9F8DE6] border-[#9F8DE6] text-white' : 'bg-black/30 border-white/20 hover:border-[#9F8DE6]'}`}>
                                    <span className="font-bold">16:9</span> (Paisagem)
                                </button>
                                <button onClick={() => setAspectRatio('9:16')} disabled={isLoading} className={`flex-1 p-3 rounded-lg border-2 transition-colors ${aspectRatio === '9:16' ? 'bg-[#9F8DE6] border-[#9F8DE6] text-white' : 'bg-black/30 border-white/20 hover:border-[#9F8DE6]'}`}>
                                    <span className="font-bold">9:16</span> (Retrato)
                                </button>
                            </div>
                        </div>

                        <button onClick={handleGenerateVideo} disabled={isLoading || !prompt} className="w-full px-8 py-4 bg-[#EFD8A3] text-[#1A1A1A] rounded-lg shadow-lg font-bold text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100">
                            {isLoading ? 'Gerando Vídeo...' : 'Gerar Vídeo'}
                        </button>

                        {isLoading && (
                            <div className="text-center p-4 bg-black/30 rounded-lg">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#EFD8A3] mx-auto"></div>
                                <p className="mt-3 font-semibold text-white">{loadingMessage}</p>
                                <p className="text-xs text-slate-400 mt-1">Este processo pode demorar alguns minutos. Por favor, não feche esta janela.</p>
                            </div>
                        )}

                        {error && <p className="text-center font-semibold text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</p>}
                        
                        {videoUrl && (
                            <div className="mt-8">
                                <h3 className="text-xl font-bold text-center mb-4 text-[#EFD8A3]">Seu Vídeo está Pronto!</h3>
                                <video src={videoUrl} controls autoPlay muted loop className="w-full rounded-lg shadow-lg"></video>
                                <div className="text-center mt-4">
                                    <a href={videoUrl} download="lucresia-video.mp4" className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg shadow-lg font-bold hover:bg-green-500 transition-colors">
                                        Baixar Vídeo
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
};
