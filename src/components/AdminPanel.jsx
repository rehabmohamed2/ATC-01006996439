import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './AdminPanel.css';
import '../i18n';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const eventsPerPage = 6;
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

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_ENDPOINTS.EVENTS.LIST}?page=${page}&limit=${eventsPerPage}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data.events);
      setTotalPages(response.data.pagination.totalPages);
      setTotalEvents(response.data.pagination.totalEvents);
    } catch (error) {
      setError(t('FAILED_TO_LOAD_EVENTS'));
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchEvents(currentPage);
  }, [user, navigate, currentPage]);

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
      const token = localStorage.getItem('token');
      const eventData = {
        ...formData,
        date: `${formData.date}T${formData.time}`
      };

      const formDataToSend = new FormData();
      Object.keys(eventData).forEach(key => {
        formDataToSend.append(key, eventData[key]);
      });

      if (!image && !editingEvent) {
        setError(t('IMAGE_REQUIRED'));
        return;
      }

      if (image) {
        formDataToSend.append('image', image);
      }

      if (editingEvent) {
        await axios.put(
          API_ENDPOINTS.EVENTS.UPDATE(editingEvent._id),
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        console.log('Event updated successfully');
      } else {
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
        console.log('Event created successfully');
      }

      setShowCreateForm(false);
      setEditingEvent(null);
      setFormData({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        price: '',
        category: ''
      });
      setImage(null);
      setPreviewUrl(null);
      fetchEvents(currentPage);
    } catch (error) {
      setError(error.response?.data?.message || t('FAILED_TO_SAVE_EVENT'));
      console.error('Error saving event:', error);
    }
  };

  const handleEdit = (event) => {
    navigate(`/admin/event/edit/${event._id}`);
  };

  const handleCreateEvent = () => {
    navigate('/admin/event/add');
  };

  const handleDelete = async (eventId) => {
    if (window.confirm(t('ARE_YOU_SURE'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.EVENTS.DELETE(eventId), {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchEvents(currentPage);
      } catch (error) {
        setError(t('FAILED_TO_DELETE_EVENT'));
        console.error('Error deleting event:', error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) return <div className="loading">{t('LOADING')}</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h2>{t('ADMIN_PANEL_TITLE')}</h2>
        <button 
          className="create-button"
          onClick={handleCreateEvent}
        >
          {t('CREATE_NEW_EVENT')}
        </button>
      </div>

      {showCreateForm && (
        <div className="event-form-container">
          <form onSubmit={handleSubmit} className="event-form">
            <h3>{editingEvent ? t('EDIT_EVENT') : t('CREATE_NEW_EVENT')}</h3>
            
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
              <label htmlFor="description">{t('EVENT_DESCRIPTION')}</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder={t('ENTER_EVENT_DESCRIPTION')}
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

            <div className="form-group">
              <label htmlFor="image">{t('EVENT_IMAGE')} *</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                required={!editingEvent}
              />
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt={t('PREVIEW')} />
                </div>
              )}
              {!editingEvent && !image && (
                <small className="error-text">{t('IMAGE_REQUIRED')}</small>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-button">
                {editingEvent ? t('UPDATE_EVENT') : t('CREATE_EVENT')}
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingEvent(null);
                  setFormData({
                    name: '',
                    description: '',
                    date: '',
                    time: '',
                    location: '',
                    price: '',
                    category: ''
                  });
                  setImage(null);
                  setPreviewUrl(null);
                }}
              >
                {t('CANCEL')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="events-table">
        <table>
          <thead>
            <tr>
              <th>{t('EVENT_NAME')}</th>
              <th>{t('EVENT_CATEGORY')}</th>
              <th>{t('EVENT_DATE')}</th>
              <th>{t('EVENT_LOCATION')}</th>
              <th>{t('EVENT_PRICE')}</th>
              <th>{t('EVENT_ACTIONS')}</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event._id}>
                <td>{event.name}</td>
                <td>{t(`CATEGORY_${event.category.toUpperCase().replace(/\s+/g, '_')}`)}</td>
                <td>{new Date(event.date).toLocaleString()}</td>
                <td>{event.location}</td>
                <td>${event.price}</td>
                <td>
                  <div className="admin-action-buttons">
                    <button
                      className="editbutton"
                      onClick={() => handleEdit(event)}
                    >
                      {t('EDIT')}
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDelete(event._id)}
                    >
                      {t('DELETE')}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            {t('PREVIOUS')}
          </button>
          <span className="pagination-info">
            {t('PAGE_INFO', { current: currentPage, total: totalPages })}
          </span>
          <button
            className="pagination-button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            {t('NEXT')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel; 