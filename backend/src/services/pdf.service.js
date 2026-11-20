import pdfParse from 'pdf-parse/lib/pdf-parse.js'; // import the lib directly: the package index runs a debug routine
import { env } from '../config/env.js';
import { LIMITS } from '../constants/medical.constants.js';
import { sanitizeText } from '../utils/validators.js';

const EXTRACTION_TIMEOUT_MS = 30_000;

/**
 * OCR extension point. To support scanned PDFs register an async function
 * `(buffer, filename) => string` (e.g. wrapping Tesseract or a cloud OCR API).
 * Until one is registered, scanned PDFs are reported as unreadable – never
 * silently skipped and never presented as analysed.
 */
let ocrProvider = null;
export const registerOcrProvider = (fn) => {
  ocrProvider = fn;
};

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('PDF_TIMEOUT')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Extract text from one PDF.
 * Returns { filename, size, ok, text, pageCount, truncated, reason? }.
 * The PDF is only parsed for text – nothing inside it is executed.
 */
export async function extractPdfText(file) {
  const base = { filename: file.originalname, size: file.size };
  // pdf.js (bundled in pdf-parse) fails on Node Buffers with "bad XRef entry"; a plain Uint8Array copy works.
  const bytes = new Uint8Array(file.buffer);
  try {
    const data = await withTimeout(pdfParse(bytes, { max: env.MAX_PDF_PAGES }), EXTRACTION_TIMEOUT_MS);
    let text = sanitizeText(data.text).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');

    if (text.length < LIMITS.minPdfChars && ocrProvider) {
      text = sanitizeText(await ocrProvider(file.buffer, file.originalname));
    }

    if (text.length < LIMITS.minPdfChars) {
      return {
        ...base,
        ok: false,
        pageCount: data.numpages,
        reason: 'Very little text could be extracted. The PDF may be a scanned image, which is not supported yet.',
      };
    }

    const truncated = text.length > LIMITS.reportTextPerFile || data.numpages > env.MAX_PDF_PAGES;
    return {
      ...base,
      ok: true,
      text: text.slice(0, LIMITS.reportTextPerFile),
      pageCount: data.numpages,
      truncated,
    };
  } catch (err) {
    const reason =
      err.message === 'PDF_TIMEOUT'
        ? 'Reading the PDF took too long.'
        : 'The PDF could not be read. It may be corrupted, password-protected or in an unsupported format.';
    return { ...base, ok: false, reason };
  } finally {
    bytes.fill(0);
  }
}

export async function extractAllPdfs(files) {
  return Promise.all(files.map(extractPdfText));
}
