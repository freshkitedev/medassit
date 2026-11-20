import { GENDER_OPTIONS, ageRules, genderRules, patientNameRules } from '../utils/validation.js';

export function Field({ label, error, hint, required, children, htmlFor }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label} {required && <span className="text-red-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="field-error" role="alert">{error.message}</p>}
    </div>
  );
}

export default function PatientForm({ register, errors }) {
  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="section-title">Patient details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Patient name" htmlFor="patientName" error={errors.patientName} required>
              <input id="patientName" autoComplete="off" className={`input ${errors.patientName ? 'input-error' : ''}`} {...register('patientName', patientNameRules)} />
            </Field>
          </div>
          <Field label="Age (years)" htmlFor="age" error={errors.age} required>
            <input id="age" type="number" inputMode="decimal" min="0" max="120" step="any" className={`input ${errors.age ? 'input-error' : ''}`} {...register('age', ageRules)} />
          </Field>
          <Field label="Gender" htmlFor="gender" error={errors.gender} required hint="Used only where medically relevant.">
            <select id="gender" className={`input ${errors.gender ? 'input-error' : ''}`} {...register('gender', genderRules)}>
              <option value="">Select…</option>
              {GENDER_OPTIONS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">Medical background <span className="text-sm font-normal text-navy-500">(optional)</span></h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TextArea id="medicalConditions" label="Existing medical conditions" register={register} errors={errors} placeholder="e.g. diabetes, hypertension, asthma" />
          <TextArea id="currentMedications" label="Current medications" register={register} errors={errors} placeholder="Name and how often, if known" />
          <TextArea id="allergies" label="Known allergies" register={register} errors={errors} placeholder="Medicines, foods, other" />
          <TextArea id="medicalHistory" label="Relevant medical history" register={register} errors={errors} placeholder="Past surgeries, family history, pregnancy, etc." />
        </div>
      </section>
    </div>
  );
}

function TextArea({ id, label, register, errors, placeholder }) {
  return (
    <Field label={label} htmlFor={id} error={errors[id]}>
      <textarea id={id} rows={3} placeholder={placeholder} className="input" {...register(id, { maxLength: { value: 2000, message: 'Must be 2000 characters or fewer' } })} />
    </Field>
  );
}
