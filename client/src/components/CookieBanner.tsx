import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("cookiesAccepted")) {
      // Pequeno delay para não aparecer imediatamente
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookiesAccepted", "true");
    localStorage.setItem("cookiesAcceptedAt", new Date().toISOString());
    setShow(false);
  };

  const decline = () => {
    localStorage.setItem("cookiesDeclined", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm text-white p-4 z-50 shadow-2xl border-t border-slate-700">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm text-slate-300">
            🍪 Utilizamos cookies para melhorar sua experiência, personalizar conteúdo e analisar nosso tráfego. 
            Ao continuar navegando, você concorda com nossa{" "}
            <a href="/privacy" className="text-amber-400 hover:underline font-medium">
              Política de Privacidade
            </a>{" "}
            e{" "}
            <a href="/terms" className="text-amber-400 hover:underline font-medium">
              Termos de Uso
            </a>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={decline}
            className="text-slate-400 hover:text-white text-sm px-4 py-2 rounded border border-slate-600 hover:border-slate-500 transition-colors"
          >
            Recusar
          </button>
          <button
            onClick={accept}
            className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 px-6 py-2 rounded font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg"
          >
            Aceitar Cookies
          </button>
          <button
            onClick={decline}
            className="text-slate-500 hover:text-white p-1"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
