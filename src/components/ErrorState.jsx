import React from 'react';
import PropTypes from 'prop-types';

export const ErrorState = ({ error }) => {
  const errorMessage = typeof error === 'string' ? error : error.message || 'Unknown error';

  return (
    <div className="error-state">
      <h2>An error occurred</h2>
      <p>{errorMessage}</p>
    </div>
  );
};

ErrorState.propTypes = {
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      message: PropTypes.string
    })
  ]).isRequired
};