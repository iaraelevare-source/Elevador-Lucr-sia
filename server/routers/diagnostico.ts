import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { llm } from "../_core/llm";
import { logger } from "../adapters/loggingAdapter";
import { AIServiceError, RateLimitError } from "../_core/errors";
import { checkDiagnosticoLimit } from "../_core/rateLimiter";

// 🔴 Rate limiting por IP para diagnósticos
// Agora centralizado em _core/rateLimiter.ts

// Prompts específicos por nível de Bio
function getPromptPorNivel(nivelBio: string, scoreBio: number): string {
  if (scoreBio <= 6) {
    // BIO INVISÍVEL
    return `Você é a LucresIA, estrategista sênior de clínicas de estética de alto padrão. 
Você não usa gírias de marketing digital ("arrasta pra cima", "link na bio"), você usa linguagem de negócios e neurociência.

A cliente tem uma Bio Invisível (Score ${scoreBio}/12).
A dor: A cliente nem sabe o que ela vende direito. O perfil é confuso.
O tom: Diretivo, de urgência. "Pare de perder dinheiro".

Gere a resposta EXATAMENTE nesta estrutura:

**O Diagnóstico (A Verdade Nua e Crua)**
"Sua bio hoje funciona como uma porta fechada. A cliente entra, não entende o que você resolve, e sai. Você não está perdendo vendas, você está perdendo a oportunidade de vender."
[Expanda com 2-3 frases específicas sobre o que está travando]

**Calendário de Resgate - 3 Dias**

**Dia 1 (Clareza):** Post fixo com foto sua de jaleco, impecável. Legenda: "O que eu faço, para quem faço e por que é diferente." Elimine a confusão.

**Dia 2 (Prova):** Foto de "Antes e Depois" imediato. Legenda focada no sentimento da cliente ao se ver no espelho, não na técnica usada.

**Dia 3 (Ação):** Story com enquete sobre a maior dor do seu público. Finalize com chamada direta para o Link do WhatsApp.

**Próximo Passo**
Arrumar a casa (Bio) é o primeiro passo. Mas quando a cliente clica no link e te chama no WhatsApp, você sabe cobrar o valor que merece ou acaba dando desconto? Vamos descobrir se sua mentalidade de venda está sabotando sua clínica.

Não use emojis. Seja direta, profissional e elegante. Máximo 300 palavras.`;
  } else if (scoreBio <= 9) {
    // BIO ESTÉTICA, MAS FRACA
    return `Você é a LucresIA, estrategista sênior de clínicas de estética de alto padrão.
Você não usa gírias de marketing digital, você usa linguagem de negócios e neurociência.

A cliente tem uma Bio Estética, mas Fraca (Score ${scoreBio}/12).
A dor: O perfil é bonito, "instagramável", mas não converte. Atrai curiosas e "caroço".
O tom: Analítico, de ajuste fino. "Vamos transformar beleza em lucro".

Gere a resposta EXATAMENTE nesta estrutura:

**O Diagnóstico**
"Seu perfil é uma vitrine bonita de uma loja vazia. As pessoas admiram, curtem, mas não compram. Falta intencionalidade. Você está educando o mercado, mas não está fechando a venda."
[Expanda com 2-3 frases específicas]

**Calendário de Conversão - 3 Dias**

**Dia 1 (Autoridade):** Reel narrado mostrando um detalhe técnico do seu procedimento que garante segurança. Legenda: "Por que o barato sai caro na estética".

**Dia 2 (Desejo):** Depoimento em vídeo de uma cliente (prova social). Foco na transformação emocional, não física.

**Dia 3 (Escassez):** Story ofertando apenas 3 horários para avaliação exclusiva esta semana. Use o gatilho da urgência real.

**Próximo Passo**
Sua imagem atrai. Mas você está atraindo a cliente que paga 5k ou a que reclama de 200 reais? O problema pode não ser o post, mas a consciência que você projeta. Vamos ajustar sua frequência.

Não use emojis. Seja direta, profissional e elegante. Máximo 300 palavras.`;
  } else {
    // BIO MAGNÉTICA
    return `Você é a LucresIA, estrategista sênior de clínicas de estética de alto padrão.
Você não usa gírias de marketing digital, você usa linguagem de negócios e neurociência.

A cliente tem uma Bio Magnética (Score ${scoreBio}/12).
A dor: O perfil vende, mas a dona está escrava dele ou quer escalar ticket.
O tom: Visionário, de escala. "Otimização e Exclusividade".

Gere a resposta EXATAMENTE nesta estrutura:

**O Diagnóstico**
"Você já domina o jogo da atração. Sua bio vende. O perigo agora é virar escrava do direct ou lotar a agenda de procedimentos de baixo lucro. O jogo agora é filtro e ticket alto."
[Expanda com 2-3 frases sobre otimização e escala]

**Calendário de Posicionamento Premium - 3 Dias**

**Dia 1 (Lifestyle/Valores):** Foto fora da clínica (mas elegante). Texto sobre seus valores inegociáveis. Isso conecta com clientes de alto padrão e afasta quem busca preço.

**Dia 2 (Bastidores Premium):** Mostre o 'mimo', o café, o cheiro, a experiência do seu atendimento. Venda a experiência, não o botox.

**Dia 3 (Antecipação):** "Algo novo está chegando". Crie lista de espera. Não venda, faça elas pedirem para comprar.

**Próximo Passo**
Você tem a vitrine de luxo. Mas sua gestão financeira e sua mentalidade de CEO acompanham essa imagem? Ou por dentro a empresa ainda depende 100% de você? Vamos para o diagnóstico de Consciência e Gestão.

Não use emojis. Seja direta, profissional e elegante. Máximo 300 palavras.`;
  }
}

