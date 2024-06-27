import React, { useEffect, useState } from 'react';

declare global {
  interface Window {
    KindeWidgets?: {
      initSubscribeWidget: () => void;
    }
  }
}

const SubscribeButton: React.FC = () => {
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    // Load Kinde subscribe widget scripts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://widgets.kinde.com/v1/css/subscribe.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://widgets.kinde.com/v1/js/subscribe.js';
    script.async = true;
    script.onload = () => {
      setIsWidgetLoaded(true);
      console.log('Kinde Widget script loaded');
    };
    script.onerror = (error) => {
      console.error('Error loading Kinde Widget script:', error);
      setLoadError('Failed to load Kinde Widget');
    };
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  const openSubscribeModal = () => {
    if (window.KindeWidgets && isWidgetLoaded) {
      console.log('Attempting to open subscribe modal');
      window.KindeWidgets.initSubscribeWidget();
    } else {
      console.error('Kinde Widgets not loaded yet');
      setLoadError('Kinde Widgets not loaded yet');
    }
  };

  if (loadError) {
    return <div>Error: {loadError}</div>;
  }

  return (
    <button onClick={openSubscribeModal} className="subscribe-button" disabled={!isWidgetLoaded}>
      {isWidgetLoaded ? 'Subscribe' : 'Loading...'}
    </button>
  );
};

export default SubscribeButton;
