import React from 'react';

interface ErrorObject {
  message?: string;
  [key: string]: any;
}

interface ErrorStateProps {
  error: string | ErrorObject;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error }) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';

  return (
    <div className="error-state">
      <h2>An error occurred</h2>
      <p>{errorMessage}</p>
    </div>
  );
};