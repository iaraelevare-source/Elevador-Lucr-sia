import React from 'react';
import { storiesChecklistData, dailyRoutine } from '../data/storiesChecklistData';

const ChecklistItem: React.FC<{ item: typeof storiesChecklistData[0] }> = ({ item }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-black/20 hover:bg-black/40 transition-colors">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-slate-800 ${item.color} flex items-center justify-center`}>
            {item.icon}
        </div>
        <div>
            <h4 className="font-bold text-white">{item.title}</h4>
            <p className="text-sm text-slate-400 mt-1">{item.description}</p>
        </div>
    </div>
);


export const StoriesChecklist: React.FC = () => {
    return (
        <div className="mt-6 pt-6 border-t border-white/20">
             <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🚀</span>
                <div>
                    <h3 className="text-xl font-extrabold text-[#EFD8A3]">Checklist: Stories que Vendem</h3>
                    <p className="text-sm text-slate-300">Siga estes 5 pilares para criar conteúdos que convertem.</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {storiesChecklistData.map(item => (
                    <ChecklistItem key={item.id} item={item} />
                ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-[#9F8DE6]/20 to-[#EFD8A3]/20 border border-white/10">
                 <h4 className="font-bold text-white">{dailyRoutine.title}</h4>
                 <p className="text-sm text-slate-300 mt-1">{dailyRoutine.description}</p>
            </div>
        </div>
    );
};
