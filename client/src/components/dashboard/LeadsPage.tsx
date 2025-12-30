
import React, { useState } from 'react';
import { Lead } from '../../types';
import { useToast } from '../Toast';

export const LeadsPage: React.FC = () => {
    const { showToast } = useToast();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');

    // Mock de dados simulando a resposta do NestJS /leads
    const [leads] = useState<Lead[]>([
        { id: '1', name: 'Juliana Silva', email: 'ju@email.com', phone: '(11) 98888-7777', service: 'Botox', status: 'novo', createdAt: '2023-10-25', source: 'Instagram' },
        { id: '2', name: 'Mariana Costa', email: 'mari@email.com', phone: '(11) 97777-6666', service: 'Preenchimento', status: 'em_contato', createdAt: '2023-10-24', source: 'WhatsApp' },
        { id: '3', name: 'Fernanda Lima', email: 'fer@email.com', phone: '(11) 96666-5555', service: 'Limpeza de Pele', status: 'faturado', createdAt: '2023-10-22', source: 'Site' },
        { id: '4', name: 'Carla Souza', email: 'carla@email.com', phone: '(11) 95555-4444', service: 'Bioestimulador', status: 'agendado', createdAt: '2023-10-20', source: 'Indicação' },
    ]);

    const getStatusStyle = (status: Lead['status']) => {
        const styles = {
            novo: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            em_contato: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            agendado: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            faturado: 'bg-green-500/10 text-green-400 border-green-500/20',
            perdido: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return styles[status] || styles.novo;
    };

    const handleImport = () => {
        showToast('Iniciando importação assíncrona via Elevare Backend...', 'info');
        // Aqui chamaria o endpoint POST /leads/import do NestJS
    };

    return (
        <div className="animate-on-scroll is-visible space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Leads (Pistas)</h1>
                    <p className="text-gray-400">Gerencie suas oportunidades e converta seguidores em pacientes.</p>
                </div>
                <button 
                    onClick={handleImport}
                    className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                >
                    📥 Importar Leads (CSV)
                </button>
            </header>

            {/* Dash de Métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', val: '124', color: 'text-white' },
                    { label: 'Novos', val: '12', color: 'text-blue-400' },
                    { label: 'Agendados', val: '45', color: 'text-purple-400' },
                    { label: 'Faturados', val: 'R$ 12k', color: 'text-green-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-sm">
                        <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-1">{stat.label}</p>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                ))}
            </div>

            {/* Filtros e Tabela */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            placeholder="Buscar lead por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <span className="absolute left-3 top-3.5 opacity-30">🔍</span>
                    </div>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none min-w-[150px]"
                    >
                        <option value="todos">Todos os Status</option>
                        <option value="novo">Novos</option>
                        <option value="agendado">Agendados</option>
                        <option value="faturado">Faturados</option>
                    </select>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-black/20 text-[10px] uppercase font-black text-gray-500 tracking-widest">
                                <th className="px-6 py-4">Lead</th>
                                <th className="px-6 py-4">Serviço</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Origem</th>
                                <th className="px-6 py-4">Data</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {leads.map((lead) => (
                                <tr key={lead.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{lead.name}</div>
                                        <div className="text-xs text-gray-500">{lead.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-300">{lead.service}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusStyle(lead.status)}`}>
                                            {lead.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{lead.source}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">{lead.createdAt}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-purple-400 hover:text-white font-bold text-xs transition-colors">
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 bg-black/20 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                    <span>Mostrando {leads.length} leads</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors disabled:opacity-30">Anterior</button>
                        <button className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition-colors">Próximo</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LeadsPage;
