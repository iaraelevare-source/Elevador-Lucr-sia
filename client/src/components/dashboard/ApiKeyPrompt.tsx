import React from 'react';

interface ApiKeyPromptProps {
    featureName: string;
}

export const ApiKeyPrompt: React.FC<ApiKeyPromptProps> = ({ featureName }) => {
    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Recarrega a página para garantir que a nova chave de API do process.env seja captada por todos os componentes.
            window.location.reload();
        } else {
            alert("A funcionalidade de seleção de chave de API não está disponível.");
        }
    };

    return (
        <div className="h-full flex flex-col items-center justify-center text-center bg-white p-8 rounded-2xl border border-slate-200 card-shadow animate-on-scroll is-visible">
            <span className="text-6xl mb-4" role="img" aria-label="ícone de chave">🔑</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Chave de API Necessária</h1>
            <p className="text-slate-500 max-w-sm mb-6">
                Para usar o recurso "{featureName}", você precisa selecionar uma chave de API válida do Google AI Studio.
            </p>
            <button
                onClick={handleSelectKey}
                className="w-full sm:w-auto px-6 py-3 bg-amber-400 text-black rounded-lg shadow-lg font-bold text-md hover:bg-amber-300 transition-all duration-300"
            >
                Selecionar Chave de API
            </button>
            <p className="text-xs text-slate-400 mt-3">
                O uso da API pode incorrer em custos. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#7158CC]">Saiba mais sobre faturamento</a>.
            </p>
        </div>
    );
};