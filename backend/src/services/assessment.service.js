import { Assessment } from '../models/assessment.model.js';
import { escapeRegex } from '../utils/validators.js';
import { AppError } from '../middleware/error.middleware.js';

/** Shape returned to clients. Extracted report text is intentionally omitted. */
export function toDto(doc) {
  const d = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    id: String(d._id),
    patientName: d.patientName,
    age: d.age,
    gender: d.gender,
    symptoms: d.symptoms,
    voiceTranscription: d.voiceTranscription,
    medicalConditions: d.medicalConditions,
    medicalHistory: d.medicalHistory,
    currentMedications: d.currentMedications,
    allergies: d.allergies,
    reports: d.reports,
    aiAssessment: d.aiAssessment,
    urgencyLevel: d.urgencyLevel,
    consent: d.consent,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function createAssessment(userId, data) {
  const doc = await Assessment.create({ ...data, userId });
  return toDto(doc);
}

export async function listAssessments(userId, { page, limit, q, sort }) {
  const filter = { userId };
  if (q) filter.patientName = { $regex: escapeRegex(q), $options: 'i' };

  const [items, total] = await Promise.all([
    Assessment.find(filter)
      .sort({ createdAt: sort === 'oldest' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('patientName age gender urgencyLevel createdAt aiAssessment.assessmentSummary')
      .lean(),
    Assessment.countDocuments(filter),
  ]);

  return {
    items: items.map((d) => ({
      id: String(d._id),
      patientName: d.patientName,
      age: d.age,
      gender: d.gender,
      urgencyLevel: d.urgencyLevel,
      summary: d.aiAssessment?.assessmentSummary ?? '',
      createdAt: d.createdAt,
    })),
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

export async function getAssessment(userId, id) {
  // Filtering by userId means another user's id simply looks like "not found".
  const doc = await Assessment.findOne({ _id: id, userId }).lean();
  if (!doc) throw new AppError(404, 'NOT_FOUND', 'Assessment not found.');
  return toDto(doc);
}

export async function deleteAssessment(userId, id) {
  // Reports are processed in memory and never stored as files, so deleting the
  // record also removes all extracted report text.
  const result = await Assessment.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) throw new AppError(404, 'NOT_FOUND', 'Assessment not found.');
}
