import { useEffect } from "react";
import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, Eye, Trash2, Download, Mail } from "lucide-react";

export default function Privacy() {
  useEffect(() => {
    document.title = "Política de Privacidade | Elevare";
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
            <Shield className="w-6 h-6 text-amber-500" />
            <h1 className="text-xl font-bold text-white">Política de Privacidade</h1>
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

          {/* Introdução */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-amber-500" />
              1. Introdução
            </h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300">
                A <strong className="text-white">Elevare</strong> ("nós", "nosso" ou "Empresa") está comprometida em proteger 
                a privacidade dos usuários de nossa plataforma. Esta Política de Privacidade descreve como coletamos, 
                usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a 
                <strong className="text-amber-400"> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018)</strong>.
              </p>
            </div>
          </section>

          {/* Dados Coletados */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-500" />
              2. Dados que Coletamos
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">2.1 Dados fornecidos por você:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>Nome completo e email (via cadastro Google OAuth)</li>
                  <li>Informações do seu negócio (nome, nicho, público-alvo)</li>
                  <li>Respostas de diagnósticos e quizzes</li>
                  <li>Dados de contato de leads (CRM)</li>
                  <li>Conteúdo gerado (posts, e-books, anúncios)</li>
                </ul>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                <h3 className="text-lg font-semibold text-white mb-3">2.2 Dados coletados automaticamente:</h3>
                <ul className="list-disc list-inside text-slate-300 space-y-2">
                  <li>Endereço IP e localização aproximada</li>
                  <li>Tipo de dispositivo e navegador</li>
                  <li>Páginas visitadas e tempo de permanência</li>
                  <li>Cookies e tecnologias similares</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Finalidade */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-amber-500" />
              3. Como Usamos seus Dados
            </h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Prestação de serviços:</strong> Gerar conteúdo personalizado com IA</li>
                <li><strong className="text-white">Personalização:</strong> Adaptar recomendações ao seu perfil</li>
                <li><strong className="text-white">Comunicação:</strong> Enviar atualizações e notificações importantes</li>
                <li><strong className="text-white">Melhoria:</strong> Aprimorar nossos algoritmos e funcionalidades</li>
                <li><strong className="text-white">Segurança:</strong> Prevenir fraudes e acessos não autorizados</li>
                <li><strong className="text-white">Obrigações legais:</strong> Cumprir exigências fiscais e regulatórias</li>
              </ul>
            </div>
          </section>

          {/* Seus Direitos */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Download className="w-6 h-6 text-amber-500" />
              4. Seus Direitos (LGPD Art. 18)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg p-4 border border-green-500/20">
                <h4 className="font-semibold text-green-400 mb-2">✓ Acesso</h4>
                <p className="text-sm text-slate-300">Solicitar cópia de todos os seus dados pessoais</p>
              </div>
              <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg p-4 border border-blue-500/20">
                <h4 className="font-semibold text-blue-400 mb-2">✓ Correção</h4>
                <p className="text-sm text-slate-300">Retificar dados incompletos ou incorretos</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 rounded-lg p-4 border border-amber-500/20">
                <h4 className="font-semibold text-amber-400 mb-2">✓ Portabilidade</h4>
                <p className="text-sm text-slate-300">Transferir seus dados para outro serviço</p>
              </div>
              <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 rounded-lg p-4 border border-red-500/20">
                <h4 className="font-semibold text-red-400 mb-2">✓ Eliminação</h4>
                <p className="text-sm text-slate-300">Solicitar exclusão dos seus dados pessoais</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 rounded-lg p-4 border border-purple-500/20">
                <h4 className="font-semibold text-purple-400 mb-2">✓ Revogação</h4>
                <p className="text-sm text-slate-300">Retirar consentimento a qualquer momento</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 rounded-lg p-4 border border-cyan-500/20">
                <h4 className="font-semibold text-cyan-400 mb-2">✓ Oposição</h4>
                <p className="text-sm text-slate-300">Opor-se ao tratamento de dados</p>
              </div>
            </div>
          </section>

          {/* Retenção */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-amber-500" />
              5. Retenção e Exclusão
            </h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300 mb-4">
                Mantemos seus dados apenas pelo tempo necessário para cumprir as finalidades descritas:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Dados de conta:</strong> Enquanto sua conta estiver ativa</li>
                <li><strong className="text-white">Dados de pagamento:</strong> 5 anos (obrigação fiscal)</li>
                <li><strong className="text-white">Logs de acesso:</strong> 6 meses (Marco Civil da Internet)</li>
                <li><strong className="text-white">Conteúdo gerado:</strong> Até exclusão da conta</li>
              </ul>
            </div>
          </section>

          {/* Contato DPO */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-amber-500" />
              6. Contato do Encarregado (DPO)
            </h2>
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-6 border border-amber-500/30">
              <p className="text-slate-300 mb-4">
                Para exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato:
              </p>
              <div className="space-y-2">
                <p className="text-white"><strong>Email:</strong> dpo@elevare.com.br</p>
                <p className="text-white"><strong>Prazo de resposta:</strong> Até 15 dias úteis</p>
              </div>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-4">7. Cookies</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300 mb-4">Utilizamos cookies para:</p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li><strong className="text-white">Essenciais:</strong> Manter sua sessão ativa e segura</li>
                <li><strong className="text-white">Preferências:</strong> Lembrar suas configurações</li>
                <li><strong className="text-white">Analytics:</strong> Entender como você usa nossa plataforma</li>
              </ul>
              <p className="text-slate-400 mt-4 text-sm">
                Você pode gerenciar cookies nas configurações do seu navegador.
              </p>
            </div>
          </section>

          {/* Alterações */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Alterações nesta Política</h2>
            <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
              <p className="text-slate-300">
                Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas 
                por email ou através de aviso em nossa plataforma. Recomendamos revisar esta página regularmente.
              </p>
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
