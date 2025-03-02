import React, { useState, useEffect, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      console.error("ErrorBoundary caught an error", event.error);
      setError(event.error);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  if (error) {
    return (
      <div className="error-boundary">
        <h2>Something went wrong</h2>
        <details>
          <summary>Error details</summary>
          <pre>{error.toString()}</pre>
        </details>
      </div>
    );
  }

  return <>{children}</>;
};

export default ErrorBoundary;
