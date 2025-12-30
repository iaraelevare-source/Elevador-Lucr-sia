/**
 * 🔒 CreditGuard - Componente de proteção de créditos
 * Bloqueia a UI quando usuário não tem créditos suficientes
 * e mostra modal de upgrade para planos pagos
 */

import { ReactNode } from "react";
import { trpc } from "@/lib/trpc";
import { UpgradeModal } from "./UpgradeModal";
import { Loader2 } from "lucide-react";

interface CreditGuardProps {
  children: ReactNode;
  /** Número mínimo de créditos necessários para acessar o conteúdo */
  requiredCredits?: number;
  /** Mensagem customizada quando créditos são insuficientes */
  message?: string;
  /** Se deve mostrar loading enquanto carrega subscription */
  showLoading?: boolean;
}

export function CreditGuard({ 
  children, 
  requiredCredits = 1,
  message,
  showLoading = true 
}: CreditGuardProps) {
  const { data: subscription, isLoading } = trpc.subscription.getSubscription.useQuery();

  // Loading state
  if (isLoading && showLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Se não tem subscription, deixar passar (será tratado no backend)
  if (!subscription) {
    return <>{children}</>;
  }

  // Plano profissional tem créditos ilimitados
  if (subscription.plan === "profissional" || subscription.creditsRemaining === -1) {
    return <>{children}</>;
  }

  // Verificar se tem créditos suficientes
  const hasEnoughCredits = subscription.creditsRemaining >= requiredCredits;

  if (!hasEnoughCredits) {
    return (
      <UpgradeModal 
        isOpen={true}
        onClose={() => {}} // Não permite fechar
        currentPlan={subscription.plan}
        creditsRemaining={subscription.creditsRemaining}
        message={message}
      />
    );
  }

  return <>{children}</>;
}

/**
 * Hook para verificar créditos de forma programática
 */
export function useCredits() {
  const { data: subscription, isLoading, refetch } = trpc.subscription.getSubscription.useQuery();

  const hasCredits = (required: number = 1): boolean => {
    if (!subscription) return false;
    if (subscription.plan === "profissional") return true;
    if (subscription.creditsRemaining === -1) return true;
    return subscription.creditsRemaining >= required;
  };

  const isUnlimited = subscription?.plan === "profissional" || subscription?.creditsRemaining === -1;

  return {
    subscription,
    isLoading,
    hasCredits,
    isUnlimited,
    creditsRemaining: subscription?.creditsRemaining ?? 0,
    plan: subscription?.plan ?? "free",
    refetch,
  };
}

export default CreditGuard;
