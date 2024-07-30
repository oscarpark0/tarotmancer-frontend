import React, { useState, useEffect, createContext, useContext } from 'react';

// Create a context to store component information
const ComponentContext = createContext<any>(null);

// Provider component to wrap the entire app
export const ComponentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [components, setComponents] = useState<Record<string, any>>({});

  const registerComponent = (name: string, props: any) => {
    setComponents(prev => ({ ...prev, [name]: props }));
  };

  return (
    <ComponentContext.Provider value={{ components, registerComponent }}>
      {children}
    </ComponentContext.Provider>
  );
};

// Hook to use in components to register themselves
export const useRegisterComponent = (name: string, props: any) => {
  const { registerComponent } = useContext(ComponentContext);
  useEffect(() => {
    registerComponent(name, props);
  }, [name, props, registerComponent]);
};

// RealTimeDashboard component
const RealTimeDashboard: React.FC = () => {
  const { components } = useContext(ComponentContext);

  return (
    <div className="real-time-dashboard">
      <h2>Real-Time Component Dashboard</h2>
      {Object.entries(components).map(([name, props]) => (
        <div key={name} className="component-info">
          <h3>{name}</h3>
          <pre>{JSON.stringify(props, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
};

export default RealTimeDashboard;