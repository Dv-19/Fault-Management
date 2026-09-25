/**
 * SecretQuestion enum values with human-readable labels.
 * Matches backend com.infy.enums.SecretQuestion exactly.
 * No endpoint lists these — hard-coded per integration doc §8.8.
 */
import { SecretQuestion } from '../types/domain';

export interface SecurityQuestionOption {
  value: SecretQuestion;
  label: string;
}

export const SECURITY_QUESTIONS: SecurityQuestionOption[] = [
  { value: 'FIRST_PET', label: "What was your first pet's name?" },
  { value: 'BIRTH_CITY', label: 'What city were you born in?' },
  { value: 'FAVOURITE_TEACHER', label: 'What is the name of your favourite teacher?' },
  { value: 'MOTHERS_MAIDEN_NAME', label: "What is your mother's maiden name?" },
  { value: 'FAVOURITE_BOOK', label: 'What is your favourite book?' },
];

export function questionLabel(value: SecretQuestion): string {
  return SECURITY_QUESTIONS.find((q) => q.value === value)?.label ?? value;
}
