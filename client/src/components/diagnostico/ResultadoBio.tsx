interface ResultadoBioProps {
  score: number;
  avancar: () => void;
  diagnosticoIA?: string;
  isLoading?: boolean;
}

export default function ResultadoBio({ score, avancar, diagnosticoIA, isLoading }: ResultadoBioProps) {
  let nivel = "";
  let subtitulo = "";

  if (score <= 6) {
    nivel = "Bio Invisível";
    subtitulo = "Seu perfil não comunica. A cliente entra e sai sem entender.";
  } else if (score <= 9) {
    nivel = "Bio Estética, mas Fraca";
    subtitulo = "Bonito, mas não converte. Atrai curiosas, não clientes.";
  } else {
    nivel = "Bio Magnética";
    subtitulo = "Sua bio vende. Agora o jogo é escala e ticket alto.";
  }

  const porcentagem = Math.round((score / 12) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Score Visual - Minimalista */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-gray-900 mb-6">
          <span className="text-3xl font-bold text-gray-900">{score}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{nivel}</h2>
        <p className="text-lg text-gray-600">{subtitulo}</p>
      </div>

      {/* Barra de Progresso - Clean */}
      <div className="mb-10 px-4">
        <div className="flex justify-between text-xs text-gray-400 mb-2 uppercase tracking-wide">
          <span>Invisível</span>
          <span>Estética</span>
          <span>Magnética</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gray-900 transition-all duration-1000 ease-out"
            style={{ width: `${porcentagem}%` }}
          />
        </div>
      </div>

      {/* Diagnóstico IA */}
      {isLoading && (
        <div className="bg-gray-50 rounded-xl p-8 mb-8 text-center">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-500 mt-4 text-sm">Gerando seu diagnóstico personalizado...</p>
        </div>
      )}

      {diagnosticoIA && !isLoading && (
        <div className="bg-gray-50 rounded-xl p-8 mb-8 text-left">
          <div className="prose prose-gray max-w-none">
            {diagnosticoIA.split('\n\n').map((paragrafo, i) => (
              <p key={i} className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
                {paragrafo.split('**').map((parte, j) => 
                  j % 2 === 1 ? <strong key={j} className="text-gray-900">{parte}</strong> : parte
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Gancho para próximo nível */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <p className="text-gray-600 leading-relaxed">
          {score <= 6 && "Arrumar a casa é o primeiro passo. Mas quando a cliente te chama no WhatsApp, você sabe cobrar o valor que merece ou acaba dando desconto?"}
          {score > 6 && score <= 9 && "Sua imagem atrai. Mas você está atraindo quem paga 5k ou quem reclama de 200 reais? O problema pode não ser o post."}
          {score > 9 && "Você tem a vitrine de luxo. Mas sua gestão e mentalidade de CEO acompanham essa imagem?"}
        </p>
      </div>

      {/* CTA - Elegante */}
      <button
        onClick={avancar}
        className="
          w-full py-4 px-8 rounded-xl font-medium text-white
          bg-gray-900 hover:bg-gray-800
          transition-all duration-200
        "
      >
        Avançar para Diagnóstico de Maturidade
      </button>

      <p className="mt-4 text-center text-sm text-gray-400">
        Próximo: descobrir em que fase mental e estratégica você está
      </p>
    </div>
  );
}
