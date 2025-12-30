import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useToast } from '../Toast';
import { ApiKeyPrompt } from './ApiKeyPrompt';
import { FeedAnalyzerSkeleton } from './skeletons';
import { UserData } from '../../types';

const Calculator: React.FC = () => {
    const [inputs, setInputs] = useState({ material: '', time: '', hour: '40', profit: '40', name: '', whats: '' });
    const [result, setResult] = useState({ price: '', note: '' });
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({ name: '', whats: '' });

    const validateField = (name: string, value: string) => {
        let error = '';
        if (name === 'name') {
            if (!value.trim()) error = 'Nome é obrigatório.';
        } else if (name === 'whats') {
            const digits = value.replace(/\D/g, '');
            if (digits.length < 10 || digits.length > 13) error = 'WhatsApp inválido.';
        }
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setInputs({ ...inputs, [id]: value });
        if (id === 'name' || id === 'whats') validateField(id, value);
    };
    
    const handleCalculate = () => {
        validateField('name', inputs.name);
        validateField('whats', inputs.whats);

        const nameIsValid = inputs.name.trim().length > 0;
        const whatsDigits = inputs.whats.replace(/\D/g, '');
        const whatsIsValid = whatsDigits.length >= 10 && whatsDigits.length <= 13;

        if (!nameIsValid || !whatsIsValid) {
            setMessage('Por favor, corrija os erros para liberar o resultado.');
            setResult({ price: '', note: '' });
            return;
        }
        
        setMessage('');
        const material = parseFloat(inputs.material) || 0;
        const timeMin = parseFloat(inputs.time) || 0;
        const hourCost = parseFloat(inputs.hour) || 0;
        const profitPct = parseFloat(inputs.profit) || 0;

        const labor = (timeMin / 60) * hourCost;
        const base = material + labor;
        const price = base * (1 + profitPct / 100);
        const priceRounded = Math.ceil(price * 100) / 100;

        let note = 'Use CTA: "Agende sua avaliação gratuita" + foco em transformação.';
        if (profitPct >= 60) note = 'Posicione como premium: foque em resultados e explique o valor.';
        else if (profitPct <= 20) note = 'Posicione como acessível: destaque custo-benefício.';

        setResult({ price: `R$ ${priceRounded.toFixed(2).replace('.', ',')}`, note });
        setMessage('Resultado calculado com sucesso!');
    };

    return (
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 card-shadow">
            <h3 className="text-2xl font-bold text-slate-900">Calculadora de Procedimentos</h3>
            <p className="mt-2 text-slate-600">Calcule o preço sugerido do seu procedimento. Resultado liberado após preencher nome e WhatsApp.</p>
            <div className="mt-6 grid md:grid-cols-2 gap-4">
                <div><label htmlFor="material" className="text-xs text-slate-500">Custo do material (R$)</label><input id="material" type="number" onChange={handleChange} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" placeholder="Ex: 12.50" /></div>
                <div><label htmlFor="time" className="text-xs text-slate-500">Tempo do procedimento (min)</label><input id="time" type="number" onChange={handleChange} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" placeholder="Ex: 60" /></div>
                <div><label htmlFor="hour" className="text-xs text-slate-500">Custo da sua hora (R$)</label><input id="hour" type="number" onChange={handleChange} value={inputs.hour} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" /></div>
                <div><label htmlFor="profit" className="text-xs text-slate-500">Margem de lucro desejada (%)</label><input id="profit" type="number" onChange={handleChange} value={inputs.profit} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" /></div>
                <div className="md:col-span-2 grid md:grid-cols-2 gap-4 mt-2">
                    <div>
                        <label htmlFor="name" className="text-xs text-slate-500">Seu nome completo</label>
                        <input id="name" type="text" onChange={handleChange} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="whats" className="text-xs text-slate-500">Seu WhatsApp</label>
                        <input id="whats" type="tel" onChange={handleChange} className="mt-1 block w-full rounded-lg p-3 bg-slate-100 border border-slate-300" />
                        {errors.whats && <p className="text-xs text-red-600 mt-1">{errors.whats}</p>}
                    </div>
                </div>
                <div className="md:col-span-2 flex gap-3 items-center mt-2">
                    <button type="button" onClick={handleCalculate} className="px-5 py-3 btn-primary rounded-lg font-semibold">Calcular Preço</button>
                    {message && <div className={`text-sm ${result.price ? 'text-green-600' : 'text-amber-600'}`}>{message}</div>}
                </div>
            </div>
            {result.price && <div className="mt-6 p-4 rounded-lg border border-slate-200 bg-slate-50"><div className="text-slate-600">Preço ideal sugerido:</div><div className="text-3xl font-bold mt-1 text-slate-900">{result.price}</div><div className="text-sm text-slate-500 mt-2">Sugestão de posicionamento:</div><div className="mt-2 text-slate-700">{result.note}</div></div>}
        </div>
    );
};

