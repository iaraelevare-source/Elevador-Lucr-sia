import React, { useState } from 'react';
import { trpc } from "@/lib/trpc";

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  diagnosticoId?: number;
}

export function UnlockModal({ isOpen, onClose, diagnosticoId }: UnlockModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [success, setSuccess] = useState(false);
  const [trialExpiresAt, setTrialExpiresAt] = useState<Date | null>(null);

  // Mutations
  const submitFeedback = trpc.gamification.submitFeedback.useMutation();
  const trackShare = trpc.gamification.trackShare.useMutation();
  const trackGoogleReview = trpc.gamification.trackGoogleReviewIntent.useMutation();
  const { data: referralData } = trpc.gamification.getReferralLink.useQuery();

  if (!isOpen) return null;

  const handleFeedbackSubmit = async () => {
    if (rating === 0) return;
    
    try {
      const result = await submitFeedback.mutateAsync({
        rating,
        comment: comment || undefined,
        diagnosticoId,
      });
      setTrialExpiresAt(new Date(result.trialExpiresAt));
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao enviar feedback:', error);
    }
  };

  const handleWhatsAppShare = async () => {
    if (referralData?.whatsappLink) {
      window.open(referralData.whatsappLink, '_blank');
      try {
        const result = await trackShare.mutateAsync({ method: 'whatsapp' });
        setTrialExpiresAt(new Date(result.trialExpiresAt));
        setSuccess(true);
      } catch (error) {
        console.error('Erro ao registrar compartilhamento:', error);
      }
    }
  };

  const handleGoogleReview = async () => {
    try {
      const result = await trackGoogleReview.mutateAsync({ diagnosticoId });
      if (result.googleReviewUrl) {
        window.open(result.googleReviewUrl, '_blank');
      }
      if (result.trialExpiresAt) {
        setTrialExpiresAt(new Date(result.trialExpiresAt));
      }
      setSuccess(true);
    } catch (error) {
      console.error('Erro ao registrar intenção Google:', error);
    }
  };

  // Tela de sucesso
  if (success) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 text-center animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            Acesso liberado
          </h3>
          
          <p className="text-gray-500 mb-6">
            Seus 30 dias de acesso gratuito à LucresIA foram ativados.
          </p>
          
          {trialExpiresAt && (
            <p className="text-sm text-gray-400 mb-8">
              Válido até {trialExpiresAt.toLocaleDateString('pt-BR')}
            </p>
          )}
          
          <button
            onClick={onClose}
            className="w-full py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all"
          >
            Explorar a plataforma
          </button>
        </div>
      </div>
    );
  }

  // Tela de feedback
  if (selectedOption === 'feedback') {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div 
          className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 animate-fade-in"
          onClick={e => e.stopPropagation()}
        >
          <button 
            onClick={() => setSelectedOption(null)}
            className="absolute top-5 left-5 text-gray-400 hover:text-gray-600"
          >
            ← Voltar
          </button>
          
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400"
          >
            ×
          </button>
          
          <div className="text-center mt-4">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Como foi sua experiência?
            </h3>
            <p className="text-gray-500 text-sm mb-8">
              Sua opinião nos ajuda a melhorar a LucresIA.
            </p>
            
            {/* Estrelas */}
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                  title={`${star} estrela${star > 1 ? 's' : ''}`}
                  aria-label={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                >
                  <svg 
                    className={`w-10 h-10 transition-colors ${
                      star <= (hoverRating || rating) 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-200'
                    }`}
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </button>
              ))}
            </div>
            
            {/* Comentário opcional */}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Quer deixar um comentário? (opcional)"
              className="w-full p-4 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gray-200"
              rows={3}
            />
            
            <button
              onClick={handleFeedbackSubmit}
              disabled={rating === 0 || submitFeedback.isPending}
              className="mt-6 w-full py-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitFeedback.isPending ? 'Enviando...' : 'Enviar avaliação'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Tela principal de opções
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div 
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-10 animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 text-lg"
        >
          ×
        </button>
        
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Diagnóstico entregue com sucesso
          </h3>
          <p className="text-gray-500 text-sm">
            Escolha uma opção abaixo para liberar 30 dias de acesso gratuito à LucresIA:
          </p>
        </div>

        <div className="space-y-3">
          {/* Opção 1: Avaliar */}
          <button
            onClick={() => setSelectedOption('feedback')}
            className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Avaliar a experiência</p>
              <p className="text-sm text-gray-500">Conte como foi o diagnóstico</p>
            </div>
          </button>

          {/* Opção 2: Compartilhar */}
          <button
            onClick={handleWhatsAppShare}
            disabled={trackShare.isPending}
            className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Compartilhar com uma amiga</p>
              <p className="text-sm text-gray-500">Envie pelo WhatsApp</p>
            </div>
          </button>

          {/* Opção 3: Google Review */}
          <button
            onClick={handleGoogleReview}
            disabled={trackGoogleReview.isPending}
            className="w-full p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left flex items-center gap-4 disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-900">Avaliar no Google</p>
              <p className="text-sm text-gray-500">Ajude outras profissionais</p>
            </div>
          </button>
        </div>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Uma ação = 30 dias gratuitos. Simples assim.
        </p>
      </div>
    </div>
  );
}

// Componente de Barra de Progresso
export function ProgressBar({ 
  diagnosticoCompleted, 
  planoGenerated, 
  trialActive 
}: { 
  diagnosticoCompleted: boolean;
  planoGenerated: boolean;
  trialActive: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6">
      <p className="text-sm text-gray-400 mb-4">Seu progresso</p>
      
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            diagnosticoCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {diagnosticoCompleted ? '✓' : '1'}
          </div>
          <span className={diagnosticoCompleted ? 'text-gray-900' : 'text-gray-400'}>
            Diagnóstico
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            planoGenerated ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {planoGenerated ? '✓' : '2'}
          </div>
          <span className={planoGenerated ? 'text-gray-900' : 'text-gray-400'}>
            Plano
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
            trialActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            {trialActive ? '✓' : '🔓'}
          </div>
          <span className={trialActive ? 'text-gray-900' : 'text-gray-400'}>
            {trialActive ? 'Teste ativo' : 'Teste gratuito'}
          </span>
        </div>
      </div>
    </div>
  );
}
