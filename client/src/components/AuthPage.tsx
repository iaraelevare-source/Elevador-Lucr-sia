
import React, { useState, useCallback } from 'react';
import { auth, db, googleProvider, facebookProvider } from '../firebase/config';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthPageProps {
    mode: 'login' | 'signup';
}

const checkPasswordStrength = (password: string) => {
    let score = 0;
    const feedback = [];
    if (password.length < 8) feedback.push("Pelo menos 8 caracteres."); else score++;
    if (!/[A-Z]/.test(password)) feedback.push("Pelo menos uma letra maiúscula."); else score++;
    if (!/[a-z]/.test(password)) feedback.push("Pelo menos uma letra minúscula."); else score++;
    if (!/\d/.test(password)) feedback.push("Pelo menos um número."); else score++;

    let strength = { text: '', color: 'bg-slate-300', width: '0%' };
    switch (score) {
        case 1: strength = { text: 'Fraca', color: 'bg-red-500', width: '25%' }; break;
        case 2: strength = { text: 'Média', color: 'bg-yellow-500', width: '50%' }; break;
        case 3: strength = { text: 'Forte', color: 'bg-lime-500', width: '75%' }; break;
        case 4: strength = { text: 'Muito Forte', color: 'bg-green-500', width: '100%' }; break;
        default: strength = { text: 'Muito Fraca', color: 'bg-red-500', width: '10%' }; break;
    }
    if (password.length === 0) return { strength: null, feedback: [], score: 0 };
    return { strength, feedback, score };
};

