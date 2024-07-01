import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ErrorBoundary = ({ children }) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const errorHandler = (error) => {
      console.error("ErrorBoundary caught an error", error);
      setError(error);
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

  return children;
};

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
