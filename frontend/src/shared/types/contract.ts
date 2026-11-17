// Contract between the screen and the server (docs/arquitetura.md, section 10).
// Mirror of backend/app/models/. Change both sides together, with docs/contrato-exemplo.json.

export type MaterialType = 'test' | 'activity' | 'content';

export type StepKind = 'instruction' | 'text' | 'question';

export type WarningCode = 'MISSING_QUESTION' | 'UNREADABLE' | 'NEEDS_FIGURE';

export type ErrorCode =
  | 'AI_QUOTA'
  | 'AI_TIMEOUT'
  | 'AI_UNAVAILABLE'
  | 'AI_INVALID'
  | 'AI_BLOCKED'
  | 'AI_NOT_RECORDED'
  | 'FILE_TOO_LARGE'
  | 'FILE_TYPE'
  | 'TOO_MANY_SLIDES'
  | 'INVALID_INPUT'
  | 'PICTOGRAMS_UNAVAILABLE';

/** Sent to the server. The nickname stays in the browser (spec 003). */
export interface StudentProfile {
  readsLittle: boolean;
  needsStepByStep: boolean;
  needsMoreImages: boolean;
  sensitiveToVisualClutter: boolean;
  easilyDistracted: boolean;
  takesThingsLiterally: boolean;
  needsPredictability: boolean;
  notes: string;
}

export interface Keyword {
  word: string;
  searchTerm: string;
  pictogramId: number | null;
}

/** [ymin, xmin, ymax, xmax], from 0 to 1000, relative to the original photo. */
export type FigureBox = [number, number, number, number];

export interface Step {
  id: string;
  kind: StepKind;
  sourceNumber: string | null;
  text: string;
  options: string[];
  keywords: Keyword[];
  needsFigure: boolean;
  figureBox: FigureBox | null;
}

export interface AdaptationWarning {
  code: WarningCode;
  message: string;
}

export interface Adaptation {
  schemaVersion: 1;
  materialType: MaterialType;
  title: string;
  objective: string;
  transcription: string;
  teacherNotes: string[];
  warnings: AdaptationWarning[];
  steps: Step[];
}

export interface Slide {
  index: number;
  title: string;
  text: string;
}

export interface SlideList {
  slides: Slide[];
}

export interface ReviseRequest {
  adaptation: Adaptation;
  profile: StudentProfile;
  materialType: MaterialType;
  instruction: string;
}

export interface PictogramSearch {
  results: { id: number }[];
}

export interface ErrorResponse {
  code: ErrorCode;
  message: string;
}
