
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from '../firebase/config';
import { UserData } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import ContentCreation from './dashboard/ContentCreation';
import { Profile } from './dashboard/Profile';
import { Plans } from './dashboard/Plans';
import { VideoGenerator } from './VideoGenerator';

const EbookGeneratorPage = lazy(() => import('./dashboard/EbookGeneratorPage'));
const RoboProdutorPage = lazy(() => import('./dashboard/RoboProdutorPage'));
const CampaignAssistant = lazy(() => import('./dashboard/CampaignAssistant'));
const LeadsPage = lazy(() => import('./dashboard/LeadsPage'));
const CalendarPage = lazy(() => import('./dashboard/CalendarPage'));

const PageFallback: React.FC = () => (
    <div className="flex items-center justify-center h-screen bg-[#101018]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
    </div>
);

const NavItem: React.FC<{ icon: string; label: string; isActive: boolean; onClick: () => void; isNew?: boolean }> = ({ icon, label, isActive, onClick, isNew }) => (
    <li
        onClick={onClick}
        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
            isActive
                ? 'bg-purple-600/20 text-purple-300 font-semibold shadow-[inset_0_0_10px_rgba(168,85,247,0.1)] border border-purple-500/20'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`}
    >
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
        {isNew && <span className="absolute -top-1 -right-1 bg-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-full text-black">NOVO</span>}
    </li>
);

export const DashboardPage: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [activePage, setActivePage] = useState('content');

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const unsubscribe = onSnapshot(userDocRef, (doc) => {
                if (doc.exists()) {
                    setUser({ ...doc.data(), uid: currentUser.uid } as UserData);
                } else {
                    onLogout();
                }
            }, (error) => {
                onLogout();
            });
            return () => unsubscribe();
        } else {
            onLogout();
        }
    }, [onLogout]);

    if (!user) return <PageFallback />;

    const renderActivePage = () => {
        switch(activePage) {
            case 'calendar':
                return <Suspense fallback={<PageFallback />}><CalendarPage /></Suspense>;
            case 'leads':
                return <Suspense fallback={<PageFallback />}><LeadsPage /></Suspense>;
            case 'ebooks':
                return <Suspense fallback={<PageFallback />}><EbookGeneratorPage user={user} /></Suspense>;
            case 'campaigns':
                return <Suspense fallback={<PageFallback />}><CampaignAssistant user={user} /></Suspense>;
            case 'video':
                if (user.level !== 'master') {
                    return (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-on-scroll is-visible">
                            <div className="w-24 h-24 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center text-5xl mb-6 border border-amber-500/20 shadow-lg shadow-amber-500/5">🔒</div>
                            <h2 className="text-3xl font-bold text-white mb-2">Recurso Exclusivo Master</h2>
                            <p className="text-gray-400 max-w-md mb-8">O Gerador de Vídeos Cinematográficos (Veo) está disponível apenas para assinantes LucresIA Master.</p>
                            <button onClick={() => setActivePage('plans')} className="bg-amber-500 hover:bg-amber-400 text-black font-black py-4 px-10 rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform hover:scale-105">
                                FAZER UPGRADE PARA MASTER
                            </button>
                        </div>
                    );
                }
                return <VideoGenerator />;
            case 'lucresia-pro':
                return <Suspense fallback={<PageFallback />}><RoboProdutorPage user={user} /></Suspense>;
            case 'profile':
                return <Profile user={user} />;
            case 'plans':
                return <Plans user={user} />;
            case 'content':
            default:
                return <ContentCreation user={user} />;
        }
    }

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white font-sans flex">
            {/* Sidebar Otimizada */}
            <nav className="w-64 bg-black/40 p-4 border-r border-white/5 flex flex-col justify-between fixed h-full z-20 backdrop-blur-xl">
                <div>
                    <div className="px-4 mb-8 py-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center font-black text-lg shadow-lg shadow-purple-500/20">L</div>
                            <div className="overflow-hidden">
                                <h1 className="text-sm font-bold truncate">{user?.clinic || 'Minha Clínica'}</h1>
                                <p className="text-[10px] text-gray-500 uppercase tracking-widest">{user.name}</p>
                            </div>
                        </div>
                        <div className={`text-[10px] uppercase font-black px-3 py-1.5 rounded-lg inline-block ${user.level === 'master' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : user.level === 'pro' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
                            Plano {user.level}
                        </div>
                    </div>
                    
                    <ul className="space-y-1.5">
                        <NavItem icon="🎨" label="Criar Conteúdo" isActive={activePage === 'content'} onClick={() => setActivePage('content')} />
                        <NavItem icon="🗓️" label="Agenda" isActive={activePage === 'calendar'} onClick={() => setActivePage('calendar')} />
                        <NavItem icon="👥" label="Leads (Pistas)" isActive={activePage === 'leads'} onClick={() => setActivePage('leads')} />
                        <NavItem icon="🎬" label="Gerador de Vídeo" isActive={activePage === 'video'} onClick={() => setActivePage('video')} />
                        <NavItem icon="🎯" label="Campanhas Ads" isActive={activePage === 'campaigns'} onClick={() => setActivePage('campaigns')} />
                        <NavItem icon="📚" label="E-books VIP" isActive={activePage === 'ebooks'} onClick={() => setActivePage('ebooks')} />
                        <NavItem icon="🤖" label="LucresIA Pro" isActive={activePage === 'lucresia-pro'} onClick={() => setActivePage('lucresia-pro')} />
                        
                        <div className="py-4 px-4"><div className="h-px bg-white/5 w-full"></div></div>
                        
                        <NavItem icon="💎" label="Planos & Upgrade" isActive={activePage === 'plans'} onClick={() => setActivePage('plans')} />
                        <NavItem icon="⚙️" label="Minha IA & Perfil" isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
                    </ul>
                </div>

                <div className="p-4 space-y-4">
                    {user.level !== 'master' && (
                        <div className="p-4 bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-500"></div>
                            <p className="text-[10px] font-bold text-purple-200 mb-2 relative z-10">LIBERE O MODO MASTER</p>
                            <button onClick={() => setActivePage('plans')} className="w-full bg-white text-black text-[10px] font-black py-2 rounded-lg hover:bg-gray-100 transition-colors relative z-10">FAZER UPGRADE</button>
                        </div>
                    )}
                    <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-red-400 transition-colors py-2">
                        Sair do Painel
                    </button>
                </div>
            </nav>

            <main className="flex-1 ml-64 p-8 min-h-screen bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                <div className="max-w-5xl mx-auto">
                    {renderActivePage()}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;
