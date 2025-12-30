import React from 'react';
import { StoriesChecklist } from './StoriesChecklist';

// Reusable Chevron Icon for the accordion functionality
const ChevronIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 chevron-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);

// Checkmark Icon for completed stages - now more prominent
const CheckmarkIcon: React.FC = () => (
    <span title="Concluído" className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white shrink-0 shadow-xl shadow-green-500/50">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    </span>
);

interface StageCardProps {
    stage: number;
    title: string;
    synopsis: string;
    contents: string[];
    buttonText: string;
    unlock: string;
    icon: React.ReactNode;
    color: string;
    progress: number;
    isLocked: boolean;
    isExpanded: boolean;
    onComplete: (stage: number) => void;
    onToggleExpand: (stage: number) => void;
    className?: string;
}

export const StageCard = React.forwardRef<HTMLDivElement, StageCardProps>(({ 
    stage, title, synopsis, contents, buttonText, icon, color, unlock,
    progress, isLocked, isExpanded, onComplete, onToggleExpand, className 
}, ref) => {
    const isCompleted = progress === 100;

    return (
        <div ref={ref} className={`bg-[#2a2a2a] border rounded-2xl shadow-lg transition-all duration-500 hover:shadow-2xl hover:shadow-black/50 hover:-translate-y-1 ${isLocked ? 'card-locked' : ''} ${isCompleted ? 'border-green-500/60 shadow-[0_0_15px_rgba(74,222,128,0.4)]' : 'border-white/10'} ${className}`}>
            
            {/* The entire header is now a button to toggle the content's visibility. */}
            <button 
                onClick={() => onToggleExpand(stage)} 
                disabled={isLocked}
                className={`w-full p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 text-left ${isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                aria-expanded={isExpanded}
                aria-controls={`stage-content-${stage}`}
            >
                <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-black/30 ${color} flex items-center justify-center shadow-md`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-2xl font-extrabold text-white flex items-center gap-3">
                        {title}
                        {isCompleted && <CheckmarkIcon />}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">{synopsis}</p>
                </div>
                {/* The chevron icon rotates based on the isExpanded state to provide clear visual feedback. */}
                {!isLocked && (
                     <div className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                        <ChevronIcon />
                    </div>
                )}
            </button>

            {/* The content area's visibility is controlled by the 'expanded' class, which triggers the CSS animation. */}
            <div id={`stage-content-${stage}`} className={`stage-content ${isExpanded ? 'expanded' : ''}`}>
                <div> {/* This inner div is required for the grid transition to work smoothly */}
                    <div className="px-6 pb-6 pt-2">
                        <ul className="space-y-2 mb-6">
                            {contents.map((item, index) => (
                                <li key={index} className="flex items-start text-sm text-slate-300">
                                    <svg className={`w-4 h-4 mr-3 mt-0.5 ${color} flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>

                        {stage === 1 && <StoriesChecklist />}

                        {!isCompleted && (
                            <div className="mb-6 pt-4 border-t border-white/10 bg-black/20 p-4 rounded-lg">
                                <p className="text-xs font-bold text-[#EFD8A3] uppercase tracking-wider">Para Desbloquear esta Etapa:</p>
                                <p className="text-sm text-white font-medium mt-1">{unlock}</p>
                            </div>
                        )}

                         <button 
                            onClick={() => onComplete(stage)}
                            disabled={isLocked || isCompleted}
                            className="access-button w-full sm:w-auto px-6 py-3 bg-[#9F8DE6] text-white rounded-lg shadow-lg font-bold text-sm hover:bg-violet-500 transition-colors duration-300 disabled:bg-slate-500 disabled:text-slate-300 disabled:cursor-not-allowed">
                            {isCompleted ? 'Concluído' : buttonText}
                        </button>
                    </div>
                </div>
            </div>

            {/* Progress Bar - always visible */}
            <div className="px-6 pb-4">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
                    <span>Progresso</span>
                    <span>{progress}%</span>
                </div>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </div>
    );
});

StageCard.displayName = "StageCard";