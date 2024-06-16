import React, { useState } from 'react';

const Login = ({ onLogin }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const welcomeCode = process.env.REACT_APP_WELCOME; // Ensure this is set in your environment
    if (input === welcomeCode) {
      onLogin();
    } else {
      setError('Incorrect welcome code. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter welcome code"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default Login;
