import React from 'react';
import styles from './PrivacyPolicy.module.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className={styles.privacyContainer}>
      <h1>Tarotmancer Privacy Policy</h1>

      <section>
        <h2>1. Introduction</h2>
        <p>1.1. This Privacy Policy explains how Tarotmancer ("we," "us," or "our") collects, uses, shares, and protects personal information about you when you use our website and services (collectively, the "Service").</p>
        <p>1.2. By using the Service, you consent to the collection, use, and sharing of your personal information as described in this Privacy Policy.</p>
      </section>

      <section>
        <h2>2. Information We Collect</h2>
        <p>2.1. <strong>Personal Information</strong>. We may collect personal information that you provide to us, such as your name, email address, and payment information when you create an account or make a purchase.</p>
        <p>2.2. <strong>Usage Information</strong>. We may collect information about how you use the Service, including the pages you visit, the features you use, and the time and duration of your visits.</p>
        <p>2.3. <strong>Device Information</strong>. We may collect information about the device you use to access the Service, including the device type, operating system, and unique device identifiers.</p>
        <p>2.4. <strong>Cookies and Similar Technologies</strong>. We may use cookies and similar technologies to collect information about your use of the Service. Cookies are small data files stored on your device that help us to improve your experience, analyze usage, and provide personalized content.</p>
      </section>

      <section>
        <h2>3. How We Use Your Information</h2>
        <p>3.1. We use the information we collect to provide, maintain, and improve the Service.</p>
        <p>3.2. We may use your personal information to communicate with you, including sending you updates, newsletters, and promotional materials.</p>
        <p>3.3. We may use your information to personalize your experience on the Service and to provide you with content and features tailored to your interests.</p>
        <p>3.4. We may use your information to detect, investigate, and prevent fraudulent transactions and other illegal activities and to protect the rights and property of Tarotmancer and others.</p>
      </section>

      <section>
        <h2>4. How We Share Your Information</h2>
        <p>4.1. We may share your information with third-party service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</p>
        <p>4.2. We may share your information with our affiliates and partners for the purposes described in this Privacy Policy.</p>
        <p>4.3. We may share your information if we believe it is necessary to comply with a legal obligation, to protect the rights, property, or safety of Tarotmancer, our users, or others, or to enforce our Terms of Use and other agreements.</p>
        <p>4.4. We may share aggregated or de-identified information that cannot reasonably be used to identify you with third parties for any purpose.</p>
      </section>

      <section>
        <h2>5. Your Choices</h2>
        <p>5.1. You may choose not to provide certain personal information, but this may limit your ability to use certain features of the Service.</p>
        <p>5.2. You may opt out of receiving promotional emails from us by following the instructions in those emails.</p>
        <p>5.3. You may adjust your browser settings to block or delete cookies, but this may affect your ability to use certain features of the Service.</p>
      </section>

      <section>
        <h2>6. Security</h2>
        <p>We take reasonable measures to protect your personal information from unauthorized access, use, and disclosure. However, no method of transmission over the internet or method of electronic storage is 100% secure, and we cannot guarantee the absolute security of your personal information.</p>
      </section>

      <section>
        <h2>7. Children's Privacy</h2>
        <p>The Service is not intended for use by children under the age of 13. We do not knowingly collect personal information from children under the age of 13. If we learn that we have collected personal information from a child under the age of 13, we will delete that information as quickly as possible.</p>
      </section>

      <section>
        <h2>8. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy from time to time. If we make material changes, we will notify you by posting the updated Privacy Policy on the Service and, if appropriate, by sending you an email or other notification. Your continued use of the Service following any changes constitutes your acceptance of the new Privacy Policy.</p>
      </section>

      <section>
        <h2>9. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us at tb@tarotmancer.com.</p>
      </section>

      <p>Last updated: July 24, 2024</p>
    </div>
  );
};

export default PrivacyPolicy;
