import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface OnboardingPremiumProps {
  isOpen: boolean;
  onComplete: () => void;
  userId?: number;
}

export default function OnboardingPremium({ 
  isOpen, 
  onComplete,
  userId 
}: OnboardingPremiumProps) {
  const [step, setStep] = useState(1);
  const [leituraIA, setLeituraIA] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Buscar leitura inicial quando chegar na tela 4
  useEffect(() => {
    if (step === 4 && !leituraIA) {
      gerarLeituraInicial();
    }
  }, [step]);

  const gerarLeituraInicial = async () => {
    setLoading(true);
    // Simula leitura da Lucresia - na produção, usar endpoint real
    setTimeout(() => {
      setLeituraIA(
        "Com base no seu histórico, o maior risco atual é a centralização operacional. " +
        "O foco desta semana deve ser reduzir decisões de execução e priorizar organização."
      );
      setLoading(false);
    }, 2000);
  };

  if (!isOpen) return null;

  const nextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f7f4] overflow-auto">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#e5e7eb]">
        <div 
          className="h-full bg-[#111827] transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      {/* Indicador de etapa */}
      <div className="fixed top-8 left-8">
        <span className="text-[12px] text-[#6b7280]">
          {step}/4
        </span>
      </div>

      {/* Conteúdo */}
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-xl animate-fade-in" key={step}>
          
          {/* TELA 1 — CONFIRMAÇÃO DE POSICIONAMENTO */}
          {step === 1 && (
            <div className="text-center">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-4">
                Assinatura confirmada
              </p>
              
              <h1 className="font-serif text-[32px] md:text-[40px] font-medium text-[#1f2933] leading-tight mb-8">
                Você não assinou um plano.<br />
                <span className="text-[#111827]">Assumiu um novo nível de comando.</span>
              </h1>

              <div className="max-w-md mx-auto">
                <p className="text-[16px] text-[#374151] leading-relaxed mb-4">
                  A partir de agora, Lucresia acompanha seu negócio continuamente.
                </p>
                <p className="text-[16px] text-[#374151] leading-relaxed">
                  Ela não observa o que você diz que faz.<br />
                  <strong className="text-[#1f2933]">Observa o que você realmente decide.</strong>
                </p>
              </div>

              <button
                onClick={nextStep}
                className="mt-12 px-8 py-4 bg-[#111827] text-white text-[15px] hover:opacity-90 transition-all"
              >
                Iniciar acompanhamento estratégico
              </button>
            </div>
          )}

          {/* TELA 2 — O QUE MUDA NA PRÁTICA */}
          {step === 2 && (
            <div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-4">
                O que muda agora
              </p>
              
              <h1 className="font-serif text-[28px] md:text-[36px] font-medium text-[#1f2933] leading-tight mb-10">
                O que passa a acontecer
              </h1>

              <div className="space-y-6 mb-10">
                <div className="flex gap-4 items-start p-5 bg-white border border-[#e5e7eb]">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#111827] text-white text-[13px] flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="text-[15px] text-[#1f2933] font-medium">
                      Lucresia analisa seus dados semanalmente
                    </p>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                      Leitura contínua, não pontual
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-white border border-[#e5e7eb]">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#111827] text-white text-[13px] flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="text-[15px] text-[#1f2933] font-medium">
                      Gargalos são sinalizados antes de virarem caos
                    </p>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                      Alertas preventivos, não reativos
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-white border border-[#e5e7eb]">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#111827] text-white text-[13px] flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="text-[15px] text-[#1f2933] font-medium">
                      Seu score deixa de ser pontual e vira histórico
                    </p>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                      Evolução mensurável ao longo do tempo
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-5 bg-white border border-[#e5e7eb]">
                  <div className="w-8 h-8 flex items-center justify-center bg-[#111827] text-white text-[13px] flex-shrink-0">
                    4
                  </div>
                  <div>
                    <p className="text-[15px] text-[#1f2933] font-medium">
                      Decisões deixam de ser intuitivas e passam a ser orientadas
                    </p>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                      Dados, não achismo
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[14px] text-[#6b7280] text-center mb-10">
                Sem promessa de dinheiro. Só controle.
              </p>

              <button
                onClick={nextStep}
                className="w-full py-4 bg-[#111827] text-white text-[15px] hover:opacity-90 transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* TELA 3 — PAPEL DA LUCRESIA */}
          {step === 3 && (
            <div className="text-center">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-4">
                Como funciona
              </p>
              
              <h1 className="font-serif text-[28px] md:text-[36px] font-medium text-[#1f2933] leading-tight mb-10">
                Como usar Lucresia<br />da forma correta
              </h1>

              <div className="max-w-md mx-auto bg-white border border-[#e5e7eb] p-8 mb-8">
                <p className="text-[17px] text-[#1f2933] leading-relaxed">
                  Lucresia não substitui você.
                </p>
                <p className="text-[17px] text-[#111827] font-medium leading-relaxed mt-2">
                  Ela impede que você se sabote.
                </p>
              </div>

              <div className="max-w-md mx-auto p-6 bg-[#fef3cd] border border-[#f59e0b]/30">
                <p className="text-[14px] text-[#92400e] leading-relaxed">
                  <strong>Atenção:</strong> Sempre que um alerta aparecer, não ignore.
                  Ele indica exatamente onde sua atenção está sendo mal alocada.
                </p>
              </div>

              <button
                onClick={nextStep}
                className="mt-12 w-full py-4 bg-[#111827] text-white text-[15px] hover:opacity-90 transition-all"
              >
                Continuar
              </button>
            </div>
          )}

          {/* TELA 4 — PRIMEIRA LEITURA AO VIVO */}
          {step === 4 && (
            <div>
              <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-4">
                Primeira análise
              </p>
              
              <h1 className="font-serif text-[28px] md:text-[36px] font-medium text-[#1f2933] leading-tight mb-10">
                Leitura inicial do seu negócio
              </h1>

              <div className="bg-white border border-[#111827] p-8 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e] animate-pulse" />
                  <span className="text-[12px] text-[#6b7280] uppercase tracking-wide">
                    Lucresia — Análise em tempo real
                  </span>
                </div>

                {loading ? (
                  <div className="space-y-3">
                    <div className="h-4 bg-[#e5e7eb] rounded animate-pulse w-full" />
                    <div className="h-4 bg-[#e5e7eb] rounded animate-pulse w-3/4" />
                    <div className="h-4 bg-[#e5e7eb] rounded animate-pulse w-5/6" />
                  </div>
                ) : (
                  <p className="text-[16px] text-[#1f2933] leading-relaxed italic">
                    "{leituraIA}"
                  </p>
                )}
              </div>

              <div className="bg-[#f3f4f6] p-5 mb-10">
                <p className="text-[13px] text-[#6b7280]">
                  Esta é sua primeira leitura. A cada semana, Lucresia atualizará sua análise
                  com base nas suas ações e decisões dentro da plataforma.
                </p>
              </div>

              <button
                onClick={nextStep}
                disabled={loading}
                className={`w-full py-4 text-[15px] transition-all ${
                  loading 
                    ? "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
                    : "bg-[#111827] text-white hover:opacity-90"
                }`}
              >
                Ir para meu painel estratégico
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Estilos */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
