import React, { useEffect, useState } from 'react';
import styles from './SubscribeButton.module.css';
import { useTranslation } from '../utils/translations'; // Import the useTranslation hook

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
  const { getTranslation } = useTranslation(); // Use the hook to get translation function

  useEffect(() => {
    const { script, link } = loadKindeWidgetScripts();
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={styles.subscribeButton}>
        <span className={styles.buttonIcon}>✧</span> {getTranslation('subscribe')}
      </button>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton} 
              onClick={() => setIsModalOpen(false)}
              aria-label={getTranslation('closeModal')}
            >
              ✶
            </button>
            <div className={`kuiembed-container ${styles.kindeForm}`}>
              <form
                method="post"
                action="https://tarotmancer.kinde.com/widgets/subscribe/v1/subscribe"
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
                      <span className="kuiembed-heading">Updates &amp; Weekly Readings</span>
                      <span className="kuiembed-sub-heading">
                        Signup to receive updates/improvements to tarotmancer, and receive a weekly reading delivered to your email.
                      </span>
                    </legend>
                  </div>
                  <div className="kuiembed-form">
                    <div className="kuiembed-field">
                      <label className="kuiembed-label" data-kui-name="new_name" htmlFor="id__kui_new_name">
                        First name
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
                        Email
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
                      <button type="submit" className="kuiembed-button">Sign up</button>
                    </div>
                  </div>
                  <p data-kui-element="true" id="id__kui_message" className="kuiembed-message"></p>
                </fieldset>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribeButton;