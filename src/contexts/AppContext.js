import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
    const [selectedSpread, setSelectedSpread] = useState('celtic');
    const [canAccessCohere, setCanAccessCohere] = useState(false);
    const [tickerMessages, setTickerMessages] = useState([]);

    const handleSpreadSelect = useCallback((spread) => {
        setSelectedSpread(spread);
    }, []);

    useEffect(() => {
        const messages = [
            "Tarotmancer: Launching soon.",
            "Maintenance..."
        ];

        setTickerMessages(messages);
    }, []);

    const value = {
        selectedSpread,
        handleSpreadSelect,
        canAccessCohere,
        setCanAccessCohere,
        tickerMessages,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};