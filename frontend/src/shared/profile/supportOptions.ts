// Support options of the student profile (spec 003). Shared by the adaptation and the
// profiles features, so it lives in shared.
import type { MaterialType, StudentProfile } from '@/shared/types/contract';

export type SupportOptionKey = Exclude<keyof StudentProfile, 'notes'>;

export const SUPPORT_OPTIONS: { key: SupportOptionKey; label: string }[] = [
  { key: 'readsLittle', label: 'Lê pouco' },
  { key: 'needsStepByStep', label: 'Precisa de passo a passo' },
  { key: 'needsMoreImages', label: 'Precisa de mais imagens' },
  { key: 'sensitiveToVisualClutter', label: 'Sensível a excesso visual' },
  { key: 'easilyDistracted', label: 'Se distrai fácil (uma questão por vez)' },
  { key: 'takesThingsLiterally', label: 'Interpreta a linguagem de forma literal' },
  { key: 'needsPredictability', label: 'Precisa de previsibilidade' },
];

export const NOTES_MAX_LENGTH = 500;

export const NOTES_HINT =
  'Não escreva o nome do aluno. Pode escrever o diagnóstico e o que ajuda ele a aprender.';

export const EMPTY_PROFILE: StudentProfile = {
  readsLittle: false,
  needsStepByStep: false,
  needsMoreImages: false,
  sensitiveToVisualClutter: false,
  easilyDistracted: false,
  takesThingsLiterally: false,
  needsPredictability: false,
  notes: '',
};

export const MATERIAL_TYPES: { value: MaterialType; label: string }[] = [
  { value: 'test', label: 'Prova' },
  { value: 'activity', label: 'Atividade' },
  { value: 'content', label: 'Conteúdo (slide ou texto de aula)' },
];
