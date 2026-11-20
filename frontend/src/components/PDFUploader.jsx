import { useRef, useState } from 'react';
import { FileText, RefreshCw, UploadCloud, X } from 'lucide-react';
import { formatFileSize } from '../utils/formatting.js';
import { looksLikePdf } from '../utils/validation.js';
import ErrorMessage from './ErrorMessage.jsx';

/** Controlled multi-PDF picker. Files are only sent when the assessment is submitted. */
export default function PDFUploader({ files, onChange, limits, fileErrors = [], uploadProgress = null }) {
  const addRef = useRef(null);
  const replaceRef = useRef(null);
  const [replaceIndex, setReplaceIndex] = useState(null);
  const [errors, setErrors] = useState([]);
  const [dragging, setDragging] = useState(false);

  const validate = async (candidates, existing) => {
    const accepted = [];
    const problems = [];
    for (const file of candidates) {
      const isPdfName = file.name.toLowerCase().endsWith('.pdf');
      if (!isPdfName || (file.type && file.type !== 'application/pdf')) {
        problems.push({ filename: file.name, message: 'Only PDF files are allowed.' });
      } else if (file.size === 0) {
        problems.push({ filename: file.name, message: 'The file is empty.' });
      } else if (file.size > limits.maxFileSize) {
        problems.push({ filename: file.name, message: `Exceeds the ${formatFileSize(limits.maxFileSize)} limit (${formatFileSize(file.size)}).` });
      } else if ([...existing, ...accepted].some((f) => f.name === file.name && f.size === file.size)) {
        problems.push({ filename: file.name, message: 'This file was already added.' });
      } else if (!(await looksLikePdf(file))) {
        problems.push({ filename: file.name, message: 'The file content is not a valid PDF.' });
      } else {
        accepted.push(file);
      }
    }
    return { accepted, problems };
  };

  const addFiles = async (list) => {
    const incoming = Array.from(list);
    const room = limits.maxFiles - files.length;
    const { accepted, problems } = await validate(incoming, files);
    const allowed = accepted.slice(0, Math.max(room, 0));
    if (accepted.length > allowed.length) {
      problems.push({ message: `You can upload at most ${limits.maxFiles} reports. Extra files were not added.` });
    }
    setErrors(problems);
    if (allowed.length) onChange([...files, ...allowed]);
  };

  const replaceFile = async (list) => {
    const file = list[0];
    if (!file || replaceIndex === null) return;
    const others = files.filter((_, i) => i !== replaceIndex);
    const { accepted, problems } = await validate([file], others);
    setErrors(problems);
    if (accepted.length) onChange(files.map((f, i) => (i === replaceIndex ? accepted[0] : f)));
    setReplaceIndex(null);
  };

  const remove = (index) => {
    setErrors([]);
    onChange(files.filter((_, i) => i !== index));
  };

  const openPicker = (ref) => ref.current?.click();
  const resetInput = (e) => {
    e.target.value = '';
  };

  return (
    <section className="card space-y-4">
      <div>
        <h2 className="section-title">Medical reports <span className="text-sm font-normal text-navy-500">(optional)</span></h2>
        <p className="text-sm text-navy-700">
          Upload up to {limits.maxFiles} PDF reports (max {formatFileSize(limits.maxFileSize)} each). Text-based PDFs work best – scanned images are not supported yet.
        </p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300'}`}
      >
        <UploadCloud className="h-8 w-8 text-brand-600" aria-hidden="true" />
        <p className="text-sm">Drag and drop PDFs here, or</p>
        <button type="button" className="btn-secondary" onClick={() => openPicker(addRef)} disabled={files.length >= limits.maxFiles}>
          Choose PDF files
        </button>
        <input ref={addRef} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => { addFiles(e.target.files); resetInput(e); }} />
        <input ref={replaceRef} type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { replaceFile(e.target.files); resetInput(e); }} />
      </div>

      <ErrorMessage message={errors.length ? 'Some files could not be added.' : ''} details={errors} />
      <ErrorMessage message={fileErrors.length ? 'Some reports could not be read by the server.' : ''} details={fileErrors} />

      {files.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200">
          {files.map((f, i) => {
            const failed = fileErrors.some((e) => e.filename === f.name);
            return (
              <li key={`${f.name}-${i}`} className={`flex items-center gap-3 p-3 ${failed ? 'bg-red-50' : ''}`}>
                <FileText className="h-5 w-5 shrink-0 text-brand-600" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{f.name}</p>
                  <p className="text-xs text-navy-500">{formatFileSize(f.size)}</p>
                </div>
                <button type="button" className="btn-ghost !p-2" aria-label={`Replace ${f.name}`} onClick={() => { setReplaceIndex(i); openPicker(replaceRef); }}>
                  <RefreshCw className="h-4 w-4" />
                </button>
                <button type="button" className="btn-ghost !p-2 text-red-700" aria-label={`Remove ${f.name}`} onClick={() => remove(i)}>
                  <X className="h-4 w-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {uploadProgress !== null && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
          <p className="mt-1 text-xs text-navy-500">Uploading… {uploadProgress}%</p>
        </div>
      )}
    </section>
  );
}
