import { useState } from 'react';
import { Check } from 'lucide-react';
import { loadSettings, saveSettings } from '../utils/settings.js';

export default function Settings() {
  const [settings, setSettings] = useState(loadSettings);
  const [saved, setSaved] = useState(false);

  const update = (patch) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    saveSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="max-w-xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Settings</h1>
        {saved && <span className="flex items-center gap-1 text-sm text-emerald-700" role="status"><Check className="h-4 w-4" /> Saved</span>}
      </div>

      <section className="card space-y-5">
        <div>
          <label htmlFor="pageSize" className="label">Assessments per page in history</label>
          <select id="pageSize" className="input sm:w-40" value={settings.pageSize} onChange={(e) => update({ pageSize: Number(e.target.value) })}>
            {[5, 10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4" checked={settings.confirmDelete} onChange={(e) => update({ confirmDelete: e.target.checked })} />
          Ask for confirmation before deleting an assessment
        </label>
        <p className="text-xs text-navy-500">These preferences are stored in this browser only. No patient information is stored in the browser.</p>
      </section>

      <section className="card text-sm text-navy-700">
        <h2 className="section-title">Privacy</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Uploaded PDFs are processed in memory and are not kept as files; only the extracted text is saved with the assessment.</li>
          <li>Assessments are visible only to the account that created them, and you can delete them at any time from the history page.</li>
          <li>Patient details are processed by an AI service to produce each assessment.</li>
        </ul>
      </section>
    </div>
  );
}
