import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import Congratulations from './Congratulations';
import './EventDetails.css';
import '../i18n';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    const fetchEventAndBookings = async () => {
      try {
        if (!id) {
          setError(t('INVALID_EVENT_ID'));
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const eventResponse = await axios.get(`${API_ENDPOINTS.EVENTS.DETAIL(id)}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setEvent(eventResponse.data);

        if (user && user.id) {
          try {
            const bookingsResponse = await axios.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
              headers: {
                Authorization: `Bearer ${token}`
              }
            });
            setUserBookings(bookingsResponse.data);
          } catch (bookingError) {
            console.error('Error fetching bookings:', bookingError);
            setUserBookings([]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          setError(t('EVENT_DETAILS_ERROR'));
        }
        setLoading(false);
      }
    };

    fetchEventAndBookings();
  }, [id, navigate, user, t]);

  const handleBookEvent = async () => {
    try {
      if (!id) {
        setError(t('INVALID_EVENT_ID'));
        return;
      }

      if (!user || !user.id) {
        setError(t('USER_NOT_AUTHENTICATED'));
        return;
      }

      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.BOOKINGS.CREATE,
        { eventId: id },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      navigate('/congratulations');
    } catch (error) {
      console.error('Error booking event:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(t('BOOKING_FAILED'));
      }
    }
  };

  if (showCongratulations) {
    return <Congratulations />;
  }

  if (loading) {
    return <div className="loading">{t('EVENT_DETAILS_LOADING')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!event) {
    return <div className="error">{t('EVENT_NOT_FOUND')}</div>;
  }

  const isBooked = (user && user.id ? userBookings.some(booking => booking.eventId === id) : false);
  const isAdmin = user?.role === 'admin';
  const bookedCount = event.bookings?.length || 0;

  return (
    <div className="event-details">
      <div className="event-header">
        <h1>{event.name}</h1>
      </div>

      <div className="event-content">
        <div className="event-image">
          <img 
            src={`http://localhost:5000/api/events/${id}/image`} 
            alt={t('EVENT_IMAGE_ALT')} 
          />
        </div>

        <div className="event-info">
          <div className="description">
            <h2>{t('ABOUT_THIS_EVENT')}</h2>
            <p>{event.description}</p>
          </div>

          <div className="details">
            <div className="detail-item">
              <h3>{t('EVENT_LOCATION_LABEL')}</h3>
              <p>{event.location}</p>
            </div>

            <div className="detail-item">
              <h3>{t('EVENT_DATE_TIME')}</h3>
              <p>{new Date(event.date).toLocaleString()}</p>
            </div>

            <div className="detail-item">
              <h3>{t('EVENT_PRICE_LABEL')}</h3>
              <p>{t('EVENT_PRICE_CURRENCY', { price: event.price })}</p>
            </div>

            <div className="detail-item">
              <h3>{t('EVENT_CATEGORY_LABEL')}</h3>
              <p>{t(`CATEGORY_${event.category.toUpperCase().replace(/\s+/g, '_')}`)}</p>
            </div>
          </div>

          {user && !isAdmin && (
            <div className="booking-section">
              {isBooked ? (
                <div className="booked-message">
                  {t('EVENT_ALREADY_BOOKED')}
                </div>
              ) : (
                <button 
                  className="book-button"
                  onClick={handleBookEvent}
                >
                  {t('EVENT_BOOK_NOW_BUTTON')}
                </button>
              )}
            </div>
          )}

          {isAdmin && (
            <div className="admin-actions">
              <button
                className="edit-button"
                onClick={() => navigate(`/admin/event/edit/${event._id}`)}
              >
                {t('EVENT_EDIT_BUTTON')}
              </button>
              <button
                className="delete-button"
                onClick={() => {
                  if (window.confirm(t('EVENT_BOOKING_ARE_YOU_SURE'))) {
                    // Handle delete
                  }
                }}
              >
                {t('EVENT_DELETE_BUTTON')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 