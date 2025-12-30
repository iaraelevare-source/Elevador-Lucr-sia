import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, AlertTriangle, CreditCard, Ban, Scale } from "lucide-react";

export default function Terms() {
  useEffect(() => {
    document.title = "Termos de Uso | Elevare";
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <button className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-white">Termos de Uso</h1>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="prose prose-invert prose-amber max-w-none">
          
          {/* Última atualização */}
          <p className="text-slate-400 text-sm mb-8">
            Última atualização: {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>

          {/* Aceitação */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-amber-500" />
              1. Aceitação dos Termos
            </h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300">
                Ao acessar ou usar a plataforma <strong className="text-white">Elevare</strong>, você concorda 
                em cumprir estes Termos de Uso e todas as leis e regulamentos aplicáveis. Se você não concordar 
                com algum destes termos, está proibido de usar ou acessar este site.
              </p>
            </div>
          </section>

          {/* Descrição do Serviço */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">2. Descrição do Serviço</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300 mb-4">
                A Elevare é uma plataforma de criação de conteúdo com inteligência artificial para 
                empreendedores e criadores de conteúdo. Nossos serviços incluem:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Geração de posts para redes sociais</li>
                <li>Criação de e-books e materiais ricos</li>
                <li>Roteiros para vídeos e reels</li>
                <li>Textos para anúncios e campanhas</li>
                <li>Diagnósticos de marketing digital</li>
                <li>Gestão de leads (CRM)</li>
                <li>Calendário editorial</li>
              </ul>
            </div>
          </section>

          {/* Planos e Pagamentos */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-amber-500" />
              3. Planos e Pagamentos
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">3.1 Planos disponíveis:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li><strong className="text-white">Gratuito:</strong> Acesso limitado ao diagnóstico e radar de bio</li>
                  <li><strong className="text-white">Essencial:</strong> Funcionalidades básicas de criação de conteúdo</li>
                  <li><strong className="text-white">Profissional:</strong> Acesso completo a todas as ferramentas</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">3.2 Cobrança e cancelamento:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>Pagamentos são processados via Stripe de forma segura</li>
                  <li>Assinaturas são renovadas automaticamente</li>
                  <li>Cancelamento pode ser feito a qualquer momento</li>
                  <li>Não há reembolso proporcional após cancelamento</li>
                  <li>O acesso permanece até o fim do período pago</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Uso Aceitável */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-amber-500" />
              4. Uso Aceitável
            </h2>
            <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/30">
              <h3 className="text-lg font-semibold text-red-400 mb-3">É PROIBIDO usar a Elevare para:</h3>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Criar conteúdo ilegal, difamatório, ou que incite violência</li>
                <li>Gerar spam ou conteúdo enganoso</li>
                <li>Violar direitos autorais ou propriedade intelectual</li>
                <li>Coletar dados de outros usuários sem consentimento</li>
                <li>Tentar acessar sistemas ou dados não autorizados</li>
                <li>Revender ou redistribuir acesso à plataforma</li>
                <li>Usar bots ou automações não autorizadas</li>
              </ul>
            </div>
          </section>

          {/* Propriedade Intelectual */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">5. Propriedade Intelectual</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-3">5.1 Conteúdo gerado por você:</h3>
              <p className="text-slate-300 mb-4">
                Você mantém todos os direitos sobre o conteúdo que criar usando nossa plataforma. 
                A Elevare não reivindica propriedade sobre textos, imagens ou outros materiais que você gerar.
              </p>
              <h3 className="text-lg font-semibold text-white mb-3">5.2 Plataforma Elevare:</h3>
              <p className="text-slate-300">
                A marca Elevare, logo, interface, código e algoritmos são propriedade exclusiva da empresa 
                e protegidos por leis de direitos autorais.
              </p>
            </div>
          </section>

          {/* Limitação de Responsabilidade */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              6. Limitação de Responsabilidade
            </h2>
            <div className="bg-amber-500/10 rounded-lg p-6 border border-amber-500/30">
              <p className="text-slate-300 mb-4">
                A Elevare é fornecida "como está", sem garantias de qualquer tipo. Não nos responsabilizamos por:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>Resultados comerciais obtidos com o conteúdo gerado</li>
                <li>Interrupções temporárias de serviço</li>
                <li>Perda de dados por falha técnica ou cancelamento de conta</li>
                <li>Uso indevido do conteúdo gerado por terceiros</li>
                <li>Decisões de negócio baseadas em diagnósticos ou análises</li>
              </ul>
            </div>
          </section>

          {/* Rescisão */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">7. Rescisão</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300">
                Podemos suspender ou encerrar sua conta imediatamente, sem aviso prévio, se você violar 
                estes Termos de Uso. Você também pode encerrar sua conta a qualquer momento através das 
                configurações ou entrando em contato com nosso suporte.
              </p>
            </div>
          </section>

          {/* Lei Aplicável */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Scale className="w-6 h-6 text-amber-500" />
              8. Lei Aplicável
            </h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300">
                Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa 
                será resolvida no foro da comarca de São Paulo/SP, com exclusão de qualquer outro, 
                por mais privilegiado que seja.
              </p>
            </div>
          </section>

          {/* Contato */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Contato</h2>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-6 border border-amber-500/30">
              <p className="text-slate-300 mb-4">
                Para dúvidas sobre estes Termos de Uso, entre em contato:
              </p>
              <div className="space-y-2">
                <p className="text-white"><strong>Email:</strong> contato@elevare.com.br</p>
                <p className="text-white"><strong>Suporte:</strong> suporte@elevare.com.br</p>
              </div>
            </div>
          </section>

        </div>
      </main>

      {/* Footer simples */}
      <footer className="border-t border-slate-700 py-6 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} Elevare. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
