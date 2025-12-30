
import React from 'react';

const NavIcon: React.FC<{ children: React.ReactNode, label: string, href: string, isActive: boolean }> = ({ children, label, href, isActive }) => (
    <a href={href} title={label} className={`flex flex-col items-center gap-1 transition-all duration-300 group ${isActive ? 'text-white scale-110 hover:opacity-90' : 'text-[#EFD8A3] hover:text-white'}`}>
        {children}
        <span className={`text-xs font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span>
    </a>
);


export const Header: React.FC<{ activeSection: string }> = ({ activeSection }) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-[#1A1A1A]/80 backdrop-blur-lg z-50 shadow-lg shadow-black/20">
            <div className="max-w-5xl mx-auto px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#9F8DE6] to-[#7158CC] text-white font-bold text-lg shadow-md">
                            L
                        </div>
                        <div>
                            <h1 className="text-lg font-extrabold text-white">LucresIA</h1>
                            <p className="text-xs text-slate-400">por Elevare Global</p>
                        </div>
                    </div>
                    <nav className="flex items-center gap-6">
                        <NavIcon href="#journey" label="Biblioteca" isActive={activeSection === 'journey'}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </NavIcon>
                        <NavIcon href="#video-generator" label="IA LucresIA" isActive={activeSection === 'video-generator'}>
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        </NavIcon>
                        <NavIcon href="#gamification" label="E-books" isActive={activeSection === 'gamification'}>
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        </NavIcon>
                        <NavIcon href="#gamification" label="Aplicativos" isActive={activeSection === 'gamification'}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                        </NavIcon>
                    </nav>
                </div>
            </div>
        </header>
    );
};