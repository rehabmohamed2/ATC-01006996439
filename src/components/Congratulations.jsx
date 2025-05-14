import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Congratulations.css';

const Congratulations = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="congratulations-container">
      <div className="congratulations-card">
        <div className="success-icon">✓</div>
        <h1>{t('EVENT_BOOKED')}</h1>
        <p>{t('SUCCESS')}</p>
        <div className="congratulations-actions">
          <button 
            className="back-button"
            onClick={() => navigate('/events')}
          >
            {t('BACK')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Congratulations; 