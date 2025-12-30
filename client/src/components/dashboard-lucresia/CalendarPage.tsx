
import React, { useState } from 'react';
import { useToast } from '../Toast';

interface Appointment {
    id: string;
    patient: string;
    procedure: string;
    time: string;
    duration: string;
    status: 'confirmado' | 'pendente' | 'concluido';
    value: string;
}

export const CalendarPage: React.FC = () => {
    const { showToast } = useToast();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Mock de agendamentos existentes
    const [appointments, setAppointments] = useState<Appointment[]>([
        { id: '1', patient: 'Luciana Mello', procedure: 'Harmonização Facial', time: '09:00', duration: '60 min', status: 'confirmado', value: 'R$ 1.200' },
        { id: '2', patient: 'Roberta Dias', procedure: 'Botox Testa', time: '11:00', duration: '30 min', status: 'pendente', value: 'R$ 850' },
        { id: '3', patient: 'Amanda Silva', procedure: 'Bioestimulador', time: '14:30', duration: '45 min', status: 'confirmado', value: 'R$ 2.100' },
    ]);

    const [newAppt, setNewAppt] = useState({
        patient: '',
        procedure: 'Limpeza de Pele',
        time: '',
    });

    const handleAddAppointment = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simulação da lógica de conflito do backend NestJS
        const hasConflict = appointments.some(a => a.time === newAppt.time);
        
        if (hasConflict) {
            showToast('Conflito de Horário! Esta janela já está ocupada no Elevare Backend.', 'error');
            return;
        }

        const appt: Appointment = {
            id: Math.random().toString(),
            patient: newAppt.patient,
            procedure: newAppt.procedure,
            time: newAppt.time,
            duration: '45 min',
            status: 'pendente',
            value: 'R$ 350'
        };

        setAppointments(prev => [...prev, appt].sort((a, b) => a.time.localeCompare(b.time)));
        showToast('Agendamento solicitado com sucesso!', 'success');
        setIsModalOpen(false);
        setNewAppt({ patient: '', procedure: 'Limpeza de Pele', time: '' });
    };

    return (
        <div className="animate-on-scroll is-visible space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white">Agenda Inteligente</h1>
                    <p className="text-gray-400">Sincronizada com seu fluxo de caixa e leads.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-purple-500/20 transition-all flex items-center gap-2 transform active:scale-95"
                >
                    <span>+</span> Novo Agendamento
                </button>
            </header>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Calendário Lateral (Mini) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                        <input 
                            type="date" 
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="mt-6 grid grid-cols-7 gap-1 text-center text-[10px] font-black text-gray-500 uppercase tracking-widest">
                            {['D','S','T','Q','Q','S','S'].map(d => <div key={d}>{d}</div>)}
                        </div>
                        {/* Grade de dias simplificada */}
                        <div className="mt-2 grid grid-cols-7 gap-1">
                            {Array.from({length: 31}).map((_, i) => (
                                <div key={i} className={`aspect-square flex items-center justify-center rounded-lg text-xs cursor-pointer transition-colors ${i+1 === 25 ? 'bg-purple-600 text-white font-bold' : 'hover:bg-white/5 text-gray-400'}`}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 border border-purple-500/20 p-6 rounded-3xl">
                        <h4 className="text-sm font-bold text-purple-300 mb-2">Resumo do Dia</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Total Previsto:</span>
                                <span className="text-white font-bold">R$ 4.150,00</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Agendamentos:</span>
                                <span className="text-white font-bold">03</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline de Atendimentos */}
                <div className="lg:col-span-8 space-y-4">
                    {appointments.length === 0 ? (
                        <div className="h-64 bg-white/5 border border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-gray-500">
                            <span className="text-4xl mb-4 opacity-20">📅</span>
                            <p>Nenhum agendamento para este dia.</p>
                        </div>
                    ) : (
                        appointments.map((appt) => (
                            <div key={appt.id} className="group bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-5 flex items-center justify-between transition-all backdrop-blur-sm">
                                <div className="flex items-center gap-6">
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-lg font-black text-white">{appt.time}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold">{appt.duration}</div>
                                    </div>
                                    <div className="w-px h-10 bg-white/10"></div>
                                    <div>
                                        <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{appt.patient}</div>
                                        <div className="text-xs text-gray-500">{appt.procedure}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-black text-white">{appt.value}</div>
                                        <div className={`text-[10px] font-black uppercase ${appt.status === 'confirmado' ? 'text-green-400' : 'text-amber-400'}`}>
                                            {appt.status}
                                        </div>
                                    </div>
                                    <button className="p-2 bg-white/5 rounded-lg hover:bg-white/20 transition-colors">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Novo Agendamento */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#101018] border border-white/10 w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-white">Agendar Paciente</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">&times;</button>
                        </div>
                        <form onSubmit={handleAddAppointment} className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-black text-gray-500 mb-2 block">Nome da Paciente</label>
                                <input 
                                    type="text" 
                                    required
                                    value={newAppt.patient}
                                    onChange={e => setNewAppt({...newAppt, patient: e.target.value})}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    placeholder="Ex: Maria Oliveira"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] uppercase font-black text-gray-500 mb-2 block">Horário</label>
                                    <input 
                                        type="time" 
                                        required
                                        value={newAppt.time}
                                        onChange={e => setNewAppt({...newAppt, time: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-black text-gray-500 mb-2 block">Procedimento</label>
                                    <select 
                                        value={newAppt.procedure}
                                        onChange={e => setNewAppt({...newAppt, procedure: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
                                    >
                                        <option>Limpeza de Pele</option>
                                        <option>Botox</option>
                                        <option>Preenchimento</option>
                                        <option>Drenagem</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-xl mt-4 hover:bg-gray-200 transition-all">
                                CONFIRMAR AGENDAMENTO
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CalendarPage;
