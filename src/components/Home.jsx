import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Home.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  return (
    <div className="home">
      <div className="hero">
        <h1>{t('WELCOME')}</h1>
        <p>{t('DISCOVER_EVENTS')}</p>
        <div className="cta-buttons">
          {user ? (
            <Link to="/events" className="btn btn-primary">
              {t('BROWSE_EVENTS')}
            </Link>
          ) : (
            <>
              <Link to="/register" className="btn btn-primary">
                {t('SIGN_UP')}
              </Link>
              <Link to="/login" className="btn btn-secondary">
                {t('LOGIN')}
              </Link>
            </>
          )}
        </div>
      </div>
      
      <div className="features">
        <div className="feature">
          <h3>{t('EASY_BOOKING')}</h3>
          <p>{t('BOOK_FAVORITE_EVENTS')}</p>
        </div>
        <div className="feature">
          <h3>{t('WIDE_SELECTION')}</h3>
          <p>{t('CHOOSE_EVENTS')}</p>
        </div>
        <div className="feature">
          <h3>{t('SECURE_PAYMENTS')}</h3>
          <p>{t('SAFE_PAYMENT')}</p>
        </div>
      </div>

      {user && (
        <div className="user-welcome">
          <h2>{t('WELCOME_BACK')}, {user.username}!</h2>
          <p>{t('READY_TO_EXPLORE')}</p>
          <Link to="/events" className="btn btn-primary">
            {t('BROWSE_EVENTS')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home; 