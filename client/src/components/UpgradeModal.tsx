/**
 * 💎 UpgradeModal - Modal de upgrade para planos pagos
 * Exibido quando usuário não tem créditos suficientes
 */

import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Crown, AlertTriangle, Check, Zap } from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  creditsRemaining: number;
  message?: string;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlan,
  creditsRemaining,
  message,
}: UpgradeModalProps) {
  const [, setLocation] = useLocation();

  const handleUpgrade = () => {
    setLocation("/pricing");
    onClose();
  };

  const defaultMessage = creditsRemaining === 0
    ? "Seus créditos acabaram! Faça upgrade para continuar gerando conteúdo incrível."
    : `Você tem apenas ${creditsRemaining} crédito(s) restante(s). Faça upgrade para não ficar sem.`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full">
              <AlertTriangle className="w-10 h-10 text-amber-400" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white text-center">
            {creditsRemaining === 0 ? "Créditos Esgotados" : "Créditos Baixos"}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-center text-base">
            {message || defaultMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {/* Current Status */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Plano Atual</span>
              <span className="text-white font-medium capitalize">{currentPlan}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Créditos Restantes</span>
              <span className={`font-bold ${creditsRemaining === 0 ? 'text-red-400' : 'text-amber-400'}`}>
                {creditsRemaining}
              </span>
            </div>
          </div>

          {/* Upgrade Benefits */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/30">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-amber-400" />
              <span className="font-semibold text-white">Plano Profissional</span>
            </div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400" />
                Créditos ilimitados
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400" />
                Gerador de E-books
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400" />
                Gerador de Anúncios
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-300">
                <Check className="w-4 h-4 text-green-400" />
                Suporte VIP prioritário
              </li>
            </ul>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-6"
            >
              <Zap className="w-5 h-5 mr-2" />
              Fazer Upgrade Agora
            </Button>
            
            {creditsRemaining > 0 && (
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full text-slate-400 hover:text-white hover:bg-slate-800"
              >
                Continuar com {creditsRemaining} crédito(s)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default UpgradeModal;
