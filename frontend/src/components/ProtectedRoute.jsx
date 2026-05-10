import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  if (!token || !userStr) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if the route is restricted by role
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      // Role not authorized, redirect to dashboard or home
      alert("Unauthorized Access: You do not have permission to view this page.");
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
};

export default ProtectedRoute;
