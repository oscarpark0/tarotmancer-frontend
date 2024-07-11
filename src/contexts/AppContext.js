import React, { createContext, useContext, useState, useCallback } from 'react';
const AppContext = createContext();
export const useAppContext = () => useContext(AppContext);
export const AppContextProvider = ({ children }) => {
    const [selectedSpread, setSelectedSpread] = useState('celtic');
    const [canAccessCohere, setCanAccessCohere] = useState(false);
    const handleSpreadSelect = useCallback((spread) => {
        setSelectedSpread(spread);
    }, []);
    const value = {
        selectedSpread,
        handleSpreadSelect,
        canAccessCohere,
        setCanAccessCohere,
    };
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
