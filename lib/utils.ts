export function getErrorMessage(err: unknown): string {
  if (!err) return 'An unknown error occurred';
  if (typeof err === 'string') return err;
  if (err instanceof Error) return err.message;
  // attempt to read common shape { message }
  const maybe = err as { message?: unknown };
  if (maybe && typeof maybe.message === 'string') return maybe.message;
  return 'An unexpected error occurred';
}
