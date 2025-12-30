/**
 * Tipos TypeScript Compartilhados
 * BUG-010: Substituir any por tipos corretos
 */

// Tipos de Conteúdo
export type ContentType = 'ebook' | 'prompt' | 'ad' | 'post';

// Interface base para geração de conteúdo
export interface ContentGenerationItem {
  id: number;
  userId: number;
  type: ContentType;
  title: string;
  content: string | null;
  metadata: string | null;
  creditsUsed: number;
  createdAt: Date;
}

// Interface com conteúdo parseado
export interface ParsedContentItem extends Omit<ContentGenerationItem, 'content' | 'metadata'> {
  content: any; // Tipagem específica abaixo por tipo
  metadata: Record<string, any> | null;
}

// Estrutura de Ebook
export interface EbookContent {
  title: string;
  subtitle: string;
  description: string;
  coverPrompt: string;
  chapters: Array<{
    number: number;
    title: string;
    content: string;
  }>;
  conclusion: string;
  callToAction: string;
}

// Estrutura de Prompt
export interface PromptContent {
  prompt: string;
  context?: string;
  examples?: string[];
}

// Estrutura de Anúncio
export interface AdContent {
  headline: string;
  body: string;
  callToAction: string;
  targetAudience?: string;
}

// Estrutura de Post
export interface PostContent {
  title: string;
  body: string;
  hashtags?: string[];
  platform?: string;
}

// Bio Radar
export interface BioRadarDiagnosis {
  id: number;
  userId: number | null;
  instagramHandle: string;
  diagnosis: string | null;
  creditsUsed: number;
  createdAt: Date;
}

export interface ParsedBioRadarDiagnosis extends Omit<BioRadarDiagnosis, 'diagnosis'> {
  diagnosis: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    analysis: string;
  } | null;
}

// Subscription
export type SubscriptionPlan = 'free' | 'essencial' | 'profissional';
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'expired';

export interface Subscription {
  id: number;
  userId: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  creditsRemaining: number;
  monthlyCreditsLimit: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  renewalDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// User
export interface User {
  id: number;
  openId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
}

// Estatísticas
export interface ContentStats {
  type: ContentType;
  count: number;
}

export interface UserStats {
  totalContent: number;
  contentByType: ContentStats[];
  creditsUsed: number;
  creditsRemaining: number;
}
