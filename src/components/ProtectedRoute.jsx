import { Navigate } from 'react-router-dom';

function ProtectedRoute({ user, children }) {
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
}

export default ProtectedRoute; 