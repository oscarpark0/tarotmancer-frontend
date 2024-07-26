import React, { useEffect, useState, useContext } from 'react';
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
                    value=""
                  />
                </div>
                <fieldset>
                  <div>
                    <legend>
                      <span className="kuiembed-heading">Updates &amp; Weekly Readings</span>
                      <span className="kuiembed-sub-heading">
                        Signup to receive updates/improvements to Tarotmancer, and receive a weekly reading delivered to your email.
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
              <div className="kuiembed-kinde-logo">
                <p className="kuiembed-kinde-logo__text">Powered by<span className="kuiembed-hide-visually"> Kinde</span></p>
                <a href="https://kinde.com" className="kuiembed-kinde-logo__icon">
                  <svg viewBox="0 0 86 28" xmlns="http://www.w3.org/2000/svg">
                    <g transform="translate(0.000300, -0.000468)">
                      <path fill="currentColor" fillRule="evenodd" d="M20.471326,27.7221297 C18.7295081,27.7221297 17.1476338,27.7337069 15.5663868,27.7062111 C15.3872081,27.70311 15.1745771,27.5135336 15.0399317,27.3574483 C11.5828487,23.3482265 8.13391956,19.3315622 4.68331787,15.3165519 C4.57167091,15.186722 4.45626058,15.0599931 4.24990189,14.8267954 L4.24990189,27.6834702 L0,27.6834702 L0,0.0387975722 L4.20683209,0.0387975722 L4.20683209,12.7207808 C4.43618922,12.465049 4.56247154,12.3368729 4.67432757,12.1975332 C7.81737746,8.2894051 10.962309,4.38293087 14.0938597,0.465913139 C14.3549965,0.139477766 14.6165514,-0.00813138893 15.0497583,0.00034476704 C16.5118316,0.0292877386 17.9747412,0.0115084847 19.599058,0.0115084847 C15.7618735,4.61571506 12.0001657,9.12937148 8.22361346,13.6608072 C12.2884825,18.3276546 16.3288895,22.966386 20.471326,27.7221297"></path>
                      <path fill="currentColor" fillRule="evenodd" d="M62.378846,18.1361762 C62.3702738,16.8564833 62.1670513,15.8709752 61.7451345,14.9299151 C60.0371871,11.1203998 55.1190761,10.3128909 52.4021245,13.3963511 C50.4675379,15.592089 50.228145,19.1996236 51.855598,21.6289726 C53.5480738,24.1550738 56.6557897,25.0016558 59.2061072,23.5660844 C61.4127026,22.3240174 62.2847615,20.3056586 62.378846,18.1361762 M61.9333036,9.81672571 L61.9333036,0.0792763853 L65.9034608,0.0792763853 L65.9034608,27.7458629 C64.9923046,27.7458629 64.0775941,27.755993 63.164138,27.7313915 C63.0667083,27.7287039 62.9473255,27.5356129 62.8854388,27.4084706 C62.6385192,26.9003147 62.4102075,26.3830624 62.1517887,25.8180543 C60.9623514,26.9635758 59.5740822,27.5744792 58.0120702,27.851298 C53.3318885,28.6807209 48.7219566,25.9704184 47.3426776,21.4681324 C46.1933831,17.7171233 46.6000372,14.1565176 49.1599722,11.0374989 C51.8001927,7.82090108 56.6250555,6.80438257 60.1789411,8.65280478 C60.7825455,8.96662929 61.3200816,9.40552878 61.9333036,9.81672571"></path>
                      <path fill="currentColor" fillRule="evenodd" d="M82.1152065,16.3034245 C82.1297773,13.788487 79.6515913,11.551402 76.8393008,11.506127 C74.0383003,11.4610586 71.6240918,13.6433587 71.5615779,16.3034245 L82.1152065,16.3034245 Z M71.5394157,19.6426165 C71.638309,21.6214888 73.3017232,23.5317249 75.3690735,24.040501 C77.6070304,24.5912444 79.5305359,24.0613813 81.082094,22.3291445 C81.1960408,22.2020021 81.3810737,22.0597681 81.5353723,22.0570805 C82.8383382,22.03558 84.1421405,22.0446764 85.5151471,22.0446764 C85.0123177,23.3712982 84.3039658,24.4982134 83.3430494,25.4622211 C81.507356,27.3038211 79.2317653,28.0191259 76.6640945,27.9726104 C71.8605575,27.8855748 67.96065,24.3512245 67.3789987,19.6025098 C67.0453123,16.8798031 67.3932159,14.2935419 68.9320203,11.9762435 C70.9738633,8.90125952 73.9097182,7.44087986 77.6126754,7.83036957 C81.2587638,8.21365721 83.7398769,10.2857672 85.1448723,13.5856795 C85.9339277,15.4384431 86.23458,17.3867186 85.8013731,19.3949473 C85.787365,19.4598623 85.7631121,19.5225032 85.7265236,19.6426165 L71.5394157,19.6426165 Z"></path>
                      <path fill="currentColor" fillRule="evenodd" d="M45.2491509,27.7285798 L41.2664491,27.7285798 L41.2664491,27.1309075 C41.2654037,23.4967039 41.2785755,19.8625004 41.2574588,16.2285036 C41.2459595,14.2188276 39.8137842,12.3154138 37.9331394,11.7198088 C35.2084519,10.8568948 32.2360086,12.6927061 31.7568049,15.5446225 C31.6915729,15.9330785 31.6679473,16.3324915 31.667111,16.7269429 C31.6604205,20.17157 31.6631385,23.6164038 31.6631385,27.0610309 L31.6631385,27.7149353 L27.7065712,27.7149353 L27.7065712,7.99216078 C28.6074827,7.99216078 29.5069306,7.98017012 30.4051241,8.00766594 C30.5169801,8.01118045 30.6572705,8.20861286 30.7243842,8.3450583 C30.9736036,8.85052662 31.1975247,9.36777887 31.449044,9.91996942 C33.425655,8.07382131 35.7700319,7.55429497 38.31115,7.83132055 C41.6076622,8.19083361 44.3635021,10.7756477 45.0143578,14.0515786 C45.1644749,14.8065767 45.2537506,15.5857628 45.2591866,16.3546122 C45.2842758,20.0059748 45.2708949,23.6575442 45.2702677,27.3089068 C45.2702677,27.4286066 45.2585594,27.5485132 45.2491509,27.7285798" id="Fill-9"></path>
                      <polygon fill="currentColor" fillRule="evenodd" points="21.4969935 27.7280837 25.4395527 27.7280837 25.4395527 8.00592936 21.4969935 8.00592936"></polygon>
                      <path fill="currentColor" fillRule="evenodd" d="M25.9137461,2.47980645 C25.9103934,3.80766864 24.7897423,4.90584768 23.4489335,4.89509743 C22.1457585,4.88476065 21.0205077,3.77810546 21.004827,2.49200384 C20.9889372,1.19804628 22.1434586,0.0492170419 23.4625235,0.0461077015 C24.7972691,0.0426015056 25.9170838,1.15463182 25.9137461,2.47980645"></path>
                    </g>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SubscribeButton;