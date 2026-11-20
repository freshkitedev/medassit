import { z } from 'zod';
import { URGENCY_LEVELS, RECOMMENDATION_CATEGORIES, DISCLAIMER } from '../constants/medical.constants.js';
import { AppError } from '../middleware/error.middleware.js';

const s = z.string().trim();
const strList = z.array(s).default([]);

export const aiAssessmentSchema = z.object({
  assessmentSummary: s.min(1),
  emergencyLevel: z.enum(URGENCY_LEVELS),
  emergencyMessage: s.default(''),
  possibleConditions: z
    .array(
      z.object({
        name: s.min(1),
        likelihoodDescription: s.default('Possible'),
        explanation: s.default(''),
        supportingSymptoms: strList,
        limitations: strList,
      })
    )
    .default([]),
  reportFindings: z
    .array(
      z.object({
        reportName: s.default(''),
        testName: s.default(''),
        observedValue: s.default(''),
        referenceRange: s.default('Not stated in report'),
        finding: s.default(''),
        interpretation: s.default(''),
        significance: s.default(''),
        requiresFollowUp: z.boolean().default(false),
      })
    )
    .default([]),
  recommendations: z
    .array(
      z.object({
        category: z.enum(RECOMMENDATION_CATEGORIES),
        recommendation: s.min(1),
        reason: s.default(''),
      })
    )
    .default([]),
  medicationInformation: z
    .array(
      z.object({
        name: s.min(1),
        purpose: s.default(''),
        precautions: strList,
        contraindications: strList,
        // Fail safe: anything the model did not explicitly mark is treated as needing confirmation.
        requiresProfessionalConfirmation: z.boolean().default(true),
      })
    )
    .default([]),
  specialistRecommendation: z
    .object({
      recommended: z.boolean().default(false),
      specialty: s.default(''),
      reason: s.default(''),
      urgency: s.default(''),
    })
    .default({ recommended: false, specialty: '', reason: '', urgency: '' }),
  followUpQuestions: strList,
  limitations: strList,
  disclaimer: s.optional(),
});

/** Pull the first balanced-looking JSON object out of text (handles ``` fences / chatter). */
function extractJsonObject(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  return start !== -1 && end > start ? text.slice(start, end + 1) : null;
}

/**
 * Parse and validate the model output. Never returns malformed data: either a
 * fully validated object or an AppError (502).
 */
export function parseAssessment(rawText) {
  const invalid = () => new AppError(502, 'AI_INVALID_RESPONSE', 'The AI returned an unreadable response. Please try again.');
  if (!rawText || typeof rawText !== 'string') throw invalid();

  let json;
  for (const candidate of [rawText, extractJsonObject(rawText)]) {
    if (!candidate) continue;
    try {
      json = JSON.parse(candidate);
      break;
    } catch {
      /* try next candidate */
    }
  }
  if (!json) throw invalid();

  const result = aiAssessmentSchema.safeParse(json);
  if (!result.success) throw invalid();

  // The disclaimer is fixed by us, not by the model.
  return { ...result.data, disclaimer: DISCLAIMER };
}
