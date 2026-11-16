import type { StudentProfile } from '@/shared/types/contract';

export const NICKNAME_MAX_LENGTH = 30;

/** A profile kept in this browser (spec 003). The nickname never goes to the server
 * (R-003-02): only the StudentProfile fields are sent. */
export interface SavedProfile extends StudentProfile {
  id: string;
  nickname: string;
}
