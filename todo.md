# Elevare AI NeuroVendas - TODO

## 1. Configuração Base
- [x] Configurar schema do banco de dados com todas as tabelas necessárias
- [x] Configurar tema visual âmbar/laranja e roxo/rosa no Tailwind
- [x] Adicionar integração com Stripe
- [x] Configurar variáveis de ambiente para APIs externas
- [x] Configurar integração com Google Gemini AI
- [x] Configurar AWS S3 para armazenamento de arquivos

## 2. Sistema de Autenticação e Usuários
- [x] Implementar autenticação OAuth com Manus
- [x] Adicionar sistema de roles (admin/user) no schema
- [x] Criar middleware de autorização para rotas protegidas
- [x] Implementar verificação de role admin

## 3. Sistema de Créditos e Monetização
- [x] Criar tabela de créditos no banco de dados
- [x] Implementar lógica de consumo de créditos por funcionalidade
- [x] Criar sistema de planos (Grátis: 10 créditos, PRO: 100 créditos, PRO+: ilimitado)
- [x] Integrar checkout do Stripe
- [x] Implementar webhooks do Stripe para atualização de assinaturas
- [x] Criar portal do cliente Stripe
- [x] Implementar gerenciamento de assinaturas
- [x] Criar componente de exibição de créditos
- [x] Criar modal de upgrade de plano

## 4. Radar de Bio
- [x] Criar tabela de diagnósticos no banco de dados
- [x] Criar tabela de leads no banco de dados
- [x] Implementar análise de bio do Instagram com IA Gemini
- [x] Criar sistema de pontuação e diagnóstico personalizado
- [x] Implementar recomendações práticas baseadas em neurovendas
- [x] Criar formulário de captura de leads (email/WhatsApp)
- [x] Implementar notificação automática ao proprietário quando lead for capturado
- [x] Criar interface do Radar de Bio
- [x] Criar tRPC router para Radar de Bio
- [x] Implementar sistema de envio de notificações por email/WhatsApp

## 5. Gerenciador de E-books
- [x] Criar tabela de e-books no banco de dados
- [x] Implementar geração automática de e-books com IA
- [x] Adicionar personalização de tom e público-alvo
- [x] Implementar geração de capas com IA
- [x] Configurar armazenamento de capas no S3
- [x] Implementar exportação para PDF
- [x] Criar biblioteca de e-books do usuário
- [x] Criar interface do gerenciador de e-books
- [x] Criar tRPC router para e-books
- [ ] Adicionar preview do e-book antes de gerar PDF
- [ ] Implementar edição de e-books gerados
- [ ] Adicionar templates de capas predefinidos

## 6. Robô Produtor
- [x] Criar tabela de prompts gerados no banco de dados
- [x] Criar tabela de anúncios gerados no banco de dados
- [x] Implementar gerador de prompts para Midjourney/DALL-E/Stable Diffusion
- [x] Implementar gerador de anúncios para Instagram/Facebook/Google
- [x] Aplicar técnicas de neurovendas na geração de conteúdo
- [x] Criar interface do robô produtor
- [x] Criar tRPC router para robô produtor
- [ ] Adicionar histórico de prompts e anúncios gerados
- [ ] Implementar sistema de favoritos
- [ ] Adicionar exportação em lote

## 7. Painel de Controle
- [x] Criar dashboard com estatísticas em tempo real
- [x] Implementar visualização de créditos disponíveis
- [x] Criar cards de acesso rápido para todas as funcionalidades
- [x] Implementar gráficos de uso e estatísticas
- [x] Criar navegação principal com sidebar
- [x] Implementar tema dark/light
- [ ] Adicionar notificações em tempo real
- [ ] Criar tutorial interativo para novos usuários
- [ ] Implementar sistema de feedback

## 8. Sistema de Admin
- [ ] Criar painel administrativo
- [ ] Implementar visualização de todos os usuários
- [ ] Criar sistema de gerenciamento de assinaturas
- [ ] Implementar logs de uso do sistema
- [ ] Criar relatórios de uso por funcionalidade
- [ ] Implementar sistema de suporte/tickets

## 9. Testes e Qualidade
- [x] Criar testes vitest para sistema de créditos
- [x] Criar testes vitest para webhooks do Stripe
- [ ] Criar testes vitest para Radar de Bio
- [ ] Criar testes vitest para geração de e-books
- [ ] Criar testes vitest para robô produtor
- [ ] Implementar testes E2E com Playwright
- [ ] Adicionar testes de integração

## 10. Otimizações e Performance
- [ ] Implementar cache Redis para queries frequentes
- [ ] Otimizar queries do banco de dados
- [ ] Implementar lazy loading de componentes
- [ ] Adicionar compressão de imagens
- [ ] Implementar CDN para assets estáticos
- [ ] Adicionar rate limiting nas APIs

## 11. SEO e Marketing
- [ ] Configurar meta tags dinâmicas
- [ ] Criar página de landing otimizada
- [ ] Implementar sistema de referral/afiliados
- [ ] Adicionar analytics (Google Analytics/Mixpanel)
- [ ] Criar blog integrado
- [ ] Implementar sistema de cupons de desconto

## 12. Finalização
- [ ] Revisar toda a interface e responsividade
- [ ] Testar fluxo completo de usuário
- [ ] Verificar integração com todas as APIs
- [ ] Criar documentação técnica
- [ ] Criar guia do usuário
- [ ] Preparar ambiente de produção
- [ ] Configurar monitoramento (Sentry/LogRocket)
- [ ] Criar checkpoint final

## Prioridades Imediatas
1. ✅ Concluir integração do Radar de Bio
2. ✅ Finalizar gerador de e-books
3. ✅ Implementar robô produtor
4. 🔄 Criar painel administrativo
5. 🔄 Implementar testes completos
6. 🔄 Otimizar performance