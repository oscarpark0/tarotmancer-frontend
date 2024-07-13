import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }) => {
    const [selectedSpread, setSelectedSpread] = useState('celtic');
    const [canAccessCohere, setCanAccessCohere] = useState(false);
    const [tickerMessages, setTickerMessages] = useState([]);
    const [selectedLanguage, setSelectedLanguage] = useState('en'); // Default to English

    const handleSpreadSelect = useCallback((spread) => {
        setSelectedSpread(spread);
    }, []);

    useEffect(() => {
        const messages = [
            "Tarotmancer: Launching soon.",
            "Maintenance...",
            "Tarotmancer: Bientôt disponible.", // French
            "Maintenance en cours...", // French
            "Tarotmancer: Próximamente.", // Spanish
            "Mantenimiento...", // Spanish
            "Tarotmancer: Demnächst verfügbar.", // German
            "Wartung...", // German
            "Tarotmancer: 即将推出。", // Chinese (Simplified)
            "维护中...", // Chinese (Simplified)
            "Tarotmancer: まもなく公開。", // Japanese
            "メンテナンス中...", // Japanese
            "Tarotmancer: Breve lancio.", // Italian
            "Manutenzione...", // Italian
            "Tarotmancer: Em breve.", // Portuguese
            "Manutenção...", // Portuguese
            "Tarotmancer: Binnenkort beschikbaar.", // Dutch
            "Onderhoud...", // Dutch
            "Tarotmancer: Yakında yayında.", // Turkish
            "Bakım...", // Turkish
            "Tarotmancer: Snart tillgänglig.", // Swedish
            "Underhåll...", // Swedish
            "Tarotmancer: Wkrótce.", // Polish
            "Konserwacja...", // Polish
            "Tarotmancer: قريباً.", // Arabic
            "الصيانة...", // Arabic
            "Tarotmancer: 곧 출시됩니다.", // Korean
            "유지 보수 중...", // Korean
            "Tarotmancer: Tulossa pian.", // Finnish
            "Huolto...", // Finnish
            "Tarotmancer: Snart i gang.", // Norwegian
            "Vedlikehold...", // Norwegian
            "Tarotmancer: Скоро запуск.", // Ukrainian
            "Технічне обслуговування...", // Ukrainian
        ];

        setTickerMessages(messages);
    }, []);

    const value = {
        selectedSpread,
        handleSpreadSelect,
        canAccessCohere,
        setCanAccessCohere,
        tickerMessages,
        selectedLanguage,
        setSelectedLanguage,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};