const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const { strength, feedback, score } = checkPasswordStrength(password);
    if (!strength) return null;
    return (
        <div className="mt-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div className={`h-2 rounded-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
            </div>
            <div className="flex justify-between items-center mt-1">
                <span className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.text}</span>
            </div>
            {feedback.length > 0 && score < 4 && (
                 <ul className="text-xs text-slate-500 mt-2 space-y-1">
                    {feedback.map((item, index) => (
                        <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            {item}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const GoogleIcon: React.FC = () => (
    <svg className="w-5 h-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C43.021 36.258 46 30.676 46 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

const FacebookIcon: React.FC = () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
    </svg>
);

const SocialSignInButton: React.FC<{
    providerName: string;
    onClick: () => void;
    isLoading: boolean;
    icon: React.ReactNode;
    className: string;
    textColorClass: string;
}> = ({ providerName, onClick, isLoading, icon, className, textColorClass }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className={`w-full flex items-center justify-center gap-3 p-3 rounded-lg transition-colors disabled:opacity-50 ${className}`}
    >
        {icon}
        <span className={`text-sm font-semibold ${textColorClass}`}>Continuar com {providerName}</span>
    </button>
);


export const AuthPage: React.FC<AuthPageProps> = ({ mode: initialMode }) => {
    const [mode, setMode] = useState<any>(initialMode);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [signupData, setSignupData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        clinic: '',
        service: 'Limpeza de Pele',
        tone: 'Profissional',
    });
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });
    const [signupErrors, setSignupErrors] = useState({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        clinic: '',
    });

    const validateSignupField = useCallback((name: string, value: string) => {
        let fieldError = '';
        switch (name) {
            case 'name': if (value.trim().length < 2) fieldError = 'O nome deve ter pelo menos 2 caracteres.'; break;
            case 'email':
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (value.trim() !== '' && !emailRegex.test(value)) fieldError = 'Insira um e-mail válido';
                break;
            case 'whatsapp':
                const digits = value.replace(/\D/g, '');
                if (digits.length < 10 || digits.length > 13) fieldError = 'WhatsApp inválido.';
                break;
            case 'password': if (checkPasswordStrength(value).score < 3) fieldError = 'A senha deve ser pelo menos "Forte".'; break;
            case 'clinic': if (value.trim().length < 2) fieldError = 'O nome da clínica é obrigatório.'; break;
            default: break;
        }
        setSignupErrors(prev => ({ ...prev, [name]: fieldError }));
    }, []);

    const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSignupData(prev => ({ ...prev, [name]: value }));
        validateSignupField(name, value);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const isSignupFormValid = 
        Object.values(signupData).every(value => typeof value === 'string' && value.trim() !== '') &&
        Object.values(signupErrors).every(error => error === '') &&
        checkPasswordStrength(signupData.password).score >= 3;

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSignupFormValid) return;
        setIsLoading(true);
        setError(null);
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(signupData.email, signupData.password);
            const user = userCredential.user;
            if (user) {
                await setDoc(doc(db, "users", user.uid), {
                    name: signupData.name,
                    email: signupData.email,
                    whatsapp: signupData.whatsapp,
                    clinic: signupData.clinic,
                    service: signupData.service,
                    tone: signupData.tone,
                    level: 'free',
                    points: 0,
                });
            }
        } catch (err: any) {
            setError(err.code === 'auth/email-already-in-use' ? 'E-mail em uso.' : err.message);
        } finally { setIsLoading(false); }
    };

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await auth.signInWithEmailAndPassword(loginData.email, loginData.password);
        } catch (err: any) {
            setError("E-mail ou senha incorretos.");
        } finally { setIsLoading(false); }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!loginData.email) {
            setError("Informe seu e-mail para recuperar a senha.");
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            await auth.sendPasswordResetEmail(loginData.email);
            setSuccess("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
            setMode('login');
        } catch (err: any) {
            setError("Erro ao enviar e-mail. Verifique se o endereço está correto.");
        } finally { setIsLoading(false); }
    };

    const handleSocialSignIn = async (provider: firebase.auth.AuthProvider) => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(userDocRef);
                if (!docSnap.exists()) {
                    await setDoc(userDocRef, {
                        name: user.displayName || 'Novo Usuário',
                        email: user.email,
                        level: 'free',
                        points: 0,
                        whatsapp: '',
                        clinic: '',
                        service: 'Limpeza de Pele',
                        tone: 'Profissional',
                    });
                }
            }
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') setError(error.message);
        } finally { setIsLoading(false); }
    };
    
    return (
        <main className="flex-grow flex items-center justify-center py-12 px-6 bg-slate-50">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl p-8 card-shadow border border-slate-200 animate-on-scroll is-visible">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="rounded-xl w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#9F8DE6] to-[#7158CC] text-white font-bold text-2xl shadow-md">EL</div>
                    </div>

                     <div className="flex border-b-2 border-slate-200 mb-6">
                        <button onClick={() => { setMode('login'); setError(null); setSuccess(null); }} className={`flex-1 py-3 font-bold text-center transition-colors ${mode === 'login' || mode === 'forgot' ? 'text-[#7158CC] border-b-2 border-[#7158CC]' : 'text-slate-500 hover:text-slate-800'}`}>
                            Entrar
                        </button>
                        <button onClick={() => { setMode('signup'); setError(null); setSuccess(null); }} className={`flex-1 py-3 font-bold text-center transition-colors ${mode === 'signup' ? 'text-[#7158CC] border-b-2 border-[#7158CC]' : 'text-slate-500 hover:text-slate-800'}`}>
                            Criar Conta
                        </button>
                    </div>

                    {mode === 'forgot' ? (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-1 text-slate-800">Recuperar Senha</h2>
                            <p className="text-center text-sm text-slate-600 mb-6">Enviaremos um link para o seu e-mail.</p>
                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <input type="email" name="email" placeholder="Seu e-mail cadastrado" value={loginData.email} onChange={handleLoginChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7158CC] transition-colors" />
                                <button type="submit" disabled={isLoading} className="w-full mt-4 px-8 py-4 btn-primary text-white rounded-lg shadow-lg font-bold text-lg disabled:opacity-70">
                                    {isLoading ? 'Enviando...' : 'Enviar Link'}
                                </button>
                                <button type="button" onClick={() => setMode('login')} className="w-full text-sm text-slate-500 hover:underline">Voltar para o Login</button>
                            </form>
                        </>
                    ) : mode === 'signup' ? (
                        <>
                            <h2 className="text-2xl font-bold text-center mb-1 text-slate-800">Crie sua conta grátis</h2>
                            <p className="text-center text-sm text-slate-600 mb-6">Comece sua jornada para o lucro.</p>
                            <form onSubmit={handleSignupSubmit} className="space-y-4">
                                <input type="text" name="name" placeholder="Nome completo" value={signupData.name} onChange={handleSignupChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg" />
                                <input type="email" name="email" placeholder="Seu melhor e-mail" value={signupData.email} onChange={handleSignupChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg" />
                                <input type="password" name="password" placeholder="Crie uma senha" value={signupData.password} onChange={handleSignupChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg" />
                                <PasswordStrengthMeter password={signupData.password} />
                                <input type="tel" name="whatsapp" placeholder="WhatsApp" value={signupData.whatsapp} onChange={handleSignupChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg" />
                                <input type="text" name="clinic" placeholder="Nome da clínica" value={signupData.clinic} onChange={handleSignupChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg" />
                                <button type="submit" disabled={isLoading || !isSignupFormValid} className="w-full mt-4 px-8 py-4 btn-primary text-white rounded-lg shadow-lg font-bold text-lg disabled:opacity-50">
                                    {isLoading ? 'Criando...' : 'Criar Conta'}
                                </button>
                            </form>
                        </>
                    ) : (
                         <>
                            <h2 className="text-2xl font-bold text-center mb-6 text-slate-800">Bem-vinda de volta!</h2>
                            {success && <p className="bg-green-100 text-green-700 p-3 rounded-lg text-sm mb-4">{success}</p>}
                            <form onSubmit={handleLoginSubmit} className="space-y-4">
                                <input type="email" name="email" placeholder="E-mail" value={loginData.email} onChange={handleLoginChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7158CC] transition-colors" />
                                <input type="password" name="password" placeholder="Senha" value={loginData.password} onChange={handleLoginChange} required className="w-full p-3 bg-slate-100 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#7158CC] transition-colors" />
                                <button type="submit" disabled={isLoading} className="w-full mt-4 px-8 py-4 btn-primary text-white rounded-lg shadow-lg font-bold text-lg disabled:opacity-70">
                                    {isLoading ? 'Entrando...' : 'Entrar na minha conta'}
                                </button>
                                <p className="text-center text-xs">
                                    <button type="button" onClick={() => setMode('forgot')} className="hover:underline text-slate-500">Esqueceu a senha?</button>
                                </p>
                            </form>
                        </>
                    )}
                    {(mode === 'login' || mode === 'signup') && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300"></div></div>
                                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">ou</span></div>
                            </div>
                            <div className="space-y-3">
                                <SocialSignInButton providerName="Google" onClick={() => handleSocialSignIn(googleProvider)} isLoading={isLoading} icon={<GoogleIcon />} className="bg-white border border-slate-300" textColorClass="text-slate-700" />
                            </div>
                        </>
                    )}
                    {error && <p className="text-center text-sm font-semibold text-red-600 mt-4">{error}</p>}
                </div>
            </div>
        </main>
    );
};