const Store: React.FC = () => {
    const { showToast } = useToast();
    const products = [
        { title: "Guia Storytelling Estético", desc: "Como contar histórias que convertem.", status: "Grátis", action: "Baixar Agora", type: 'free' },
        { title: "Banco de Hashtags Segmentadas", desc: "Listas por serviço e cidade.", status: "60 pts", action: "Liberar com 60 pts", type: 'points' },
        { title: "Template Visual Premium (Canva)", desc: "Pack de 8 artes editáveis.", status: "R$27", action: "Comprar R$27", type: 'buy' },
    ];
    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900">Conteúdos Exclusivos — Elevare Store</h2><p className="text-sm text-slate-500">Materiais prontos para usar ou desbloquear com pontos</p>
            <div className="mt-6 grid md:grid-cols-2 gap-6">
                {products.map(p => (
                    <div key={p.title} className="bg-white border border-slate-200 p-5 rounded-2xl card-shadow">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="text-lg font-semibold text-slate-800">{p.title}</div>
                                <div className="text-sm text-slate-500 mt-1">{p.desc}</div>
                            </div>
                            <span className="text-sm px-2 py-1 rounded-md bg-slate-200 text-slate-700 font-semibold">{p.status}</span>
                        </div>
                        <div className="mt-4">
                            <button className={`w-full px-3 py-2 rounded-lg text-sm font-semibold ${p.type === 'buy' ? 'bg-amber-400 text-black' : 'bg-violet-600 text-white'}`} onClick={() => showToast(`Ação: ${p.action}`, 'info')}>{p.action}</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const FeedAnalyzer: React.FC = () => {
    const [handle, setHandle] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [report, setReport] = useState<any | null>(null);
    const [error, setError] = useState<string|null>(null);

    if (!process.env.API_KEY) {
        return <ApiKeyPrompt featureName="Análise de Perfil do Instagram" />;
    }

    const handleAnalyze = async () => {
        if (!handle.trim()) return;
        setIsLoading(true);
        setReport(null);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const systemInstruction = `Você é a LucresIA, uma IA especialista em análise de marketing para perfis de estética no Instagram. Simule uma análise do perfil fornecido. Sua resposta deve ser construtiva e acionável. Responda SEMPRE no formato JSON solicitado e não adicione markdown (\`\`\`json).`;

            const prompt = `Simule uma análise do perfil do Instagram: "${handle}". Forneça um relatório com: 'palette', 'tone', 'contentSuggestions' (array de objetos com 'suggestion', 'example', 'icon'), e 'visualImprovements'.`;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT, properties: { palette: { type: Type.STRING }, tone: { type: Type.STRING }, contentSuggestions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { suggestion: { type: Type.STRING }, example: { type: Type.STRING }, icon: { type: Type.STRING } } } }, visualImprovements: { type: Type.STRING } }
                    }
                }
            });

            setReport(JSON.parse(response.text));
        } catch (err) {
            console.error("Gemini API error (Analyzer):", err);
            setError("Ocorreu um erro ao analisar o perfil.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl p-6 card-shadow">
            <h3 className="text-2xl font-bold text-slate-900">Análise de Perfil do Instagram com IA</h3>
            <p className="mt-2 text-slate-600">Receba um diagnóstico estratégico da LucresIA.</p>
            
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} className="flex-grow rounded-lg p-3 bg-slate-100 border border-slate-300" placeholder="@seuperfil" disabled={isLoading} />
                <button onClick={handleAnalyze} disabled={isLoading || !handle.trim()} className="px-5 py-3 btn-primary rounded-lg font-semibold disabled:opacity-50">
                    {isLoading ? 'Analisando...' : 'Analisar Perfil'}
                </button>
            </div>

            {isLoading ? <FeedAnalyzerSkeleton /> : error ? <p className="mt-4 text-center font-semibold text-red-600 bg-red-100 p-3 rounded-lg">{error}</p> : report && (
                <div className="mt-6 space-y-4 animate-on-scroll is-visible">
                     <h4 className="text-xl font-bold text-center text-amber-600">Relatório de Diagnóstico</h4>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="font-bold flex items-center gap-2 text-slate-800">🎨 Paleta de Cores</h5>
                        <p className="text-sm text-slate-600 mt-1">{report.palette}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="font-bold flex items-center gap-2 text-slate-800">🗣️ Tom de Voz</h5>
                        <p className="text-sm text-slate-600 mt-1">{report.tone}</p>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="font-bold flex items-center gap-2 text-slate-800">💡 Sugestões de Conteúdo</h5>
                        <div className="mt-2 space-y-3">
                            {report.contentSuggestions.map((s: any, i: number) => (
                                 <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-md border border-slate-200">
                                    <span className="text-2xl mt-1">{s.icon}</span>
                                    <div>
                                        <p className="font-semibold text-slate-700">{s.suggestion}</p>
                                        <p className="text-xs text-slate-500 mt-1 italic"><strong>Exemplo:</strong> "{s.example}"</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                     </div>
                     <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <h5 className="font-bold flex items-center gap-2 text-slate-800">👀 Melhorias Visuais</h5>
                        <p className="text-sm text-slate-600 mt-1">{report.visualImprovements}</p>
                     </div>
                </div>
            )}
        </div>
    );
};

export const Tools: React.FC<{ user: UserData | null }> = () => {
    const [activeTab, setActiveTab] = useState('calculator');

    const renderTool = () => {
        switch (activeTab) {
            case 'store': return <Store />;
            case 'analyzer': return <FeedAnalyzer />;
            case 'calculator':
            default:
                return <Calculator />;
        }
    };

    return (
        <div className="animate-on-scroll is-visible">
             <h1 className="text-3xl font-extrabold text-slate-900 mb-6">Ferramentas de Crescimento</h1>
             <div className="p-2 bg-slate-100 rounded-xl flex gap-2 mb-8 max-w-md mx-auto">
                <button onClick={() => setActiveTab('calculator')} className={`dashboard-tab flex-1 ${activeTab === 'calculator' ? 'active' : ''}`}>Calculadora</button>
                <button onClick={() => setActiveTab('store')} className={`dashboard-tab flex-1 ${activeTab === 'store' ? 'active' : ''}`}>Loja</button>
                <button onClick={() => setActiveTab('analyzer')} className={`dashboard-tab flex-1 ${activeTab === 'analyzer' ? 'active' : ''}`}>Analisador</button>
             </div>
             {renderTool()}
        </div>
    );
};

export default Tools;
