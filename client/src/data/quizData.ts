/**
 * 🧠 QUIZ DATA - AUTORIDADE COGNITIVA
 * Sistema de perguntas estratégicas com microcopy psicológico
 * 
 * Estrutura:
 * - Nível 1: Consciência (3 perguntas) - Já existe em DiagnosticoElevare
 * - Nível 2: Maturidade de Gestão (7 perguntas) - NOVO
 * - Nível 3: Diagnóstico Financeiro Profundo (8 perguntas) - NOVO
 */

export interface QuizOption {
  texto: string;
  valor: 1 | 2 | 3;
}

export interface QuizQuestion {
  id: string;
  pergunta: string;
  microcopy: string; // Frase de impacto psicológico
  opcoes: QuizOption[];
  categoria: "consciencia" | "maturidade" | "financeiro" | "posicionamento";
}

// ============================================
// NÍVEL 1: CONSCIÊNCIA (Perguntas originais)
// ============================================
export const PERGUNTAS_CONSCIENCIA: QuizQuestion[] = [
  {
    id: "c1",
    categoria: "consciencia",
    microcopy: "Quem faz tudo, não lidera nada.",
    pergunta: "Quando algo precisa ser feito na clínica, sua tendência natural é:",
    opcoes: [
      { texto: "Fazer pessoalmente para garantir o padrão", valor: 1 },
      { texto: "Acompanhar de perto mesmo delegando", valor: 2 },
      { texto: "Criar um padrão que não dependa de mim", valor: 3 },
    ]
  },
  {
    id: "c2",
    categoria: "consciencia",
    microcopy: "Seu tempo revela suas prioridades — e seu teto de crescimento.",
    pergunta: "A maior parte do seu dia é consumida por:",
    opcoes: [
      { texto: "Execução técnica e imprevistos", valor: 1 },
      { texto: "Atendimento e organização", valor: 2 },
      { texto: "Decisão e direcionamento estratégico", valor: 3 },
    ]
  },
  {
    id: "c3",
    categoria: "consciencia",
    microcopy: "A empresa que depende de você não é empresa — é armadilha.",
    pergunta: "Se você tirasse 15 dias de férias hoje, o que aconteceria?",
    opcoes: [
      { texto: "A clínica pararia", valor: 1 },
      { texto: "Funcionaria com dificuldade", valor: 2 },
      { texto: "Seguiria normalmente", valor: 3 },
    ]
  },
];

// ============================================
// NÍVEL 2: MATURIDADE DE GESTÃO (7 perguntas)
// ============================================
export const PERGUNTAS_MATURIDADE: QuizQuestion[] = [
  {
    id: "m1",
    categoria: "maturidade",
    microcopy: "Crise revela estrutura. Sem estrutura, crise vira rotina.",
    pergunta: "Quando surge uma crise inesperada (funcionária faltou, equipamento quebrou), você:",
    opcoes: [
      { texto: "Apago incêndios o dia todo", valor: 1 },
      { texto: "Resolvo, mas atrasa tudo", valor: 2 },
      { texto: "Tenho protocolo para emergências", valor: 3 },
    ]
  },
  {
    id: "m2",
    categoria: "maturidade",
    microcopy: "Agenda cheia não é sinônimo de lucro. Agenda estratégica, sim.",
    pergunta: "Sua agenda dos próximos 30 dias está:",
    opcoes: [
      { texto: "Vazia ou imprevisível", valor: 1 },
      { texto: "Parcialmente ocupada", valor: 2 },
      { texto: "Estrategicamente planejada com margem", valor: 3 },
    ]
  },
  {
    id: "m3",
    categoria: "maturidade",
    microcopy: "Comunicação que não vende é custo. Comunicação que posiciona é investimento.",
    pergunta: "Seu conteúdo no Instagram nos últimos 30 dias foi:",
    opcoes: [
      { texto: "Aleatório ou inexistente", valor: 1 },
      { texto: "Postei o que deu", valor: 2 },
      { texto: "Planejado com objetivo claro", valor: 3 },
    ]
  },
  {
    id: "m4",
    categoria: "maturidade",
    microcopy: "Sentimento não paga boleto. Dados sim.",
    pergunta: "Você sabe qual procedimento dá mais lucro (não faturamento)?",
    opcoes: [
      { texto: "Não sei a diferença", valor: 1 },
      { texto: "Tenho uma ideia", valor: 2 },
      { texto: "Sei com precisão e priorizo", valor: 3 },
    ]
  },
  {
    id: "m5",
    categoria: "maturidade",
    microcopy: "Crescer sem sistema é acelerar em direção ao caos.",
    pergunta: "Se você dobrasse o número de clientes amanhã:",
    opcoes: [
      { texto: "Entraria em colapso", valor: 1 },
      { texto: "Daria um jeito, mas seria difícil", valor: 2 },
      { texto: "Tenho estrutura para absorver", valor: 3 },
    ]
  },
  {
    id: "m6",
    categoria: "maturidade",
    microcopy: "Sua ausência revela a verdade sobre seu negócio.",
    pergunta: "Da última vez que você ficou doente ou ausente:",
    opcoes: [
      { texto: "Tudo parou", valor: 1 },
      { texto: "Funcionou precariamente", valor: 2 },
      { texto: "A operação continuou normalmente", valor: 3 },
    ]
  },
  {
    id: "m7",
    categoria: "maturidade",
    microcopy: "Quem não sabe onde quer chegar aceita qualquer destino.",
    pergunta: "Você tem uma meta clara de faturamento para os próximos 12 meses?",
    opcoes: [
      { texto: "Não tenho meta definida", valor: 1 },
      { texto: "Tenho um número na cabeça", valor: 2 },
      { texto: "Tenho meta, plano e acompanhamento", valor: 3 },
    ]
  },
];

