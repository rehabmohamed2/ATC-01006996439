import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import '../i18n';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    price: '',
    category: '',
    capacity: ''
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      if (image) {
        formDataToSend.append('image', image);
      }

      const response = await axios.post(
        API_ENDPOINTS.EVENTS.CREATE,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      console.log('Event created successfully:', response.data);
      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(t('ERROR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-container">
      <div className="create-event-card">
        <h2>{t('CREATE_NEW_EVENT')}</h2>
        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="create-event-form">
          <div className="form-group">
            <label htmlFor="title">{t('EVENT_TITLE')}</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">{t('EVENT_DESCRIPTION')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">{t('EVENT_DATE')}</label>
            <input
              type="datetime-local"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
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
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="price">{t('EVENT_PRICE')}</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">{t('EVENT_CATEGORY')}</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">{t('SELECT_CATEGORY')}</option>
              <option value="Music">{t('CATEGORY_MUSIC')}</option>
              <option value="Sports">{t('CATEGORY_SPORTS')}</option>
              <option value="Arts">{t('CATEGORY_ARTS')}</option>
              <option value="Food & Drink">{t('CATEGORY_FOOD & DRINK')}</option>
              <option value="Business">{t('CATEGORY_BUSINESS')}</option>
              <option value="Technology">{t('CATEGORY_TECHNOLOGY')}</option>
              <option value="Health & Wellness">{t('CATEGORY_HEALTH & WELLNESS')}</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="capacity">{t('EVENT_CAPACITY')}</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="image">{t('EVENT_IMAGE')}</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => navigate('/admin')}>
              {t('CANCEL')}
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? t('LOADING') : t('SUBMIT')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent; 