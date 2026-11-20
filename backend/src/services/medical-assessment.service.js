import { generateStructuredJson } from './openai.service.js';
import { SYSTEM_PROMPT, ASSESSMENT_JSON_SCHEMA, buildUserMessage } from '../prompts/medical-assessment.prompt.js';
import { parseAssessment } from '../utils/response-parser.js';
import { EMERGENCY_PATTERNS, EMERGENCY_NOTE, LIMITS } from '../constants/medical.constants.js';

const RANK = { SELF_CARE: 0, ROUTINE: 1, URGENT: 2, EMERGENCY: 3 };

/** Merge typed symptoms and the voice transcription without repeating the same text. */
export function combineSymptoms(symptoms, voiceTranscription) {
  const typed = symptoms.trim();
  const voice = voiceTranscription.trim();
  if (!voice) return typed;
  if (!typed) return voice;
  const norm = (t) => t.toLowerCase().replace(/\s+/g, ' ');
  if (norm(typed).includes(norm(voice))) return typed;
  if (norm(voice).includes(norm(typed))) return voice;
  return `${typed}\n\n[Additional details from voice description]\n${voice}`;
}

export function detectUrgentIndicators(...texts) {
  const haystack = texts.filter(Boolean).join('\n');
  return EMERGENCY_PATTERNS.filter(({ re }) => re.test(haystack)).map(({ label }) => label);
}

/** Cap total report text sent to the model. */
function budgetReports(reports) {
  let remaining = LIMITS.reportTextTotal;
  return reports.map((r) => {
    const text = r.text.slice(0, Math.max(remaining, 0));
    remaining -= text.length;
    return { reportName: r.filename, pageCount: r.pageCount, textTruncated: r.truncated || text.length < r.text.length, extractedText: text };
  });
}

export async function generateAssessment(input, reports) {
  const symptoms = combineSymptoms(input.symptoms, input.voiceTranscription);
  const flags = detectUrgentIndicators(symptoms, input.medicalConditions, input.medicalHistory);

  const payload = {
    patient: {
      age: input.age,
      ageUnit: 'years',
      gender: input.gender,
      // The name is not needed for the clinical reasoning and is deliberately not sent.
    },
    symptoms,
    medicalConditions: input.medicalConditions || 'Not provided',
    medicalHistory: input.medicalHistory || 'Not provided',
    currentMedications: input.currentMedications || 'Not provided',
    allergies: input.allergies || 'Not provided',
    preScreenFlags: flags,
    reports: budgetReports(reports),
  };

  const raw = await generateStructuredJson({
    system: SYSTEM_PROMPT,
    user: buildUserMessage(payload),
    schemaName: 'medical_assessment',
    jsonSchema: ASSESSMENT_JSON_SCHEMA,
  });

  const assessment = parseAssessment(raw);

  // Safety net: a keyword hit can never leave the case below URGENT.
  if (flags.length && RANK[assessment.emergencyLevel] < RANK.URGENT) {
    assessment.emergencyLevel = 'URGENT';
    assessment.emergencyMessage = EMERGENCY_NOTE;
    assessment.limitations.push(
      'The urgency level was raised automatically because the description mentioned potentially serious symptoms.'
    );
  }
  if (assessment.emergencyLevel === 'EMERGENCY' && !assessment.emergencyMessage) {
    assessment.emergencyMessage = EMERGENCY_NOTE;
  }
  if (reports.some((r) => r.truncated)) {
    assessment.limitations.push('Some report text was too long and was shortened before analysis.');
  }
  return assessment;
}