// ============================================
// NÍVEL 3: DIAGNÓSTICO FINANCEIRO PROFUNDO (8 perguntas)
// ============================================
export const PERGUNTAS_FINANCEIRO: QuizQuestion[] = [
  {
    id: "f1",
    categoria: "financeiro",
    microcopy: "Faturamento impressiona. Lucro liberta.",
    pergunta: "Qual foi seu faturamento bruto no último mês?",
    opcoes: [
      { texto: "Não sei com certeza", valor: 1 },
      { texto: "Entre R$ 10-30 mil", valor: 2 },
      { texto: "Acima de R$ 30 mil com controle", valor: 3 },
    ]
  },
  {
    id: "f2",
    categoria: "financeiro",
    microcopy: "Margem é o oxigênio do negócio. Sem ela, você sufoca devagar.",
    pergunta: "Você sabe sua margem líquida real (lucro ÷ faturamento)?",
    opcoes: [
      { texto: "Não faço esse cálculo", valor: 1 },
      { texto: "Acho que fica entre 10-20%", valor: 2 },
      { texto: "Sei exatamente e monitoro mensalmente", valor: 3 },
    ]
  },
  {
    id: "f3",
    categoria: "financeiro",
    microcopy: "Dinheiro invisível é dinheiro perdido.",
    pergunta: "Você identifica onde seu dinheiro 'vaza' todo mês?",
    opcoes: [
      { texto: "Não sei onde vai o dinheiro", valor: 1 },
      { texto: "Tenho uma ideia geral", valor: 2 },
      { texto: "Mapeio cada categoria de gasto", valor: 3 },
    ]
  },
  {
    id: "f4",
    categoria: "financeiro",
    microcopy: "Preço baixo atrai cliente errado. Preço certo atrai cliente ideal.",
    pergunta: "Seu preço foi definido com base em:",
    opcoes: [
      { texto: "O que as outras cobram", valor: 1 },
      { texto: "Custo + uma margem", valor: 2 },
      { texto: "Valor percebido + posicionamento + margem", valor: 3 },
    ]
  },
  {
    id: "f5",
    categoria: "financeiro",
    microcopy: "Reserva não é luxo. É a diferença entre liberdade e desespero.",
    pergunta: "Você tem reserva financeira para a clínica?",
    opcoes: [
      { texto: "Não tenho reserva", valor: 1 },
      { texto: "Tenho, mas uso frequentemente", valor: 2 },
      { texto: "Tenho 3-6 meses de despesas guardados", valor: 3 },
    ]
  },
  {
    id: "f6",
    categoria: "financeiro",
    microcopy: "Quem não separa pessoal de empresarial, sabota os dois.",
    pergunta: "Suas finanças pessoais e da clínica são:",
    opcoes: [
      { texto: "Completamente misturadas", valor: 1 },
      { texto: "Parcialmente separadas", valor: 2 },
      { texto: "100% separadas com pró-labore fixo", valor: 3 },
    ]
  },
  {
    id: "f7",
    categoria: "financeiro",
    microcopy: "Investimento sem retorno é despesa disfarçada.",
    pergunta: "Você sabe o retorno de cada investimento em marketing?",
    opcoes: [
      { texto: "Não acompanho isso", valor: 1 },
      { texto: "Acompanho parcialmente", valor: 2 },
      { texto: "Sei o ROI de cada canal", valor: 3 },
    ]
  },
  {
    id: "f8",
    categoria: "financeiro",
    microcopy: "Inadimplência é dinheiro que você trabalhou e não recebeu.",
    pergunta: "Qual seu índice de inadimplência/cancelamento?",
    opcoes: [
      { texto: "Não controlo", valor: 1 },
      { texto: "Tenho uma ideia", valor: 2 },
      { texto: "Monitoro e tenho ações para reduzir", valor: 3 },
    ]
  },
];

