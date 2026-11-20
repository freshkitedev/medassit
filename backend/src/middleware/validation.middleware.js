/**
 * Validates req[source] with a Zod schema and replaces it with the parsed
 * (trimmed / coerced) result. Parsed query is stored on req.validatedQuery
 * because some Express versions make req.query read-only.
 */
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) return next(result.error);
  if (source === 'query') req.validatedQuery = result.data;
  else req[source] = result.data;
  next();
};