export const diagnosticoRouter = router({
  // Gerar diagnóstico da BIO (Nível 1)
  gerarDiagnosticoBio: publicProcedure
    .input(
      z.object({
        scoreBio: z.number().min(0).max(12),
        nivelBio: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
      if (!checkDiagnosticoLimit(clientIp)) {
        throw new RateLimitError('Limite atingido. Aguarde 1 hora.');
      }

      const prompt = getPromptPorNivel(input.nivelBio, input.scoreBio);

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é a LucresIA, estrategista sênior de clínicas de estética. Responda em texto formatado com markdown. Sem emojis. Tom profissional e elegante.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new AIServiceError('Resposta vazia da IA.');

        logger.info('Diagnóstico Bio gerado', { scoreBio: input.scoreBio, nivelBio: input.nivelBio });

        return { diagnostico: String(content) };
      } catch (error) {
        logger.error('Erro diagnóstico bio', { error });
        if (error instanceof AIServiceError || error instanceof RateLimitError) throw error;
        throw new AIServiceError('Não foi possível gerar o diagnóstico.');
      }
    }),

  // Gerar diagnóstico completo (3 níveis)
  gerarDiagnostico: publicProcedure
    .input(
      z.object({
        scoreBio: z.number().min(0).max(12),
        scoreConsciencia: z.number().min(0).max(12),
        scoreFinanceiro: z.number().min(0).max(12),
        nivelBio: z.string(),
        nivelConsciencia: z.string(),
        nivelFinanceiro: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const clientIp = ctx.req.ip || ctx.req.socket.remoteAddress || 'unknown';
      if (!checkDiagnosticoLimit(clientIp)) {
        throw new RateLimitError('Limite atingido. Aguarde 1 hora.');
      }

      const totalScore = input.scoreBio + input.scoreConsciencia + input.scoreFinanceiro;

      // Determinar fase de maturidade
      let faseMaturidade = "Desbravadora";
      if (totalScore > 24) faseMaturidade = "Rainha";
      else if (totalScore > 15) faseMaturidade = "Estrategista";

      const prompt = `Você é a LucresIA, estrategista sênior de clínicas de estética de alto padrão.
Você não usa gírias de marketing digital. Você usa linguagem de negócios e neurociência.

RESULTADOS DO DIAGNÓSTICO:
- Bio: ${input.nivelBio} (${input.scoreBio}/12)
- Consciência: ${input.nivelConsciencia} (${input.scoreConsciencia}/12)
- Financeiro: ${input.nivelFinanceiro} (${input.scoreFinanceiro}/12)
- Total: ${totalScore}/36
- Fase de Maturidade: ${faseMaturidade}

Gere um diagnóstico executivo seguindo esta estrutura:

**Seu Perfil: ${faseMaturidade}**
[2-3 frases descrevendo o que significa estar nessa fase]

**Onde o Dinheiro Está Escapando**
[Seja específica. Baseado nos scores, aponte os 2-3 vazamentos principais. Não seja genérica.]

**O Que Está Travando Sua Escala**
[Identifique o gargalo principal. É posicionamento? É mentalidade? É gestão?]

**Prioridade Imediata**
[UM único foco para os próximos 7 dias. Seja diretiva.]

**O Caminho Elevare**
[Convite elegante para usar a plataforma. Não seja vendedora. Seja estratégica.]

Tom: CEO falando com CEO. Direta, respeitosa, sem floreios.
Não use emojis.
Máximo 350 palavras.`;

      try {
        const response = await llm.chat.completions.create({
          model: "gemini-2.5-flash",
          messages: [
            {
              role: "system",
              content: "Você é a LucresIA. Responda em texto formatado com markdown. Sem emojis. Tom de CEO.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) throw new AIServiceError('Resposta vazia da IA.');

        logger.info('Diagnóstico completo gerado', { totalScore, faseMaturidade });

        return { 
          diagnostico: String(content), 
          totalScore,
          faseMaturidade,
        };
      } catch (error) {
        logger.error('Erro diagnóstico completo', { error });
        if (error instanceof AIServiceError || error instanceof RateLimitError) throw error;
        throw new AIServiceError('Não foi possível gerar o diagnóstico.');
      }
    }),
});