// ============================================
// NÍVEL EXTRA: POSICIONAMENTO (3 perguntas)
// ============================================
export const PERGUNTAS_POSICIONAMENTO: QuizQuestion[] = [
  {
    id: "p1",
    categoria: "posicionamento",
    microcopy: "Confusão afasta. Clareza atrai.",
    pergunta: "Quando alguém visita seu perfil, ela entende em 5 segundos o que você faz?",
    opcoes: [
      { texto: "Não tenho certeza", valor: 1 },
      { texto: "Acho que sim", valor: 2 },
      { texto: "Com certeza absoluta", valor: 3 },
    ]
  },
  {
    id: "p2",
    categoria: "posicionamento",
    microcopy: "Bio que fala de você é ego. Bio que fala para ela é estratégia.",
    pergunta: "Sua bio fala sobre você ou para a cliente certa?",
    opcoes: [
      { texto: "Fala sobre mim e minha formação", valor: 1 },
      { texto: "Um pouco dos dois", valor: 2 },
      { texto: "Fala diretamente com quem quero atrair", valor: 3 },
    ]
  },
  {
    id: "p3",
    categoria: "posicionamento",
    microcopy: "Cliente que pergunta preço não viu valor. Cliente que agenda viu autoridade.",
    pergunta: "Suas clientes chegam pelo Instagram já querendo agendar?",
    opcoes: [
      { texto: "Não, só perguntam preço", valor: 1 },
      { texto: "Algumas sim, outras não", valor: 2 },
      { texto: "A maioria já vem decidida", valor: 3 },
    ]
  },
];

// ============================================
// TODAS AS PERGUNTAS COMBINADAS
// ============================================
export const TODAS_PERGUNTAS = [
  ...PERGUNTAS_CONSCIENCIA,
  ...PERGUNTAS_MATURIDADE,
  ...PERGUNTAS_FINANCEIRO,
  ...PERGUNTAS_POSICIONAMENTO,
];

// ============================================
// MENSAGENS DO ABISMO ELEGANTE
// ============================================
export const MENSAGENS_ESPELHO = {
  desbravadora: {
    titulo: "Você está no modo sobrevivência",
    espelho: "Sua clínica depende demais de você — e isso cobra um preço invisível. Cada dia sem estrutura é um dia que você troca tempo por dinheiro, energia por ansiedade, potencial por estagnação.",
    abismo: "O Abismo Invisível",
    descricaoAbismo: "Existe uma lacuna entre onde você está e onde poderia estar. Não é falta de talento. É falta de sistema. E sistemas não se constroem com esforço — se constroem com estratégia.",
    cta: "Revelar meu diagnóstico completo",
  },
  estrategista: {
    titulo: "Você já enxerga além do óbvio",
    espelho: "Você não é mais iniciante — mas ainda não tem a estrutura de quem chegou lá. Está no meio do caminho, e o perigo do meio é achar que já sabe o suficiente.",
    abismo: "O Teto de Vidro",
    descricaoAbismo: "Você vê o próximo nível, mas algo invisível te impede de alcançá-lo. Não é esforço que falta. É clareza sobre os vazamentos que drenam seu potencial.",
    cta: "Descobrir meus pontos cegos",
  },
  rainha: {
    titulo: "Você opera como CEO",
    espelho: "Seu negócio já funciona sem você em algumas áreas. Mas rainhas sabem: há sempre território a conquistar. O próximo nível exige refinamento, não revolução.",
    abismo: "A Zona de Conforto Dourada",
    descricaoAbismo: "O maior risco de quem chegou longe é parar de evoluir. Conforto é o inimigo silencioso do crescimento. Sua próxima versão exige provocação, não validação.",
    cta: "Elevar minha operação",
  },
};

// ============================================
// CLASSIFICAÇÃO DE NÍVEL
// ============================================
export function classificarNivel(pontuacao: number): "desbravadora" | "estrategista" | "rainha" {
  if (pontuacao <= 15) return "desbravadora";
  if (pontuacao <= 24) return "estrategista";
  return "rainha";
}

export function calcularPontuacao(respostas: Record<string, number>): number {
  return Object.values(respostas).reduce((acc, val) => acc + val, 0);
}
