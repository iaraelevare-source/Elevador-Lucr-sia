import React, { useState } from 'react';
import { UserData } from '../../types';
import { GoogleGenAI, Type } from '@google/genai';

const ProfileAnalyzer: React.FC = () => {
    const [handle, setHandle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAnalyze = async () => {
        if (!handle.trim()) return;
        setIsLoading(true);
        setReport(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `Você é a LucresIA, uma IA especialista em análise de marketing para perfis de estética no Instagram. Simule uma análise do perfil fornecido. Sua resposta deve ser construtiva e acionável. Responda SEMPRE no formato JSON solicitado e não adicione markdown (\`\`\`json). A paleta de cores deve conter 5 códigos hexadecimais válidos.`;

            const prompt = `Simule uma análise do perfil do Instagram: "${handle}". Forneça um relatório com: 'palette' (um array de 5 strings de cores hexadecimais), 'toneAnalysis' (uma análise detalhada do tom de voz), e 'actionableImprovements' (um array de 3 sugestões de melhoria acionáveis).`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: {
                            palette: { type: Type.ARRAY, items: { type: Type.STRING } },
                            toneAnalysis: { type: Type.STRING },
                            actionableImprovements: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            setReport(JSON.parse(response.text));
        } catch (err) {
            console.error("Gemini API error (Analyzer):", err);
            setError("Ocorreu um erro ao analisar o perfil. Verifique o @ e tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">💡 Diagnóstico de Perfil</h2>
            <p className="text-center text-gray-600 mb-8">Receba um plano de ação estratégico da LucresIA para o seu Instagram.</p>

            <div className="max-w-2xl mx-auto robo-produtor-card p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        className="flex-grow rounded-full p-3 bg-slate-100 border border-slate-300 focus:ring-2 focus:ring-purple-400"
                        placeholder="@seuperfil"
                        disabled={isLoading}
                    />
                    <button onClick={handleAnalyze} disabled={isLoading || !handle.trim()} className="robo-produtor-button disabled:opacity-50">
                        {isLoading ? 'Analisando...' : 'Analisar Perfil'}
                    </button>
                </div>
            </div>

            {isLoading && <div className="text-center mt-6">Analisando...</div>}
            {error && <p className="mt-4 text-center font-semibold text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
            
            {report && (
                <div className="mt-8 max-w-4xl mx-auto space-y-6">
                    <div className="robo-produtor-card p-6">
                        <h3 className="font-bold text-lg mb-3">🎨 Paleta de Cores Sugerida</h3>
                        <div className="flex gap-4">
                            {report.palette.map((color: string, index: number) => (
                                <div key={index} className="text-center">
                                    <div className="w-16 h-16 rounded-full border" style={{ backgroundColor: color }}></div>
                                    <p className="text-xs mt-2 font-mono">{color}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="robo-produtor-card p-6">
                        <h3 className="font-bold text-lg mb-3">🗣️ Análise de Tom de Voz</h3>
                        <p className="text-gray-700">{report.toneAnalysis}</p>
                    </div>
                     <div className="robo-produtor-card p-6">
                        <h3 className="font-bold text-lg mb-3">🚀 Aprimoramentos Acionáveis</h3>
                        <ul className="list-disc list-inside space-y-2 text-gray-700">
                            {report.actionableImprovements.map((item: string, index: number) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


const RoboProdutorPage: React.FC<{ user: UserData | null }> = ({ user }) => {
    const [activeTool, setActiveTool] = useState('analyzer');

    const renderContent = () => {
        switch(activeTool) {
            case 'analyzer':
                return <ProfileAnalyzer />;
            // Add other tools here in the future
            default:
                return <div>Selecione uma ferramenta</div>;
        }
    };
    
    return (
        <div className="flex flex-col h-full robo-produtor-bg rounded-2xl overflow-hidden">
             <header className="bg-white/80 backdrop-blur-sm border-b p-4 text-center">
                <h1 className="text-2xl font-bold text-gray-800">LucresIA Pro</h1>
                <p className="text-sm text-gray-500">Sua central de inteligência de marketing</p>
            </header>
            <div className="flex flex-grow">
                <nav className="w-56 robo-produtor-sidebar p-4 text-white">
                    <h2 className="font-semibold mb-4">Ferramentas</h2>
                    <ul>
                        <li 
                            onClick={() => setActiveTool('analyzer')}
                            className={`p-2 rounded-lg cursor-pointer ${activeTool === 'analyzer' ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        >
                            Diagnóstico de Perfil
                        </li>
                        {/* Future tools can be added here */}
                    </ul>
                </nav>
                <main className="flex-1 overflow-y-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default RoboProdutorPage;
