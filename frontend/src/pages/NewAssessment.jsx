import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, ArrowRight, Check, Send } from 'lucide-react';
import PatientForm from '../components/PatientForm.jsx';
import SymptomInput from '../components/SymptomInput.jsx';
import PDFUploader from '../components/PDFUploader.jsx';
import AssessmentReview from '../components/AssessmentReview.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import LoadingScreen from '../components/LoadingScreen.jsx';
import { createAssessment, getUploadLimits } from '../services/assessmentService.js';
import { toApiError } from '../services/api.js';

const STEPS = ['Patient', 'Symptoms', 'Reports', 'Review'];
const STEP_FIELDS = [['patientName', 'age', 'gender', 'medicalConditions', 'currentMedications', 'allergies', 'medicalHistory'], ['symptoms', 'voiceTranscription'], [], ['consent']];

const PROCESSING_MESSAGES = [
  'Reviewing patient information...',
  'Extracting medical report information...',
  'Processing symptoms...',
  'Organizing findings...',
  'Preparing preliminary assessment...',
];

const DEFAULTS = {
  patientName: '', age: '', gender: '', symptoms: '', voiceTranscription: '',
  medicalConditions: '', currentMedications: '', allergies: '', medicalHistory: '', consent: false,
};

export default function NewAssessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState([]);
  const [limits, setLimits] = useState({ maxFileSize: 10 * 1024 * 1024, maxFiles: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const { register, handleSubmit, trigger, watch, setValue, getValues, formState: { errors } } = useForm({
    mode: 'onTouched',
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    getUploadLimits().then(setLimits);
  }, []);

  const goTo = (n) => {
    setSubmitError(null);
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) goTo(step + 1);
  };

  const onSubmit = async (values) => {
    setSubmitError(null);
    setSubmitting(true);
    setProgress(0);
    try {
      const assessment = await createAssessment(values, files, setProgress);
      navigate(`/assessments/${assessment.id}/result`, { replace: true });
    } catch (err) {
      setSubmitError(toApiError(err));
      setSubmitting(false);
      setProgress(null);
    }
  };

  const fileErrors = submitError?.code === 'PDF_EXTRACTION_FAILED' ? submitError.details : [];
  const generalDetails = fileErrors.length ? [] : submitError?.details ?? [];

  return (
    <div className="space-y-6">
      {submitting && <LoadingScreen messages={PROCESSING_MESSAGES} uploadProgress={files.length ? progress : null} />}

      <div>
        <h1 className="text-2xl font-bold">New patient assessment</h1>
        <p className="text-sm text-navy-500">Step {step + 1} of {STEPS.length}</p>
      </div>

      <ol className="flex gap-2" aria-label="Progress">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1" aria-current={i === step ? 'step' : undefined}>
            <div className={`h-1.5 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />
            <p className={`mt-1.5 flex items-center gap-1 text-xs font-medium ${i === step ? 'text-brand-700' : 'text-navy-500'}`}>
              {i < step && <Check className="h-3 w-3" aria-hidden="true" />}{label}
            </p>
          </li>
        ))}
      </ol>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {step === 0 && <PatientForm register={register} errors={errors} />}
        {step === 1 && <SymptomInput register={register} errors={errors} watch={watch} setValue={setValue} trigger={trigger} />}
        {step === 2 && <PDFUploader files={files} onChange={(f) => { setFiles(f); setSubmitError(null); }} limits={limits} fileErrors={fileErrors} />}
        {step === 3 && (
          <>
            <AssessmentReview values={getValues()} files={files} onEdit={goTo} register={register} errors={errors} />
            {fileErrors.length > 0 && (
              <ErrorMessage message="Some reports could not be read. Go back to the Reports step to remove or replace them." details={fileErrors} />
            )}
            {submitError && !fileErrors.length && <ErrorMessage message={submitError.message} details={generalDetails} />}
          </>
        )}

        <div className="flex items-center justify-between gap-3">
          <button type="button" className="btn-secondary" onClick={() => (step === 0 ? navigate('/') : goTo(step - 1))}>
            <ArrowLeft className="h-4 w-4" /> {step === 0 ? 'Cancel' : 'Back'}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" className="btn-primary" onClick={next}>Next <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Send className="h-4 w-4" /> Submit for AI Assessment
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
