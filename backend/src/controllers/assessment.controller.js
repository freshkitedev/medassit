import { asyncHandler, AppError } from '../middleware/error.middleware.js';
import { extractAllPdfs } from '../services/pdf.service.js';
import { generateAssessment, combineSymptoms } from '../services/medical-assessment.service.js';
import * as assessments from '../services/assessment.service.js';
import { CONSENT_VERSION } from '../constants/medical.constants.js';

export const createAssessment = asyncHandler(async (req, res) => {
  const input = req.body; // validated by Zod
  const files = req.files ?? [];

  // 1. Extract text from every PDF. Failures are reported per file, never dropped.
  const extracted = await extractAllPdfs(files);
  const failed = extracted.filter((r) => !r.ok);
  if (failed.length) {
    throw new AppError(
      422,
      'PDF_EXTRACTION_FAILED',
      'Some reports could not be read. Remove or replace them, then try again.',
      failed.map((f) => ({ filename: f.filename, message: f.reason }))
    );
  }

  // 2. AI assessment (validated + safety-checked inside the service).
  const aiAssessment = await generateAssessment(input, extracted);

  // 3. Persist. Ownership comes from the session, never from the request body.
  const dto = await assessments.createAssessment(req.user._id, {
    patientName: input.patientName,
    age: input.age,
    gender: input.gender,
    symptoms: input.symptoms,
    // Don't store the transcription twice when the typed text already contains it.
    voiceTranscription: combineSymptoms(input.symptoms, input.voiceTranscription) === input.symptoms ? '' : input.voiceTranscription,
    medicalConditions: input.medicalConditions,
    medicalHistory: input.medicalHistory,
    currentMedications: input.currentMedications,
    allergies: input.allergies,
    reports: extracted.map((r) => ({ filename: r.filename, size: r.size, pageCount: r.pageCount, truncated: r.truncated })),
    reportExtractedText: extracted.map((r) => ({ filename: r.filename, text: r.text })),
    aiAssessment,
    urgencyLevel: aiAssessment.emergencyLevel,
    consent: { given: true, at: new Date(), version: CONSENT_VERSION },
  });

  res.status(201).json({ success: true, assessment: dto });
});

export const listAssessments = asyncHandler(async (req, res) => {
  const result = await assessments.listAssessments(req.user._id, req.validatedQuery);
  res.json({ success: true, ...result });
});

export const getAssessment = asyncHandler(async (req, res) => {
  res.json({ success: true, assessment: await assessments.getAssessment(req.user._id, req.params.id) });
});

export const deleteAssessment = asyncHandler(async (req, res) => {
  await assessments.deleteAssessment(req.user._id, req.params.id);
  res.json({ success: true });
});
