import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || t('FAILED_TO_LOGIN'));
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(t('FAILED_TO_LOGIN'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>{t('WELCOME_BACK')}</h2>
        <p className="login-subtitle">{t('LOGIN_BUTTON')}</p>
        
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">{t('EMAIL')}</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={error ? 'error-input' : ''}
              placeholder={t('EMAIL')}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('PASSWORD')}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={error ? 'error-input' : ''}
              placeholder={t('PASSWORD')}
              required
            />
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? t('LOADING') : t('LOGIN_BUTTON')}
          </button>
        </form>

        <p className="register-link">
          {t('SIGN_UP')}{' '}
          <span onClick={() => navigate('/register')}>{t('REGISTER')}</span>
        </p>
      </div>
    </div>
  );
};

export default Login; 