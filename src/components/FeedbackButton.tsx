import React, { useState, useCallback } from 'react';
import styles from './FeedbackButton.module.css';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";
import DOMPurify from 'dompurify';
import TarotCaptcha from './TarotCaptcha';

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false);
  const { getToken, user } = useKindeAuth();

  const handleCaptchaVerify = (isVerified: boolean) => {
    console.log("Captcha verified:", isVerified);
    setIsCaptchaVerified(isVerified);
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting feedback, captcha verified:", isCaptchaVerified);
    if (!isCaptchaVerified) {
      alert("Please complete the captcha first.");
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
      console.error('Error submitting feedback');
    } finally {
      setIsSubmitting(false);
    }
  }, [feedback, getToken, user?.id, isSubmitting, isCaptchaVerified]);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className={styles.feedbackButton}>
        Feedback
      </button>
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton} 
              onClick={() => setIsModalOpen(false)}
              aria-label="Close feedback form"
            >
              &times;
            </button>
            <h2>Provide Feedback</h2>
            <form onSubmit={handleSubmit}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter your feedback here..."
                rows={5}
                required
              />
              <TarotCaptcha onVerify={handleCaptchaVerify} />
              <button type="submit" disabled={isSubmitting || !isCaptchaVerified}>
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </form>
            {submitStatus === 'success' && <p className={styles.successMessage}>Feedback submitted successfully!</p>}
            {submitStatus === 'error' && <p className={styles.errorMessage}>Error submitting feedback. Please try again.</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default FeedbackButton;