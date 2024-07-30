import React, { useState, useEffect, createContext, useContext } from 'react';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

// Update the type definition
type _KindeAuthType = {
  isAuthenticated?: boolean;
  user?: any;
  getToken: () => Promise<string>;
  // Add other properties as needed
};

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
  const { isAuthenticated, user, getToken }: _KindeAuthType = useKindeAuth();

  useEffect(() => {
    console.log('RealTimeDashboard - Mounted');
    console.log('RealTimeDashboard - isAuthenticated:', isAuthenticated);
    console.log('RealTimeDashboard - user:', user);

    if (isAuthenticated) {
      getToken().then((token: string) => console.log('RealTimeDashboard - Token available:', !!token));
    }

    return () => {
      console.log('RealTimeDashboard - Unmounted');
    };
  }, [isAuthenticated, user, getToken]);

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