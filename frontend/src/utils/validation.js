export const GENDER_OPTIONS = ['Male', 'Female', 'Other', 'Prefer not to specify'];

export const patientNameRules = {
  required: 'Patient name is required',
  validate: (v) => v.trim().length > 0 || 'Patient name is required',
  maxLength: { value: 100, message: 'Name must be 100 characters or fewer' },
};

export const ageRules = {
  required: 'Age is required',
  validate: (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 'Enter a valid number';
    if (n < 0) return 'Age cannot be negative';
    if (n > 120) return 'Age must be 120 or less';
    return true;
  },
};

export const genderRules = { required: 'Please select an option' };

/** Typed symptoms OR a voice transcription must carry at least a few characters. */
export const symptomRules = {
  maxLength: { value: 5000, message: 'Must be 5000 characters or fewer' },
  validate: (value, formValues) =>
    (value ?? '').trim().length >= 3 ||
    (formValues.voiceTranscription ?? '').trim().length >= 3 ||
    'Please describe the symptoms by typing or by recording your voice',
};

export const PDF_MAGIC = '%PDF-';

/** Reads the first bytes of a file to confirm it really is a PDF. */
export async function looksLikePdf(file) {
  const head = await file.slice(0, 1024).text();
  return head.includes(PDF_MAGIC);
}
