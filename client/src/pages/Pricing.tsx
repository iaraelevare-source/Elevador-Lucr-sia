import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import OnboardingPremium from "@/components/OnboardingPremium";
import { ManifestoLucresia } from "@/lib/lucresia";

export default function Pricing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: plans } = trpc.subscription.getPlans.useQuery();
  const { data: subscription } = trpc.subscription.getSubscription.useQuery(
    undefined,
    { enabled: !!user }
  );
  const createCheckout = trpc.subscription.createCheckout.useMutation();

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error("Faça login para assinar um plano");
      navigate("/");
      return;
    }

    setLoadingPlan(planId);

    try {
      const result = await createCheckout.mutateAsync({
        plan: planId as "essencial" | "profissional",
        successUrl: `${window.location.origin}/dashboard?checkout=success&onboarding=true`,
        cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
      });

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      toast.error("Erro ao criar checkout. Tente novamente.");
      console.error(error);
    } finally {
      setLoadingPlan(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId;
  };

  // Check for onboarding trigger
  const urlParams = new URLSearchParams(window.location.search);
  const shouldShowOnboarding = urlParams.get('onboarding') === 'true';
  
  if (shouldShowOnboarding && !showOnboarding) {
    setShowOnboarding(true);
  }

  return (
    <>
      {/* Onboarding Premium */}
      <OnboardingPremium 
        isOpen={showOnboarding} 
        onComplete={() => {
          setShowOnboarding(false);
          navigate("/dashboard");
        }}
        userId={user?.id}
      />

      <div className="min-h-screen bg-[#f8f7f4]">
        {/* Header minimalista */}
        <div className="py-6 px-8 flex items-center justify-between border-b border-[#e5e7eb]">
          <div className="flex items-center gap-2">
            <span className="text-[20px]">◆</span>
            <span className="font-serif text-[18px] text-[#1f2933]">Lucresia™</span>
          </div>
          <button 
            onClick={() => navigate("/")}
            className="text-[13px] text-[#6b7280] hover:text-[#1f2933] transition-colors"
          >
            Voltar
          </button>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-4">
              Acesso Estratégico
            </p>
            <h1 className="font-serif text-[36px] md:text-[48px] font-medium text-[#1f2933] leading-tight mb-6">
              Você não está comprando um plano.<br />
              <span className="text-[#111827]">Está assumindo controle.</span>
            </h1>
            <p className="text-[16px] text-[#6b7280] max-w-lg mx-auto">
              Lucresia acompanha seu negócio e aponta o que você está ignorando.
              Sem promessa de dinheiro. Só clareza.
            </p>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {plans?.map((plan) => {
              const isProfissional = plan.id === "profissional";
              const isCurrent = isCurrentPlan(plan.id);

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white border p-8 transition-all ${
                    isProfissional 
                      ? "border-[#111827] shadow-lg" 
                      : "border-[#e5e7eb] hover:border-[#d1d5db]"
                  }`}
                >
                  {/* Badge */}
                  {isProfissional && (
                    <div className="absolute -top-3 left-6">
                      <span className="bg-[#111827] text-white px-3 py-1 text-[11px] uppercase tracking-wide">
                        Recomendado
                      </span>
                    </div>
                  )}

                  {/* Plan Name */}
                  <h3 className="font-serif text-[24px] text-[#1f2933] mb-2">
                    {plan.name}
                  </h3>
                  
                  <p className="text-[13px] text-[#6b7280] mb-6">
                    {isProfissional 
                      ? "Acompanhamento estratégico completo"
                      : "Ferramentas essenciais para começar"
                    }
                  </p>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-[14px] text-[#6b7280]">R$</span>
                      <span className="text-[48px] font-medium text-[#1f2933] leading-none">
                        {plan.price}
                      </span>
                      <span className="text-[14px] text-[#6b7280]">/mês</span>
                    </div>
                    {plan.credits === -1 ? (
                      <p className="text-[13px] text-[#111827] mt-2 font-medium">
                        Créditos ilimitados
                      </p>
                    ) : (
                      <p className="text-[13px] text-[#6b7280] mt-2">
                        {plan.credits} créditos inclusos
                      </p>
                    )}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-[#111827] flex-shrink-0 mt-0.5" />
                        <span className="text-[14px] text-[#374151]">{feature}</span>
                      </li>
                    ))}
                    {isProfissional && (
                      <>
                        <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#111827] flex-shrink-0 mt-0.5" />
                          <span className="text-[14px] text-[#374151]">
                            Diagnósticos da Lucresia
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#111827] flex-shrink-0 mt-0.5" />
                          <span className="text-[14px] text-[#374151]">
                            Comparativo mensal de evolução
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <Check className="w-4 h-4 text-[#111827] flex-shrink-0 mt-0.5" />
                          <span className="text-[14px] text-[#374151]">
                            Alertas de zona de risco
                          </span>
                        </li>
                      </>
                    )}
                  </ul>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan === plan.id || isCurrent}
                    className={`w-full py-4 text-[15px] transition-all ${
                      isProfissional
                        ? "bg-[#111827] text-white hover:opacity-90"
                        : "border border-[#111827] text-[#111827] hover:bg-[#111827] hover:text-white"
                    } ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {loadingPlan === plan.id
                      ? "Processando..."
                      : isCurrent
                      ? "Acesso ativo"
                      : isProfissional
                      ? "Assumir controle"
                      : "Começar"}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Manifesto */}
          <ManifestoLucresia />

          {/* Posicionamento */}
          <div className="mt-16 text-center">
            <p className="text-[14px] text-[#6b7280] mb-4">
              O que você está adquirindo:
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-[13px] text-[#374151]">
              <span className="flex items-center gap-2">
                <span className="text-[#9ca3af]">✗</span> Não é IA genérica
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#9ca3af]">✗</span> Não é curso
              </span>
              <span className="flex items-center gap-2">
                <span className="text-[#9ca3af]">✗</span> Não é CRM comum
              </span>
            </div>
            <p className="mt-6 text-[15px] text-[#1f2933] max-w-md mx-auto">
              É uma <strong>mentora silenciosa</strong>, baseada em dados reais,
              que acompanha até você pensar como empresária.
            </p>
          </div>

          {/* Garantia */}
          <div className="mt-16 p-6 bg-white border border-[#e5e7eb] text-center">
            <p className="text-[14px] text-[#374151]">
              Pagamento seguro via Stripe • Cancele quando quiser • Sem taxa de cancelamento
            </p>
          </div>
        </div>

        {/* Estilos */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500&display=swap');
          body { font-family: 'Inter', sans-serif; }
          .font-serif { font-family: 'Playfair Display', serif; }
        `}</style>
      </div>
    </>
  );
}
