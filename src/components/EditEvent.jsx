import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './EditEvent.css';
import '../i18n';

const EditEvent = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        console.log('Fetching event with ID:', eventId);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await axios.get(API_ENDPOINTS.EVENTS.DETAIL(eventId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Event data received:', response.data);
        const event = response.data;
        const [date, time] = event.date.split('T');
        setFormData({
          name: event.name,
          description: event.description,
          date: date,
          time: time,
          location: event.location,
          price: event.price,
          category: event.category || ''
        });
        if (event.imageId) {
          setPreviewUrl(API_ENDPOINTS.EVENTS.GET_IMAGE(eventId));
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        if (error.response?.status === 404) {
          setError('Event not found');
        } else if (error.response?.status === 401) {
          setError('Authentication required');
          navigate('/login');
        } else if (error.response?.status === 400) {
          setError('Invalid event ID');
        } else {
          setError('Failed to load event details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId, navigate]);

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
      setSaving(true);
      const token = localStorage.getItem('token');
      const eventData = {
        ...formData,
        date: `${formData.date}T${formData.time}`
      };

      const formDataToSend = new FormData();
      Object.keys(eventData).forEach(key => {
        formDataToSend.append(key, eventData[key]);
      });

      if (image) {
        formDataToSend.append('image', image);
      }

      await axios.put(
        API_ENDPOINTS.EVENTS.UPDATE(eventId),
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
      setError(error.response?.data?.message || 'Failed to update event');
      console.error('Error updating event:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  if (loading) {
    return <div className="loading">{t('LOADING')}</div>;
  }

  return (
    <div className="edit-event-container">
      <div className="edit-event-header">
        <h2>{t('EDIT_EVENT')}</h2>
        <p className="subtitle">{t('UPDATE_EVENT_DETAILS')}</p>
      </div>

      <form onSubmit={handleSubmit} className="edit-event-form">
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
            disabled={saving}
          >
            {saving ? t('UPDATING_EVENT') : t('UPDATE_EVENT')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 