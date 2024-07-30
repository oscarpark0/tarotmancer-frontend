import React from 'react';
import { useRegisterComponent } from '../components/RealTimeDashboard';

export function withComponentTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function WithComponentTracking(props: P) {
    useRegisterComponent(componentName, props);
    return <WrappedComponent {...props} />;
  };
}