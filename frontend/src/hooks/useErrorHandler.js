import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);

  const handleError = useCallback((err) => {
    const message = err?.message || 'Ocurrió un error inesperado.';
    setError(message);
    return message;
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { error, handleError, clearError };
}
