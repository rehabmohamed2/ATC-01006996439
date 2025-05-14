import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import Congratulations from './Congratulations';
import '../i18n';
import './Events.css';

const Events = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [events, setEvents] = useState([]);
  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const eventsPerPage = 6;

  useEffect(() => {
    if (!user) {
      console.log('No user found, redirecting to login');
      navigate('/login');
      return;
    }

    if (user.role === 'admin') {
      console.log('Admin user detected, redirecting to admin panel');
      navigate('/admin');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    console.log('Fetching events for user:', user);
    fetchEvents(currentPage);
    fetchUserBookings();
  }, [user, navigate, currentPage]);

  const fetchEvents = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        navigate('/login');
        return;
      }

      console.log('Fetching events with token:', token);
      const response = await axios.get(`${API_ENDPOINTS.EVENTS.LIST}?page=${page}&limit=${eventsPerPage}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Events response:', response.data);
      setEvents(response.data.events);
      setTotalPages(response.data.pagination.totalPages);
      setTotalEvents(response.data.pagination.totalEvents);
    } catch (error) {
      console.error('Error fetching events:', error.response?.data || error.message);
      if (error.response?.status === 401) {
        console.log('Unauthorized, redirecting to login');
        navigate('/login');
      } else {
        setError(t('ERROR'));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(API_ENDPOINTS.BOOKINGS.MY_BOOKINGS, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('User bookings fetched:', response.data);
      setUserBookings(response.data);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleBookEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        API_ENDPOINTS.BOOKINGS.CREATE,
        { eventId },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Event booked successfully');
      fetchUserBookings();
      navigate('/congratulations');
    } catch (error) {
      console.error('Error booking event:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError(t('ERROR'));
      }
    }
  };

  const handleEditEvent = (eventId) => {
    if (user.role === 'admin') {
      navigate(`/admin/event/edit/${eventId}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm(t('ARE_YOU_SURE'))) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(API_ENDPOINTS.EVENTS.DELETE(eventId), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Event deleted successfully');
        fetchEvents(currentPage);
      } catch (error) {
        console.error('Error deleting event:', error);
        setError(t('ERROR'));
      }
    }
  };

  const handleCreateEvent = () => {
    navigate('/admin/events/create');
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showCongratulations) {
    return <Congratulations />;
  }

  if (loading) {
    return <div className="loading">{t('LOADING')}</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <div>
          <h2>{t('EVENTS')}</h2>
          <p className="welcome-message">{t('DISCOVER_EVENTS')}</p>
        </div>
        <div className="pagination-controls">
          <div className="pagination-info">
            {t('SHOWING_EVENTS', { count: events.length, total: totalEvents })}
          </div>
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
            >
              {t('FIRST')}
            </button>
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
            <button
              className="pagination-button"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              {t('LAST')}
            </button>
          </div>
        </div>
      </div>
      <div className="events-grid">
        {events.map((event) => {
          const isBooked = userBookings.some(
            (booking) => booking.eventId === event._id
          );
          return (
            <div key={event._id} className="event-card">
              {event.imageId && (
                <div className="eventimage">
                  <img 
                    src={`${API_ENDPOINTS.EVENTS.GET_IMAGE(event._id)}`} 
                    alt={event.name} 
                  />
                </div>
              )}
              <div>
                <h3>{event.name}</h3>
                <p className='event-description'>{event.description}</p>
                <div className="event-details">
                  <p>{t('EVENT_DATE')}: {new Date(event.date).toLocaleString()}</p>
                  <p>{t('EVENT_LOCATION')}: {event.location}</p>
                  <p>{t('EVENT_PRICE')}: ${event.price}</p>
                  <p>{t('EVENT_CATEGORY')}: 
                    {t(`CATEGORY_${event.category.toUpperCase()}`)}</p>
                </div>
                <div className="event-actions">
                  <button
                    className="view-button"
                    onClick={() => navigate(`/events/${event._id}`, { state: { isBooked } })}
                  >
                    {t('VIEW_DETAILS')}
                  </button>
                  {user.role === 'admin' ? (
                    <>
                      <button
                        className="edit-button"
                        onClick={() => handleEditEvent(event._id)}
                      >
                        {t('EDIT')}
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteEvent(event._id)}
                      >
                        {t('DELETE')}
                      </button>
                    </>
                  ) : (
                    <button
                      className={isBooked ? 'booked-button' : 'bookbutton'}
                      onClick={() => handleBookEvent(event._id)}
                      disabled={isBooked}
                    >
                      {isBooked ? t('BOOKED') : t('BOOK_NOW')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Events; 