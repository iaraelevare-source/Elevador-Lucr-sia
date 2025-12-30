import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ApiKeyPrompt } from './ApiKeyPrompt';
import { CampaignAssistantSkeleton } from './skeletons';
import { UserData } from '../../types';

interface CampaignPackage {
    adCopy: string;
    creativeSuggestion: string;
    audience: {
        location: string;
        age: string;
        gender: string;
        interests: string;
    };
    budget: {
        recommendation: string;
        duration: string;
    };
}

const ResultCard: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
        <h4 className="font-bold text-amber-600 text-sm uppercase tracking-wider mb-2">{title}</h4>
        <div className="text-slate-700 text-sm">{children}</div>
    </div>
);

export const CampaignAssistant: React.FC<{ user: UserData | null }> = ({ user }) => {
    const [objective, setObjective] = useState('Promover limpeza de pele para o Dia das Mães');
    const [isLoading, setIsLoading] = useState(false);
    const [campaignPackage, setCampaignPackage] = useState<CampaignPackage | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState<string|null>(null);

    // Verifica a chave de API antes de renderizar o componente
    if (!process.env.API_KEY) {
        return <ApiKeyPrompt featureName="Assistente de Campanhas Meta" />;
    }

    const handleGenerate = async () => {
        if (!objective.trim()) return;
        setIsLoading(true);
        setCampaignPackage(null);
        setError(null);
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const systemInstruction = `Você é a LucresIA, uma IA especialista em marketing e tráfego pago para o nicho de estética. Sua missão é criar pacotes de campanha para o Meta Ads (Facebook/Instagram) que sejam completos, estratégicos e fáceis de implementar.
            - Clínica/Marca: ${user?.clinic || 'Clínica de Estética'}
            - Tom de Voz: ${user?.tone || 'Profissional e acolhedor'}
            - Responda SEMPRE no formato JSON solicitado. Não adicione markdown (\`\`\`json) ou qualquer outra formatação ao redor do JSON.`;

            const prompt = `Crie um pacote de campanha completo para o Meta Ads com o seguinte objetivo: "${objective}".
            O pacote deve incluir:
            1.  'adCopy': um texto de anúncio (copy) persuasivo e direto.
            2.  'creativeSuggestion': uma sugestão clara para o criativo (imagem ou vídeo).
            3.  'audience': uma sugestão detalhada de público-alvo (localização, idade, gênero e interesses). Use "Sua cidade +15km" para localização.
            4.  'budget': uma recomendação de orçamento diário em R$ e duração da campanha em dias.`;
            
            const campaignSchema = {
                type: Type.OBJECT,
                properties: {
                    adCopy: { type: Type.STRING, description: "Texto persuasivo para o anúncio." },
                    creativeSuggestion: { type: Type.STRING, description: "Sugestão de imagem ou vídeo para o anúncio." },
                    audience: {
                        type: Type.OBJECT,
                        properties: {
                            location: { type: Type.STRING, description: "Localização do público-alvo." },
                            age: { type: Type.STRING, description: "Faixa etária do público." },
                            gender: { type: Type.STRING, description: "Gênero do público." },
                            interests: { type: Type.STRING, description: "Interesses e comportamentos do público." },
                        },
                        required: ["location", "age", "gender", "interests"]
                    },
                    budget: {
                        type: Type.OBJECT,
                        properties: {
                            recommendation: { type: Type.STRING, description: "Orçamento diário recomendado em Reais (R$)." },
                            duration: { type: Type.STRING, description: "Duração recomendada da campanha em dias." },
                        },
                        required: ["recommendation", "duration"]
                    }
                },
                required: ["adCopy", "creativeSuggestion", "audience", "budget"]
            };

             const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: campaignSchema,
                }
            });
            
            const jsonResponse = JSON.parse(response.text);
            setCampaignPackage(jsonResponse);

        } catch (err) {
            console.error("Gemini API error (Campaign):", err);
            setError("Ocorreu um erro ao gerar a campanha. Tente novamente ou verifique sua chave de API.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        if(campaignPackage?.adCopy) {
            navigator.clipboard.writeText(campaignPackage.adCopy);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    }

    return (
        <div className="animate-on-scroll is-visible">
            <h1 className="text-3xl font-extrabold text-slate-900 mb-6">🎯 Assistente de Campanhas Meta</h1>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 card-shadow">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="objective" className="block text-sm font-bold text-slate-600 mb-2">Qual o objetivo da sua campanha?</label>
                        <textarea
                            id="objective"
                            value={objective}
                            onChange={(e) => setObjective(e.target.value)}
                            placeholder="Ex: Promover meu novo protocolo de hidratação para o inverno."
                            className="w-full h-24 p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9F8DE6] transition-colors"
                            disabled={isLoading}
                        />
                    </div>
                    <button 
                        onClick={handleGenerate} 
                        disabled={isLoading || !objective.trim()} 
                        className="w-full sm:w-auto px-6 py-3 bg-[#9F8DE6] text-white rounded-lg font-bold hover:bg-violet-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Gerando Pacote de Campanha...' : 'Gerar Pacote de Campanha'}
                    </button>
                </div>
            </div>

            {isLoading ? (
                <CampaignAssistantSkeleton />
            ) : error ? (
                <div className="mt-6 text-center bg-red-100 p-4 rounded-lg text-sm text-red-700 font-semibold">
                    {error}
                </div>
            ) : campaignPackage && (
                <div className="mt-8 animate-on-scroll is-visible">
                     <h2 className="text-2xl font-bold text-slate-900 mb-4">Seu Pacote de Campanha está pronto!</h2>
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <ResultCard title="Texto do Anúncio (Copy)">
                                <p className="whitespace-pre-wrap">{campaignPackage.adCopy}</p>
                                <button onClick={handleCopy} className="mt-3 px-4 py-1.5 bg-amber-400 text-black rounded-full text-xs font-bold hover:bg-amber-300 transition-colors">
                                    {copySuccess ? 'Copiado!' : 'Copiar Texto'}
                                </button>
                            </ResultCard>
                             <ResultCard title="Sugestão de Criativo (Imagem/Vídeo)">
                                <p>{campaignPackage.creativeSuggestion}</p>
                            </ResultCard>
                        </div>
                         <div className="space-y-6">
                            <ResultCard title="Sugestão de Público-Alvo">
                               <ul className="space-y-1">
                                    <li><strong>Localização:</strong> {campaignPackage.audience.location}</li>
                                    <li><strong>Idade:</strong> {campaignPackage.audience.age}</li>
                                    <li><strong>Gênero:</strong> {campaignPackage.audience.gender}</li>
                                    <li><strong>Interesses:</strong> {campaignPackage.audience.interests}</li>
                               </ul>
                            </ResultCard>
                             <ResultCard title="Sugestão de Orçamento">
                                 <p><strong>Recomendação:</strong> {campaignPackage.budget.recommendation}</p>
                                 <p><strong>Duração Sugerida:</strong> {campaignPackage.budget.duration}</p>
                            </ResultCard>
                        </div>
                     </div>
                      <div className="mt-6 text-center bg-slate-100 p-4 rounded-lg text-sm text-slate-600 border border-slate-200">
                        <strong>Próximo passo:</strong> Copie estas informações e cole nos campos correspondentes dentro do seu Gerenciador de Anúncios do Meta.
                    </div>
                </div>
            )}

        </div>
    );
};

// Fix: Add default export for lazy loading.
export default CampaignAssistant;
