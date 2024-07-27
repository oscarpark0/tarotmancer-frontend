import React, { useState, useCallback, useEffect } from 'react';
import footerStyles from './Footer.module.css';
import headerStyles from './FeedbackButton.module.css';
import styles from './FeedbackButton.module.css';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import DOMPurify from 'dompurify';
import TarotCaptcha from './TarotCaptcha';
import { useTranslation } from '../utils/translations';

interface FeedbackButtonProps {
  isFooterLink?: boolean;
}

const FeedbackButton: React.FC<FeedbackButtonProps> = ({ isFooterLink = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const { getToken, user } = useKindeAuth();
  const { getTranslation } = useTranslation();

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const handleCaptchaVerify = (isVerified: boolean) => {
    setIsCaptchaVerified(isVerified);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCaptchaVerified) {
      alert(getTranslation('completeCaptchaFirst'));
      return;
    }
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const token = await getToken();
      const sanitizedFeedback = DOMPurify.sanitize(feedback);
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: user?.id,
          feedback: sanitizedFeedback,
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFeedback('');
        setTimeout(() => setIsModalOpen(false), 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, getToken, user?.id, isSubmitting, isCaptchaVerified, getTranslation]);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      {isFooterLink ? (
        <span onClick={handleOpenModal} className={footerStyles.footerLink}>
          <span className={styles.feedbackIcon}>✧</span> {getTranslation('feedback')}
        </span>
      ) : (
        <button onClick={handleOpenModal} className={headerStyles.feedbackButton}>
          <span className={styles.feedbackIcon}>✧</span> {getTranslation('feedback')}
        </button>
      )}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setIsModalOpen(false)}
              aria-label={getTranslation('closeFeedbackForm')}
            >
              ✶
            </button>
            <h2 className={styles.modalTitle}>{getTranslation('provideFeedback')}</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={getTranslation('enterFeedbackHere')}
                rows={5}
                required
              />
              <TarotCaptcha onVerify={handleCaptchaVerify} />
              <button type="submit" disabled={isSubmitting || !isCaptchaVerified}>
                {isSubmitting ? getTranslation('submitting') : getTranslation('submitFeedback')}
              </button>
            </form>
            {submitStatus === 'success' && <p className={styles.successMessage} aria-live="polite">{getTranslation('feedbackSubmittedSuccess')}</p>}
            {submitStatus === 'error' && <p className={styles.errorMessage} aria-live="polite">{getTranslation('feedbackSubmitError')}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;