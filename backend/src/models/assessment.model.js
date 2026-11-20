import mongoose from 'mongoose';
import { GENDERS, URGENCY_LEVELS } from '../constants/medical.constants.js';

const reportMetaSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, maxlength: 255 },
    size: { type: Number, required: true, min: 0 },
    pageCount: { type: Number, default: 0 },
    truncated: { type: Boolean, default: false },
  },
  { _id: false }
);

const extractedTextSchema = new mongoose.Schema(
  {
    filename: { type: String, required: true, maxlength: 255 },
    text: { type: String, default: '' },
  },
  { _id: false }
);

const assessmentSchema = new mongoose.Schema(
  {
    // Ownership always comes from the authenticated session, never from the client.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    patientName: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 120 },
    gender: { type: String, required: true, enum: GENDERS },
    symptoms: { type: String, default: '', maxlength: 5000 },
    voiceTranscription: { type: String, default: '', maxlength: 5000 },
    medicalConditions: { type: String, default: '', maxlength: 2000 },
    medicalHistory: { type: String, default: '', maxlength: 2000 },
    currentMedications: { type: String, default: '', maxlength: 2000 },
    allergies: { type: String, default: '', maxlength: 2000 },
    reports: { type: [reportMetaSchema], default: [] },
    // Kept so the assessment can be audited; never returned by the API.
    reportExtractedText: { type: [extractedTextSchema], default: [], select: false },
    aiAssessment: { type: mongoose.Schema.Types.Mixed, required: true },
    urgencyLevel: { type: String, required: true, enum: URGENCY_LEVELS },
    consent: {
      given: { type: Boolean, required: true },
      at: { type: Date, required: true },
      version: { type: String, required: true },
    },
  },
  { timestamps: true }
);

assessmentSchema.index({ userId: 1, createdAt: -1 });
assessmentSchema.index({ userId: 1, patientName: 1 });

export const Assessment = mongoose.model('Assessment', assessmentSchema);
