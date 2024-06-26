import React, { useEffect } from 'react';

declare global {
  interface Window {
    KindeWidgets?: {
      initSubscribeWidget: () => void;
    }
  }
}

const SubscribeButton: React.FC = () => {
  useEffect(() => {
    // Load Kinde subscribe widget scripts
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://widgets.kinde.com/v1/css/subscribe.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://widgets.kinde.com/v1/js/subscribe.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  const openSubscribeModal = () => {
    if (window.KindeWidgets) {
      window.KindeWidgets.initSubscribeWidget();
    }
  };

  return (
    <button onClick={openSubscribeModal} className="subscribe-button">
      Subscribe
    </button>
  );
};

export default SubscribeButton;
