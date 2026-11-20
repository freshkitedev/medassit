import api from './api.js';

const DEFAULT_LIMITS = { maxFileSize: 10 * 1024 * 1024, maxFiles: 5 };

export async function getUploadLimits() {
  try {
    const { data } = await api.get('/health');
    return data.limits ?? DEFAULT_LIMITS;
  } catch {
    return DEFAULT_LIMITS;
  }
}

/** values: plain object of text fields; files: File[]; onProgress(percent) reports real upload bytes. */
export async function createAssessment(values, files, onProgress) {
  const form = new FormData();
  Object.entries(values).forEach(([k, v]) => form.append(k, v ?? ''));
  files.forEach((f) => form.append('reports', f, f.name));
  const { data } = await api.post('/assessment', form, {
    timeout: 240_000,
    onUploadProgress: (e) => e.total && onProgress?.(Math.round((e.loaded / e.total) * 100)),
  });
  return data.assessment;
}

export async function listAssessments({ page = 1, limit = 10, q = '', sort = 'newest' } = {}) {
  const { data } = await api.get('/assessments', { params: { page, limit, q: q || undefined, sort } });
  return data;
}

export async function getAssessment(id) {
  const { data } = await api.get(`/assessments/${id}`);
  return data.assessment;
}

export async function deleteAssessment(id) {
  await api.delete(`/assessments/${id}`);
}
