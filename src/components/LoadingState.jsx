import React from 'react';

export const LoadingState = () => (
  <div className="loading-state">
    <div className="flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-lg text-gray-600">Loading...</p>
    </div>
  </div>
);