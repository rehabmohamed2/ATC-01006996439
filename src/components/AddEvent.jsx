import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './AddEvent.css';
import '../i18n';

const AddEvent = () => {
  
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    time: '',
    location: '',
    price: '',
    category: ''
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const categories = [
    'Music',
    'Sports',
    'Arts & Theater',
    'Food & Drink',
    'Business',
    'Technology',
    'Health & Wellness',
    'Family',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const eventData = {
        ...formData,
        date: `${formData.date}T${formData.time}`
      };

      const formDataToSend = new FormData();
      Object.keys(eventData).forEach(key => {
        formDataToSend.append(key, eventData[key]);
      });

      if (!image) {
        setError('Please select an image for the event');
        return;
      }

      formDataToSend.append('image', image);

      await axios.post(
        API_ENDPOINTS.EVENTS.CREATE,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create event');
      console.error('Error creating event:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="add-event-container">
      <div className="add-event-header">
        <h2>{t('CREATE_NEW_EVENT')}</h2>
        <p className="subtitle">{t('FILL_EVENT_DETAILS')}</p>
      </div>

      <form onSubmit={handleSubmit} className="add-event-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">{t('EVENT_TITLE')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder={t('ENTER_EVENT_NAME')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">{t('EVENT_CATEGORY')}</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">{t('SELECT_CATEGORY')}</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {t(`CATEGORY_${category.toUpperCase().replace(/\s+/g, '_')}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="date">{t('EVENT_DATE')}</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="time">{t('EVENT_TIME')}</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">{t('EVENT_LOCATION')}</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              placeholder={t('ENTER_EVENT_LOCATION')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">{t('EVENT_PRICE')}</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
              placeholder={t('ENTER_EVENT_PRICE')}
            />
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">{t('EVENT_DESCRIPTION')}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            placeholder={t('ENTER_EVENT_DESCRIPTION')}
            rows="4"
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="image">{t('EVENT_IMAGE')}</label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              required
              className="image-input"
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt={t('PREVIEW')} />
              </div>
            )}
          </div>
          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={() => navigate('/admin')}
          >
            {t('CANCEL')}
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={loading}
          >
            {loading ? t('CREATING_EVENT') : t('CREATE_EVENT')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEvent; 