import { test } from 'node:test';
import assert from 'node:assert/strict';

// env.js validates on import, so provide dummy values for unit tests.
Object.assign(process.env, {
  MONGODB_URI: 'mongodb://localhost/test',
  OPENAI_API_KEY: 'test',
  OPENAI_MODEL: 'test',
  OPENAI_TRANSCRIPTION_MODEL: 'test',
  GOOGLE_CLIENT_ID: 'test',
  SESSION_SECRET: 'x'.repeat(32),
});

const { assessmentInputSchema, detectAudioType, isPdfBuffer, sanitizeText } = await import('../src/utils/validators.js');
const { parseAssessment } = await import('../src/utils/response-parser.js');
const { combineSymptoms, detectUrgentIndicators } = await import('../src/services/medical-assessment.service.js');

const valid = { patientName: ' Asha ', age: '34', gender: 'Female', symptoms: 'Headache for two days', consent: 'true' };

test('assessment input: accepts valid data and coerces', () => {
  const r = assessmentInputSchema.parse(valid);
  assert.equal(r.patientName, 'Asha');
  assert.equal(r.age, 34);
  assert.equal(r.voiceTranscription, '');
});

test('assessment input: rejects bad age, gender, missing consent and symptoms', () => {
  assert.throws(() => assessmentInputSchema.parse({ ...valid, age: '-1' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, age: 'abc' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, age: '' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, gender: 'Robot' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, consent: 'false' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, symptoms: '' }));
  assert.throws(() => assessmentInputSchema.parse({ ...valid, patientName: '   ' }));
});

test('voice transcription alone satisfies the symptoms requirement', () => {
  assert.doesNotThrow(() => assessmentInputSchema.parse({ ...valid, symptoms: '', voiceTranscription: 'sore throat' }));
});

test('sanitizeText strips control characters', () => {
  assert.equal(sanitizeText('a\u0000b\u0007c\r\nd'), 'abc\nd');
});

test('magic byte detection', () => {
  assert.ok(isPdfBuffer(Buffer.from('%PDF-1.7\n....')));
  assert.ok(!isPdfBuffer(Buffer.from('MZ not a pdf at all')));
  assert.equal(detectAudioType(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0, 0, 0, 0, 0, 0, 0, 0]))?.ext, 'webm');
  assert.equal(detectAudioType(Buffer.from('RIFF0000WAVEfmt ')).ext, 'wav');
  assert.equal(detectAudioType(Buffer.from('plain text file...')), null);
});

const goodAi = {
  assessmentSummary: 'Summary',
  emergencyLevel: 'ROUTINE',
  emergencyMessage: '',
  possibleConditions: [{ name: 'Tension headache', likelihoodDescription: 'Possible', explanation: 'x', supportingSymptoms: [], limitations: [] }],
  reportFindings: [],
  recommendations: [{ category: 'SELF_CARE', recommendation: 'Rest', reason: 'x' }],
  medicationInformation: [{ name: 'Paracetamol', purpose: 'Pain', precautions: [], contraindications: [] }],
  specialistRecommendation: { recommended: false, specialty: '', reason: '', urgency: '' },
  followUpQuestions: [],
  limitations: [],
  disclaimer: 'model-written disclaimer',
};

test('parseAssessment: valid JSON, fenced JSON, fixed disclaimer, safe defaults', () => {
  const a = parseAssessment(JSON.stringify(goodAi));
  assert.match(a.disclaimer, /not a confirmed diagnosis/);
  assert.equal(a.medicationInformation[0].requiresProfessionalConfirmation, true);
  const fenced = parseAssessment('Here you go:\n```json\n' + JSON.stringify(goodAi) + '\n```');
  assert.equal(fenced.emergencyLevel, 'ROUTINE');
});

test('parseAssessment: rejects malformed / invalid output', () => {
  assert.throws(() => parseAssessment('not json'), { code: 'AI_INVALID_RESPONSE' });
  assert.throws(() => parseAssessment(JSON.stringify({ ...goodAi, emergencyLevel: 'MAYBE' })), { code: 'AI_INVALID_RESPONSE' });
  assert.throws(() => parseAssessment(''), { code: 'AI_INVALID_RESPONSE' });
});

test('combineSymptoms avoids duplicates', () => {
  assert.equal(combineSymptoms('Fever and cough', 'fever and cough'), 'Fever and cough');
  assert.equal(combineSymptoms('', 'cough'), 'cough');
  assert.match(combineSymptoms('Fever', 'Also a rash'), /Fever[\s\S]*Also a rash/);
});

test('urgent keyword screen', () => {
  assert.deepEqual(detectUrgentIndicators('mild cold'), []);
  assert.ok(detectUrgentIndicators('crushing chest pain since morning').length > 0);
});
