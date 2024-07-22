import React, { useEffect, useState, useRef, useContext } from 'react';
import styles from './SubscribeButton.module.css';
import { LanguageContext } from './LanguageSelector';
import { buttonTranslations } from '../utils/translations';

const loadKindeWidgetScripts = () => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://widgets.kinde.com/v1/css/subscribe.css';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = 'https://widgets.kinde.com/v1/js/subscribe.js';
  script.async = true;
  return { script, link };
};

const SubscribeButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scriptLoadedRef = useRef(false);
  const { selectedLanguage } = useContext(LanguageContext);

  const getTranslation = (key: string) => {
    if (!buttonTranslations[key as keyof typeof buttonTranslations]) {
      console.error(`Translation key not found: ${key}`);
      return key; // Return the key itself as a fallback
    }
    return buttonTranslations[key as keyof typeof buttonTranslations][selectedLanguage as keyof (typeof buttonTranslations)[keyof typeof buttonTranslations]] || 
           buttonTranslations[key as keyof typeof buttonTranslations]['English'] ||
           key; // Fallback to the key itself if both selected language and English are not available
  };

  useEffect(() => {
    if (!scriptLoadedRef.current) {
      const { script, link } = loadKindeWidgetScripts();
      script.onload = () => {
        scriptLoadedRef.current = true;
      };
      script.onerror = (error) => {
        console.error('Error loading Kinde Widget script:', error);
      };
      document.body.appendChild(script);

      return () => {
        document.head.removeChild(link);
        document.body.removeChild(script);
      };
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch('https://tarotmancer.kinde.com/widgets/subscribe/v1/subscribe', {
        method: 'POST',
        body: formData,
      });

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        // If the response is JSON, parse it
        const data = await response.json();
        if (data.status === 'success') {
          setSubscriptionStatus(data.message);
        } else {
          setSubscriptionStatus('An error occurred. Please try again.');
        }
      } else {
        // If the response is not JSON, it's likely a success (HTML page)
        setSubscriptionStatus('Thank you for subscribing!');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubscriptionStatus('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={styles.subscribeButton}>
        {getTranslation('subscribe')}
      </button>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton} 
              onClick={() => setIsModalOpen(false)}
              aria-label={getTranslation('closeModal')}
            >
              &times;
            </button>
            {isLoading ? (
              <div className={styles.loadingMessage}>{getTranslation('subscribing')}</div>
            ) : subscriptionStatus ? (
              <div className={styles.successMessage}>{subscriptionStatus}</div>
            ) : (
              <div className={`kuiembed-container ${styles.kindeForm}`}>
                <form
                  onSubmit={handleSubmit}
                  data-kui-form="true"
                  id="id__kui_form"
                  noValidate
                >
                  <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
                    <input
                      data-kui-element="true"
                      type="text"
                      id="id__kui_p_0fb67a0e1d7d47c0b12ec7c0af02dd16"
                      name="p_0fb67a0e1d7d47c0b12ec7c0af02dd16"
                      tabIndex={-1}
                      defaultValue=""
                    />
                  </div>
                  <fieldset>
                    <div>
                      <legend>
                        <span className="kuiembed-heading">{getTranslation('updatesAndWeeklyReadings')}</span>
                        <span className="kuiembed-sub-heading">
                          {getTranslation('signupDescription')}
                        </span>
                      </legend>
                    </div>
                    <div className="kuiembed-form">
                      <div className="kuiembed-field">
                        <label className="kuiembed-label" data-kui-name="new_name" htmlFor="id__kui_new_name">
                          {getTranslation('firstName')}
                        </label>
                        <input
                          className="kuiembed-input-field__name"
                          type="text"
                          id="id__kui_new_name"
                          data-kui-element="true"
                          name="new_name"
                        />
                      </div>
                      <div className="kuiembed-field">
                        <label className="kuiembed-label" data-kui-name="new_email" htmlFor="id__kui_new_email">
                          {getTranslation('email')}
                        </label>
                        <input
                          className="kuiembed-input-field__email"
                          type="email"
                          id="id__kui_new_email"
                          name="new_email"
                          data-kui-element="true"
                          autoComplete="email"
                        />
                      </div>
                      <div className="kuiembed-field">
                        <button type="submit" className="kuiembed-button">
                          {getTranslation('signUp')}
                        </button>
                      </div>
                    </div>
                    <p data-kui-element="true" id="id__kui_message" className="kuiembed-message"></p>
                  </fieldset>
                </form>
                <div className="kuiembed-kinde-logo">
                  <a href="https://kinde.com" className="kuiembed-kinde-logo__icon">
                    {/* SVG code for Kinde logo */}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribeButton;