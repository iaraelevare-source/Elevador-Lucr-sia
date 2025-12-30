import { useState } from "react";
import { trpc } from "@/lib/trpc";

interface CancelamentoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmCancel: () => void;
  onPause: () => void;
}

export default function CancelamentoModal({ 
  isOpen, 
  onClose, 
  onConfirmCancel,
  onPause 
}: CancelamentoModalProps) {
  const [selected, setSelected] = useState<"pause" | "continue" | "cancel" | null>(null);
  const [confirmStep, setConfirmStep] = useState(false);

  if (!isOpen) return null;

  const handleAction = () => {
    if (selected === "continue") {
      onClose();
    } else if (selected === "pause") {
      onPause();
    } else if (selected === "cancel") {
      if (!confirmStep) {
        setConfirmStep(true);
      } else {
        onConfirmCancel();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-[#f8f7f4] p-8 animate-fade-in">
        
        {!confirmStep ? (
          <>
            {/* Header */}
            <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-3">
              Antes de cancelar
            </p>
            <h2 className="font-serif text-[24px] font-medium text-[#1f2933] mb-6">
              Veja o que seus dados mostram
            </h2>

            {/* Análise da Lucresia */}
            <div className="p-5 bg-white border border-[#d1d5db] mb-8">
              <p className="text-xs text-[#6b7280] uppercase tracking-wide mb-3">
                Análise Lucresia
              </p>
              <p className="text-[15px] text-[#1f2933] leading-relaxed">
                Seu perfil indica que você ainda está em fase de estruturação estratégica.
                Interromper agora significa voltar a operar sem leitura clara dos gargalos
                que hoje já estão mapeados.
              </p>
              <p className="text-[15px] text-[#1f2933] leading-relaxed mt-4">
                Cancelar não apaga o problema.<br />
                Apenas retira o sistema que estava te ajudando a enxergá-lo.
              </p>
            </div>

            {/* Opções */}
            <div className="space-y-3 mb-8">
              <button
                onClick={() => setSelected("pause")}
                className={`w-full p-4 border text-left transition-all ${
                  selected === "pause" 
                    ? "border-[#111827] bg-white" 
                    : "border-[#d1d5db] hover:border-[#9ca3af]"
                }`}
              >
                <p className="text-[15px] text-[#1f2933] font-medium">
                  Pausar acompanhamento por 30 dias
                </p>
                <p className="text-[13px] text-[#6b7280] mt-1">
                  Mantém histórico, sem perder dados
                </p>
              </button>

              <button
                onClick={() => setSelected("continue")}
                className={`w-full p-4 border text-left transition-all ${
                  selected === "continue" 
                    ? "border-[#111827] bg-white" 
                    : "border-[#d1d5db] hover:border-[#9ca3af]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[15px] text-[#1f2933] font-medium">
                      Continuar com Lucresia ativa
                    </p>
                    <p className="text-[13px] text-[#6b7280] mt-1">
                      Recomendado para seu perfil atual
                    </p>
                  </div>
                  <span className="text-[11px] text-[#111827] bg-[#e5e7eb] px-2 py-1 uppercase tracking-wide">
                    Recomendado
                  </span>
                </div>
              </button>

              <button
                onClick={() => setSelected("cancel")}
                className={`w-full p-4 border text-left transition-all ${
                  selected === "cancel" 
                    ? "border-[#111827] bg-white" 
                    : "border-[#d1d5db] hover:border-[#9ca3af]"
                }`}
              >
                <p className="text-[15px] text-[#1f2933] font-medium">
                  Cancelar definitivamente
                </p>
                <p className="text-[13px] text-[#6b7280] mt-1">
                  Perda de histórico, diagnósticos e comparativos
                </p>
              </button>
            </div>

            {/* Aviso */}
            <p className="text-[12px] text-[#9ca3af] text-center mb-6">
              Diagnósticos da Lucresia não são recuperáveis após o cancelamento.
            </p>

            {/* Botão de ação */}
            <button
              onClick={handleAction}
              disabled={!selected}
              className={`w-full py-4 text-[15px] transition-all ${
                selected 
                  ? "bg-[#111827] text-white hover:opacity-90" 
                  : "bg-[#e5e7eb] text-[#9ca3af] cursor-not-allowed"
              }`}
            >
              {selected === "continue" && "Manter assinatura ativa"}
              {selected === "pause" && "Pausar por 30 dias"}
              {selected === "cancel" && "Prosseguir com cancelamento"}
              {!selected && "Selecione uma opção"}
            </button>
          </>
        ) : (
          /* Confirmação final de cancelamento */
          <>
            <h2 className="font-serif text-[24px] font-medium text-[#1f2933] mb-6">
              Confirmação final
            </h2>

            <div className="p-5 bg-[#fef2f2] border border-[#fecaca] mb-8">
              <p className="text-[15px] text-[#991b1b] leading-relaxed">
                Ao confirmar, você perderá acesso a:
              </p>
              <ul className="mt-3 space-y-2 text-[14px] text-[#991b1b]">
                <li>• Todos os diagnósticos gerados</li>
                <li>• Histórico de evolução</li>
                <li>• Comparativos mensais</li>
                <li>• Alertas estratégicos personalizados</li>
              </ul>
            </div>

            <p className="text-[14px] text-[#6b7280] mb-8">
              Essa ação não pode ser desfeita.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmStep(false)}
                className="flex-1 py-4 border border-[#d1d5db] text-[15px] text-[#1f2933] hover:bg-white transition-all"
              >
                Voltar
              </button>
              <button
                onClick={onConfirmCancel}
                className="flex-1 py-4 bg-[#991b1b] text-white text-[15px] hover:opacity-90 transition-all"
              >
                Confirmar cancelamento
              </button>
            </div>
          </>
        )}
      </div>

      {/* Estilos */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:wght@500&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
