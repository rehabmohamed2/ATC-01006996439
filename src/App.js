import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import Events from './components/Events';
import AdminPanel from './components/AdminPanel';
import AddEvent from './components/AddEvent';
import EditEvent from './components/EditEvent';
import EventDetails from './components/EventDetails';
import Congratulations from './components/Congratulations';
import './App.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/events"
              element={
                <ProtectedRoute>
                  <Events />
                </ProtectedRoute>
              }
            />
            <Route
              path="/events/:id"
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminPanel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/event/add"
              element={
                <ProtectedRoute adminOnly>
                  <AddEvent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/event/edit/:eventId"
              element={
                <ProtectedRoute adminOnly>
                  <EditEvent />
                </ProtectedRoute>
              }
            />

            <Route
              path="/congratulations"
              element={
                <ProtectedRoute>
                  <Congratulations />
                </ProtectedRoute>
              }
            />
    
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
