export type SubjectKey = "all" | "physics" | "hindi" | "math" | "science" | "history" | "geography" | "gk" | "computer";

export interface Question {
  index: number;
  subject: SubjectKey;
  question: string;
  answer: "a" | "b" | "c" | "d";
  a: string;
  b: string;
  c: string;
  d: string;
}

export const PRIZE_LEVELS = [
  1000, 2000, 3000, 5000, 10000,
  20000, 40000, 80000, 160000, 320000,
  640000, 1250000, 2500000, 5000000, 10000000,
  20000000, 50000000, 70000000,
];

export const SAFE_MILESTONES = [4, 9, 14];

export function formatPrize(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(0)} करोड़`;
  if (amount >= 100000)   return `₹${(amount / 100000).toFixed(amount % 100000 === 0 ? 0 : 2)} लाख`;
  if (amount >= 1000)     return `₹${amount.toLocaleString("en-IN")}`;
  return `₹${amount}`;
}

export const SUBJECT_META: Record<SubjectKey, { label: string; icon: string; color: string; bg: string }> = {
  all:       { label: "सभी विषय",   icon: "🌟", color: "#ffd700", bg: "rgba(255,215,0,.15)" },
  physics:   { label: "भौतिक विज्ञान", icon: "⚛️",  color: "#60a5fa", bg: "rgba(96,165,250,.15)" },
  hindi:     { label: "हिंदी",       icon: "📖", color: "#f472b6", bg: "rgba(244,114,182,.15)" },
  math:      { label: "गणित",        icon: "📐", color: "#34d399", bg: "rgba(52,211,153,.15)" },
  science:   { label: "विज्ञान",     icon: "🔬", color: "#a78bfa", bg: "rgba(167,139,250,.15)" },
  history:   { label: "इतिहास",      icon: "🏛️",  color: "#fb923c", bg: "rgba(251,146,60,.15)" },
  geography: { label: "भूगोल",       icon: "🗺️",  color: "#22d3ee", bg: "rgba(34,211,238,.15)" },
  gk:        { label: "सामान्य ज्ञान",icon: "💡", color: "#fbbf24", bg: "rgba(251,191,36,.15)" },
  computer:  { label: "कंप्यूटर",    icon: "💻", color: "#86efac", bg: "rgba(134,239,172,.15)" },
};
