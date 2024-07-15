import React, { createContext, useContext } from 'react';
import { useSpread } from '../hooks/useSpread';

const SpreadContext = createContext();

export const useSpreadContext = () => useContext(SpreadContext);

export const SpreadProvider = ({ children, spreadType, selectedLanguage }) => {
  const spreadState = useSpread(spreadType, selectedLanguage);

  return (
    <SpreadContext.Provider value={spreadState}>
      {children}
    </SpreadContext.Provider>
  );
};