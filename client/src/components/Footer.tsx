import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Links principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <h4 className="text-white font-semibold mb-3">Produto</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pricing" className="hover:text-amber-400 transition-colors">Planos</Link></li>
              <li><Link href="/diagnostico" className="hover:text-amber-400 transition-colors">Diagnóstico Grátis</Link></li>
              <li><Link href="/radar-bio" className="hover:text-amber-400 transition-colors">Radar de Bio</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Recursos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard/ebooks" className="hover:text-amber-400 transition-colors">IA de E-books</Link></li>
              <li><Link href="/dashboard/robo-produtor" className="hover:text-amber-400 transition-colors">Robô de Posts</Link></li>
              <li><Link href="/dashboard/anuncios" className="hover:text-amber-400 transition-colors">Gerador de Anúncios</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/privacy" className="hover:text-amber-400 transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/terms" className="hover:text-amber-400 transition-colors">Termos de Uso</Link></li>
              <li><a href="mailto:contato@elevare.com.br" className="hover:text-amber-400 transition-colors">Contato DPO</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Suporte</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:suporte@elevare.com.br" className="hover:text-amber-400 transition-colors">suporte@elevare.com.br</a></li>
              <li><a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer" className="hover:text-amber-400 transition-colors">WhatsApp</a></li>
            </ul>
          </div>
        </div>

        {/* Divisor */}
        <div className="border-t border-slate-800 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Logo e Copyright */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-semibold">Elevare</span>
            </div>
            
            <p className="text-xs text-center">
              © {currentYear} Elevare. Todos os direitos reservados. CNPJ: 00.000.000/0001-00
            </p>

            {/* Conformidade */}
            <div className="flex items-center gap-4 text-xs">
              <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                ✓ LGPD Compliant
              </span>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                🔒 SSL Seguro
              </span>
            </div>
          </div>

          {/* Aviso LGPD */}
          <p className="text-[10px] text-slate-500 text-center mt-4">
            Em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018). 
            Para exercer seus direitos de titular de dados ou dúvidas sobre privacidade, entre em contato: dpo@elevare.com.br
          </p>
        </div>
      </div>
    </footer>
  );
}
