import React from 'react';
import './CardAnimation.css';
import { TAROT_IMAGE_BASE_URL } from '../utils/config';

const CardAnimation = () => {
  return (
    <div className="card-animation-container">
      <div className="animated-card card-1">
        <img src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`} alt="Tarot Card Back" />
      </div>
      <div className="animated-card card-2">
        <img src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`} alt="Tarot Card Back" />
      </div>
      <div className="animated-card card-3">
        <img src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`} alt="Tarot Card Back" />
      </div>
      <div className="animated-card card-4">
        <img src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`} alt="Tarot Card Back" />
      </div>
      <div className="animated-card card-5">
        <img src={`${TAROT_IMAGE_BASE_URL}/cardback.webp`} alt="Tarot Card Back" />
      </div>
    </div>
  );
};

export default CardAnimation;
