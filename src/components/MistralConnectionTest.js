import React, { useState } from 'react';
import { testMistralConnection } from '../services/mistralServices';

const MistralConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await testMistralConnection();
      setTestResult(result);
      console.log('Mistral connection test result:', result);
    } catch (error) {
      setError(error.message);
      console.error('Failed to test Mistral connection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Mistral Connection Test</h2>
      <button onClick={handleTestConnection} disabled={isLoading}>
        {isLoading ? 'Testing...' : 'Test Connection'}
      </button>
      {testResult && (
        <div>
          <h3>Test Result:</h3>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

export default MistralConnectionTest;