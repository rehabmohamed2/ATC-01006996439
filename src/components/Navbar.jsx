import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // Update document direction for RTL languages
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">{t('EVENT_BOOKING')}</Link>
      </div>
      <div className="navbar-menu">
        {user ? (
          <>
            <Link to="/events" className="navbar-item">{t('EVENTS')}</Link>
            <button onClick={handleLogout} className="navbar-item logoutbutton">
              {t('LOGOUT')}
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-item">{t('LOGIN')}</Link>
            <Link to="/register" className="navbar-item">{t('REGISTER')}</Link>
          </>
        )}
      </div>
      <div className="navbar-lang-switcher">
        <button 
          type="button" 
          onClick={() => changeLanguage('en')}
          className={i18n.language === 'en' ? 'active' : ''}
        >
          EN
        </button>
        <button 
          type="button" 
          onClick={() => changeLanguage('ar')}
          className={i18n.language === 'ar' ? 'active' : ''}
        >
          AR
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 