/**
 * 🔧 SETUP AUTOMÁTICO DO STRIPE
 * 
 * Este script cria os produtos e preços no Stripe automaticamente.
 * Execute com: npx tsx scripts/setup-stripe.ts
 * 
 * Pré-requisito: STRIPE_SECRET_KEY configurada no .env
 */

import Stripe from 'stripe';

// Configuração
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não encontrada!');
  console.log('\n📋 Configure a variável de ambiente:');
  console.log('   $env:STRIPE_SECRET_KEY = "sk_test_xxx"');
  console.log('   ou');
  console.log('   export STRIPE_SECRET_KEY="sk_test_xxx"');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

// Planos da LucresIA
const PLANS = [
  {
    name: 'LucresIA Start',
    description: 'Clínica Visível & Posicionada - Radar de Bio, Robô de Post, IA de E-books',
    priceInCents: 5700, // R$ 57,00
    features: [
      'Radar de Bio (diagnóstico completo)',
      'Robô de Post Inteligente',
      'IA de E-books com audiobook',
      'Diagnóstico de Posicionamento',
      '100 gerações/mês',
    ],
    metadata: {
      plan_type: 'pro',
      credits_monthly: '100',
    },
  },
  {
    name: 'LucresIA PRO',
    description: 'Clínica Desejada & Lotada - Tudo do Start + CRM, Agenda, Calendário, Anúncios',
    priceInCents: 9700, // R$ 97,00
    features: [
      'Tudo do Plano Start',
      'Roteiros de Reels que Vendem',
      'Anúncios que Atraem Cliente Certa',
      'Fluxo Inteligente de Clientes (CRM)',
      'Agenda Estratégica de Faturamento',
      'Calendário de Conteúdo e Vendas',
      'IA de Neurovendas para Estética',
      'Suporte prioritário',
      '500 gerações/mês',
    ],
    metadata: {
      plan_type: 'pro_plus',
      credits_monthly: '500',
    },
  },
];

async function setupStripe() {
  console.log('🚀 Iniciando setup do Stripe para LucresIA...\n');

  const createdPrices: { planType: string; priceId: string }[] = [];

  for (const plan of PLANS) {
    console.log(`📦 Criando produto: ${plan.name}...`);

    // Criar produto
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description,
      metadata: {
        ...plan.metadata,
        features: JSON.stringify(plan.features),
      },
    });

    console.log(`   ✅ Produto criado: ${product.id}`);

    // Criar preço (assinatura mensal)
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.priceInCents,
      currency: 'brl',
      recurring: {
        interval: 'month',
      },
      metadata: plan.metadata,
    });

    console.log(`   ✅ Preço criado: ${price.id} (R$ ${(plan.priceInCents / 100).toFixed(2)}/mês)`);

    createdPrices.push({
      planType: plan.metadata.plan_type,
      priceId: price.id,
    });
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SETUP COMPLETO! Copie estas variáveis para o Railway:\n');
  
  const proPriceId = createdPrices.find(p => p.planType === 'pro')?.priceId;
  const proPlusPriceId = createdPrices.find(p => p.planType === 'pro_plus')?.priceId;

  console.log(`STRIPE_PRO_PRICE_ID=${proPriceId}`);
  console.log(`STRIPE_PRO_PLUS_PRICE_ID=${proPlusPriceId}`);

  console.log('\n' + '='.repeat(60));
  console.log('📋 PRÓXIMO PASSO: Criar Webhook no Stripe Dashboard\n');
  console.log('1. Acesse: https://dashboard.stripe.com/webhooks');
  console.log('2. Clique em "Add endpoint"');
  console.log('3. URL: https://acceptable-elegance-production-0f9f.up.railway.app/api/stripe/webhook');
  console.log('4. Eventos para escutar:');
  console.log('   - checkout.session.completed');
  console.log('   - customer.subscription.updated');
  console.log('   - customer.subscription.deleted');
  console.log('   - invoice.payment_succeeded');
  console.log('   - invoice.payment_failed');
  console.log('5. Copie o "Signing secret" (whsec_xxx) para:');
  console.log('   STRIPE_WEBHOOK_SECRET=whsec_xxx');
  console.log('\n' + '='.repeat(60));

  return { proPriceId, proPlusPriceId };
}

// Executar
setupStripe()
  .then(result => {
    console.log('\n✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Erro:', error.message);
    process.exit(1);
  });
