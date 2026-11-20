export const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to specify'];

export const URGENCY_LEVELS = ['EMERGENCY', 'URGENT', 'ROUTINE', 'SELF_CARE'];

export const RECOMMENDATION_CATEGORIES = ['SELF_CARE', 'MEDICAL_CONSULTATION', 'TESTING', 'LIFESTYLE'];

export const CONSENT_VERSION = '2026-01';

export const DISCLAIMER =
  'This is a preliminary AI-generated assessment and not a confirmed diagnosis.';

export const EMERGENCY_NOTE =
  'Potentially serious symptoms were reported. If this is an emergency, call your local emergency number now (112 in India) or go to the nearest emergency department. Do not wait for further online guidance.';

// Free-text limits (characters).
export const LIMITS = Object.freeze({
  name: 100,
  longText: 5000,
  shortText: 2000,
  reportTextPerFile: 30_000,
  reportTextTotal: 90_000,
  minPdfChars: 100, // below this a PDF is treated as scanned / unreadable
});

/**
 * Simple keyword screen run BEFORE the AI call. It cannot understand negation
 * ("no chest pain"), so it is only used to (a) alert the model and (b) enforce a
 * minimum urgency of URGENT. The model decides whether the case is EMERGENCY.
 */
export const EMERGENCY_PATTERNS = [
  { label: 'chest pain / pressure', re: /chest\s+(pain|pressure|tightness)/i },
  { label: 'severe breathing difficulty', re: /(can'?t|cannot|unable to)\s+breathe|difficulty\s+breathing|shortness\s+of\s+breath|breathless/i },
  { label: 'stroke-like symptoms', re: /face\s+droop|slurred\s+speech|one[-\s]sided\s+weakness|sudden\s+(weakness|numbness)/i },
  { label: 'sudden confusion', re: /sudden(ly)?\s+confus/i },
  { label: 'loss of consciousness', re: /unconscious|passed\s+out|fainted|loss\s+of\s+consciousness|unresponsive/i },
  { label: 'severe bleeding', re: /severe\s+bleeding|bleeding\s+(heavily|profusely)|won'?t\s+stop\s+bleeding|vomiting\s+blood|coughing\s+(up\s+)?blood/i },
  { label: 'severe allergic reaction', re: /anaphyla|throat\s+swelling|swollen\s+(tongue|throat|lips)/i },
  { label: 'seizure', re: /seizure|convulsion/i },
  { label: 'suicidal intent', re: /suicid|kill\s+(myself|himself|herself)|end\s+(my|his|her)\s+life|self[-\s]harm/i },
  { label: 'severe abdominal pain', re: /severe\s+(abdominal|stomach)\s+pain/i },
];
