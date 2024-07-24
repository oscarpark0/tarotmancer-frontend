import React, { useState } from 'react';
import styles from './FeedbackButton.module.css';
import { useKindeAuth } from "@kinde-oss/kinde-auth-react";

const FeedbackButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { getToken, user } = useKindeAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = await getToken();
      const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/submit-feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user?.id,
          feedback: feedback,
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
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <button type="submit" disabled={isSubmitting}>
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