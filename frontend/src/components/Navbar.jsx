import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  // Check auth status on mount and when local storage might change
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      setIsAuthenticated(true);
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name);
      } catch(e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b-0 border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">Eventure</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6 md:space-x-8">
            <Link to="/events" className="text-gray-300 hover:text-white font-medium transition-colors text-sm">Discover</Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white font-medium transition-colors text-sm flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{userName || 'Dashboard'}</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 font-medium transition-colors text-sm flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-300 hover:text-white font-medium transition-colors text-sm">Log in</Link>
                <Link to="/register" className="bg-white text-black px-5 py-2.5 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
