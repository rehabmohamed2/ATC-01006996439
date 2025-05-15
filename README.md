# Event Booking System

A full-stack event booking system built with React, Node.js, Express, and MongoDB.

## Features

- User authentication (register, login)
- Event management (create, read, update, delete)
- Event booking system
- Admin panel for managing events
- Responsive design
- Multi-language support (English - Arabic)
- Role-based permissions
- Tags and categories for events
- Event image upload functionality
- Pagination or lazy loading
- Backend Deployment on Railway

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd event-booking-system
```

2. Install dependencies:
```bash
# Install client dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Start the development servers:
```bash
# Start server (from backend directory)
npm run server

# Start client (from root directory)
npm run client
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Events
- GET /api/events - Get all events
- GET /api/events/:id - Get single event
- POST /api/events - Create event (admin only)
- PUT /api/events/:id - Update event (admin only)
- DELETE /api/events/:id - Delete event (admin only)

### Bookings
- GET /api/bookings/my-bookings - Get user's bookings
- POST /api/bookings - Create booking

## Project Structure

```
event-booking-system/
├── src/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── pages/         # Page components
│       ├── contexts/      # React contexts
│       └── styles/        # CSS files
├── backend/                   # Backend
│   ├── config/           # Configuration files
│   ├── middleware/       # Express middleware
│   ├── models/          # Mongoose models
│   └── routes/          # API routes
├── .env                  # Environment variables
└── package.json         # Project dependencies
```
Admin account: "admin2@test.com" password: "Test@123"
User account: "rehab@gmail.com" passowrd: "Test@123"

## Backend Deployment

The backend API is deployed on [Railway](https://atc-01006996439-production.up.railway.app/api/).

In production, the base URL for the API is:

const API_BASE_URL = 'https://atc-01006996439-production.up.railway.app/api'

To run the app locally, use:

const API_BASE_URL = 'http://localhost:5000/api';

API_BASE_URL exist in src/config/api.js
