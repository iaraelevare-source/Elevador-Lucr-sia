
import React, { useState } from 'react';
import { db, auth } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { UserData } from '../../types';
import { useToast } from '../Toast';

export const Profile: React.FC<{ user: UserData }> = ({ user }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        clinic: user.clinic || '',
        whatsapp: user.whatsapp || '',
        tone: user.tone || 'Profissional',
        service: user.service || 'Estética Facial',
    });
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, formData);
            showToast('Perfil atualizado com sucesso!', 'success');
        } catch (error) {
            console.error(error);
            showToast('Erro ao atualizar perfil.', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto animate-on-scroll is-visible">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil Estratégico</h1>
            <form onSubmit={handleSave} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nome Completo</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">WhatsApp</label>
                        <input 
                            type="text" 
                            value={formData.whatsapp} 
                            onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nome da Clínica/Marca</label>
                    <input 
                        type="text" 
                        value={formData.clinic} 
                        onChange={e => setFormData({...formData, clinic: e.target.value})}
                        className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Serviço Principal</label>
                        <select 
                            value={formData.service} 
                            onChange={e => setFormData({...formData, service: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        >
                            <option>Limpeza de Pele</option>
                            <option>Harmonização Facial</option>
                            <option>Depilação a Laser</option>
                            <option>Corporal / Drenagem</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Tom de Voz da IA</label>
                        <select 
                            value={formData.tone} 
                            onChange={e => setFormData({...formData, tone: e.target.value})}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500"
                        >
                            <option>Profissional</option>
                            <option>Acolhedor</option>
                            <option>Luxo / Premium</option>
                            <option>Direto ao ponto</option>
                        </select>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSaving}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Configurações'}
                </button>
            </form>

            <div className="mt-8 p-6 bg-purple-900/20 border border-purple-500/30 rounded-2xl text-center">
                <p className="text-sm text-purple-200">
                    💡 <strong>Dica da LucresIA:</strong> O seu "Tom de Voz" influencia diretamente como eu escrevo suas legendas e roteiros. Escolha o que melhor combina com seu público!
                </p>
            </div>
        </div>
    );
};
