/** Overwrite upload buffers so sensitive bytes do not linger until GC. */
export function scrubFiles(files = []) {
  for (const f of files) {
    if (f?.buffer?.fill) f.buffer.fill(0);
    if (f) f.buffer = undefined;
  }
}
