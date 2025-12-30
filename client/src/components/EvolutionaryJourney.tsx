


import React, { useState, useRef, useEffect } from 'react';
import { journeyData } from '../data/journeyData';
import { StageCard } from './StageCard';

interface EvolutionaryJourneyProps {
    currentStage: number;
    onCompleteStage: (stage: number) => void;
}

export const EvolutionaryJourney: React.FC<EvolutionaryJourneyProps> = ({ currentStage, onCompleteStage }) => {
    // O estado agora é inicializado para o estágio atual do usuário, tornando-o expandido por padrão.
    const [expandedStage, setExpandedStage] = useState<number | null>(currentStage);
    const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // Garante que a matriz de refs tenha o tamanho correto
        stageRefs.current = stageRefs.current.slice(0, journeyData.length);
    }, []);

    const handleToggleExpand = (stage: number) => {
        const isOpening = expandedStage !== stage;
        setExpandedStage(isOpening ? stage : null);
        
        // Em dispositivos móveis, se um cartão for aberto, role-o para a visualização para evitar que as mudanças de layout empurrem o conteúdo para fora da tela.
        // Verificamos a largura da janela para aplicar esse comportamento apenas em telas menores.
        if (isOpening && window.innerWidth < 768) {
            // Um pequeno timeout permite que a animação de expansão comece, tornando a rolagem mais suave.
            setTimeout(() => {
                const element = stageRefs.current[stage - 1];
                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start' // Alinha o topo do cartão com o topo da viewport
                    });
                }
            }, 500); // 500ms corresponde à nova duração da animação para uma sensação mais suave.
        }
    };

    return (
        <section id="journey" className="py-16">
            <div className="space-y-6">
                {journeyData.map((item, index) => {
                    const isCompleted = item.stage < currentStage;
                    const isActive = item.stage === currentStage;
                    const isLocked = item.stage > currentStage;
                    const progress = isCompleted ? 100 : (isActive ? 25 : 0);

                    return (
                        <StageCard 
                            key={item.stage} 
                            // Fix: The ref callback function was implicitly returning a value, which is not allowed. 
                            // The assignment is now wrapped in a block statement to ensure a void return type.
                            ref={el => { stageRefs.current[index] = el; }} // Atribui ref a cada StageCard
                            {...item}
                            isLocked={isLocked}
                            progress={progress}
                            isExpanded={expandedStage === item.stage}
                            onToggleExpand={handleToggleExpand}
                            onComplete={onCompleteStage}
                            className={`animate-on-scroll delay-${(index + 1) * 100}`} 
                        />
                    );
                })}
            </div>
        </section>
    );
};