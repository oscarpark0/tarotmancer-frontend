import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './TermsOfUse.module.css';

const TermsOfUse: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.termsContainer}>
      <button className={styles.backButton} onClick={handleBack}>Back</button>
      <h1>Tarotmancer Terms of Use</h1>

      <section>
        <h2>1. Acceptance of Terms</h2>
        <p>1.1. By accessing or using the Tarotmancer website and services (collectively, the "Service"), you agree to be bound by these Terms of Use ("Terms"). If you do not agree to these Terms, you may not use the Service.</p>
        <p>1.2. We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service following any changes constitutes your acceptance of the new Terms.</p>
      </section>

      <section>
        <h2>2. Description of Service</h2>
        <p>Tarotmancer is an online platform that provides digital tarot card readings, spreads, and interpretations for entertainment and spiritual guidance purposes.</p>
      </section>

      <section>
        <h2>3. User Accounts</h2>
        <p>3.1. <strong>Account Creation</strong>. To access certain features of the Service, you must create an account. You must provide accurate, current, and complete information during registration and keep it updated.</p>
        <p>3.2. <strong>Account Security</strong>. You are responsible for safeguarding your password. You agree not to disclose your password to any third party and to notify us immediately of any unauthorized use of your account.</p>
        <p>3.3. <strong>Account Responsibility</strong>. You are solely responsible for any activities or actions taken under your account, whether or not you have authorized such activities or actions.</p>
      </section>

      <section>
        <h2>4. User Content</h2>
        <p>4.1. <strong>Ownership</strong>. You retain all rights in and to the content you post to the Service.</p>
        <p>4.2. <strong>License</strong>. By posting content, you grant Tarotmancer a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content for the purpose of providing and promoting the Service.</p>
        <p>4.3. <strong>Responsibility</strong>. You are solely responsible for your content and any consequences that may arise from posting it. You warrant that you have the necessary rights and permissions to post the content and that it does not infringe upon the intellectual property or other rights of any third party.</p>
      </section>

      <section>
        <h2>5. Prohibited Uses</h2>
        <p>You agree not to use the Service:</p>
        <ul>
          <li>For any unlawful purpose or to solicit the performance of any illegal activity.</li>
          <li>To impersonate any person or entity or falsely state your affiliation with a person or entity.</li>
          <li>To harass, abuse, harm, or intimidate any person.</li>
          <li>To interfere with or disrupt the Service or servers or networks connected to the Service.</li>
          <li>To attempt to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service.</li>
          <li>To post any content that is hateful, threatening, pornographic, incites violence, or contains nudity or graphic or gratuitous violence.</li>
          <li>To post any content that infringes upon the intellectual property or other rights of any third party.</li>
        </ul>
      </section>

      <section>
        <h2>6. Intellectual Property</h2>
        <p>6.1. <strong>Ownership</strong>. The Service and its original content, features, and functionality are owned by Tarotmancer and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
        <p>6.2. <strong>Limited License</strong>. Subject to these Terms, Tarotmancer grants you a non-exclusive, non-transferable, revocable license to use the Service for your personal, non-commercial use.</p>
        <p>6.3. <strong>Restrictions</strong>. You may not modify, reproduce, distribute, create derivative works or adaptations of, publicly display or in any way exploit any of the content, in whole or in part, except as expressly authorized by Tarotmancer.</p>
      </section>

      <section>
        <h2>7. Privacy</h2>
        <p>Your use of the Service is subject to our Privacy Policy, which is incorporated into these Terms by reference.</p>
      </section>

      <section>
        <h2>8. Subscription and Payments</h2>
        <p>8.1. <strong>Fees</strong>. Certain features of the Service may require a subscription or payment. You agree to pay all fees or charges to your account based on the fees, charges, and billing terms in effect at the time a fee or charge is due and payable.</p>
        <p>8.2. <strong>Payment Method</strong>. By providing a payment method, you expressly authorize us to charge the applicable fees on said payment method as well as taxes and other charges incurred thereto at regular intervals.</p>
        <p>8.3. <strong>Refunds</strong>. All fees are non-refundable, except as expressly stated otherwise in these Terms or as required by applicable law.</p>
      </section>

      <section>
        <h2>9. Disclaimer of Warranties</h2>
        <p>9.1. <strong>As Is</strong>. Your use of the Service is at your sole risk. The Service is provided on an "AS IS" and "AS AVAILABLE" basis.</p>
        <p>9.2. <strong>No Warranties</strong>. Tarotmancer expressly disclaims all warranties of any kind, whether express or implied, including, but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        <p>9.3. <strong>No Guarantees</strong>. Tarotmancer makes no warranty that the Service will meet your requirements or be available on an uninterrupted, secure, or error-free basis.</p>
      </section>

      <section>
        <h2>10. Limitation of Liability</h2>
        <p>10.1. <strong>No Indirect Damages</strong>. Tarotmancer and its affiliates, officers, employees, agents, partners, and licensors shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
        <p>10.2. <strong>Liability Cap</strong>. In no event shall Tarotmancer's total liability to you for all damages, losses, and causes of action exceed the amount you have paid Tarotmancer in the last six (6) months, or, if greater, one hundred dollars ($100).</p>
      </section>

      <section>
        <h2>11. Indemnification</h2>
        <p>You agree to indemnify and hold Tarotmancer and its affiliates, officers, employees, agents, partners, and licensors harmless from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Service; (b) your violation of these Terms; (c) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (d) any claim that your content caused damage to a third party.</p>
      </section>

      <section>
        <h2>12. Governing Law</h2>
        <p>These Terms shall be governed and construed in accordance with the laws of the State of Michigan, without regard to its conflict of law provisions.</p>
      </section>

      <section>
        <h2>13. Dispute Resolution</h2>
        <p>Any dispute arising from or relating to these Terms or your use of the Service shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association. The arbitrator's award shall be binding and may be entered as a judgment in any court of competent jurisdiction.</p>
      </section>

      <section>
        <h2>14. Termination</h2>
        <p>14.1. <strong>By Tarotmancer</strong>. We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
        <p>14.2. <strong>By You</strong>. You may terminate your account at any time by following the instructions on the Service.</p>
        <p>14.3. <strong>Survival</strong>. All provisions of the Terms which by their nature should survive termination shall survive termination, including, without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.</p>
      </section>

      <section>
        <h2>15. Contact Us</h2>
        <p>If you have any questions about these Terms, please contact us at tb@tarotmancer.com.</p>
      </section>

      <section>
        <h2>16. Language</h2>
        <p>These Terms are only provided in English (US). By using the Service, you acknowledge that you have sufficient proficiency in English to understand these Terms. If you do not understand English, you should not use the Service.</p>
      </section>

      <section>
        <h2>17. Entire Agreement</h2>
        <p>These Terms constitute the entire agreement between you and Tarotmancer regarding the use of the Service and supersede all prior understandings and agreements between you and Tarotmancer.</p>
      </section>

      <p>By using the Service, you acknowledge that you have read and understood these Terms and agree to be bound by them.</p>

      <p>Last updated: July 26, 2024</p>
    </div>
  );
};

export default TermsOfUse;