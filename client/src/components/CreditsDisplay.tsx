/**
 * 💰 CreditsDisplay - Exibe saldo de créditos do usuário
 * Para usar no header ou dashboard
 */

import { trpc } from "@/lib/trpc";
import { Coins, Crown, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

interface CreditsDisplayProps {
  className?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function CreditsDisplay({ 
  className, 
  showUpgradeButton = true,
  compact = false 
}: CreditsDisplayProps) {
  const { data: subscription, isLoading } = trpc.subscription.getSubscription.useQuery();

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!subscription) return null;

  const isUnlimited = subscription.plan === "profissional" || subscription.creditsRemaining === -1;
  const isLow = !isUnlimited && subscription.creditsRemaining <= 2;
  const isEmpty = !isUnlimited && subscription.creditsRemaining === 0;

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {isUnlimited ? (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-400">PRO</span>
          </div>
        ) : (
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full border",
            isEmpty 
              ? "bg-red-500/20 border-red-500/30" 
              : isLow 
                ? "bg-amber-500/20 border-amber-500/30"
                : "bg-slate-700/50 border-slate-600"
          )}>
            <Coins className={cn(
              "w-3.5 h-3.5",
              isEmpty ? "text-red-400" : isLow ? "text-amber-400" : "text-slate-400"
            )} />
            <span className={cn(
              "text-xs font-medium",
              isEmpty ? "text-red-400" : isLow ? "text-amber-400" : "text-slate-300"
            )}>
              {subscription.creditsRemaining}
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-lg border",
      isEmpty 
        ? "bg-red-500/10 border-red-500/30" 
        : isLow 
          ? "bg-amber-500/10 border-amber-500/30"
          : "bg-slate-800/50 border-slate-700",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {isUnlimited ? (
            <div className="p-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-lg">
              <Crown className="w-5 h-5 text-amber-400" />
            </div>
          ) : (
            <div className={cn(
              "p-2 rounded-lg",
              isEmpty 
                ? "bg-red-500/20" 
                : isLow 
                  ? "bg-amber-500/20"
                  : "bg-slate-700/50"
            )}>
              {isEmpty ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <Coins className={cn(
                  "w-5 h-5",
                  isLow ? "text-amber-400" : "text-blue-400"
                )} />
              )}
            </div>
          )}
          
          <div>
            <p className="text-sm text-slate-400">
              {isUnlimited ? "Plano Profissional" : "Créditos Disponíveis"}
            </p>
            <p className={cn(
              "text-xl font-bold",
              isEmpty 
                ? "text-red-400" 
                : isLow 
                  ? "text-amber-400"
                  : isUnlimited 
                    ? "text-amber-400"
                    : "text-white"
            )}>
              {isUnlimited ? "Ilimitado" : subscription.creditsRemaining}
            </p>
          </div>
        </div>

        {showUpgradeButton && !isUnlimited && (
          <Link 
            href="/pricing"
            className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition-all"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Progress bar for limited plans */}
      {!isUnlimited && subscription.monthlyCreditsLimit > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Usados: {subscription.monthlyCreditsLimit - subscription.creditsRemaining}</span>
            <span>Limite: {subscription.monthlyCreditsLimit}</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all",
                isEmpty 
                  ? "bg-red-500" 
                  : isLow 
                    ? "bg-amber-500"
                    : "bg-blue-500"
              )}
              style={{ 
                width: `${Math.max(0, (subscription.creditsRemaining / subscription.monthlyCreditsLimit) * 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Warning messages */}
      {isEmpty && (
        <p className="mt-3 text-sm text-red-400">
          ⚠️ Seus créditos acabaram. Faça upgrade para continuar gerando.
        </p>
      )}
      {isLow && !isEmpty && (
        <p className="mt-3 text-sm text-amber-400">
          ⚡ Créditos baixos. Considere fazer upgrade.
        </p>
      )}
    </div>
  );
}

export default CreditsDisplay;
