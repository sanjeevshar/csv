export type { Question, SubjectKey } from "./types";
export { PRIZE_LEVELS, SAFE_MILESTONES, formatPrize, SUBJECT_META } from "./types";
export { PHYSICS_QUESTIONS } from "./physics";
export { HINDI_QUESTIONS } from "./hindi";
export { MATH_QUESTIONS } from "./math";
export { SCIENCE_QUESTIONS } from "./science";
export { HISTORY_QUESTIONS } from "./history";
export { GEOGRAPHY_QUESTIONS } from "./geography";
export { GK_QUESTIONS } from "./gk";
export { COMPUTER_QUESTIONS } from "./computer";

import { PHYSICS_QUESTIONS } from "./physics";
import { HINDI_QUESTIONS } from "./hindi";
import { MATH_QUESTIONS } from "./math";
import { SCIENCE_QUESTIONS } from "./science";
import { HISTORY_QUESTIONS } from "./history";
import { GEOGRAPHY_QUESTIONS } from "./geography";
import { GK_QUESTIONS } from "./gk";
import { COMPUTER_QUESTIONS } from "./computer";
import type { Question, SubjectKey } from "./types";

export const ALL_QUESTIONS: Question[] = [
  ...PHYSICS_QUESTIONS,
  ...HINDI_QUESTIONS,
  ...MATH_QUESTIONS,
  ...SCIENCE_QUESTIONS,
  ...HISTORY_QUESTIONS,
  ...GEOGRAPHY_QUESTIONS,
  ...GK_QUESTIONS,
  ...COMPUTER_QUESTIONS,
];

export const QUESTIONS_BY_SUBJECT: Record<SubjectKey, Question[]> = {
  all:       ALL_QUESTIONS,
  physics:   PHYSICS_QUESTIONS,
  hindi:     HINDI_QUESTIONS,
  math:      MATH_QUESTIONS,
  science:   SCIENCE_QUESTIONS,
  history:   HISTORY_QUESTIONS,
  geography: GEOGRAPHY_QUESTIONS,
  gk:        GK_QUESTIONS,
  computer:  COMPUTER_QUESTIONS,
};
