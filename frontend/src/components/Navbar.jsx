import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CalendarDays, User, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    } else {
      setIsAuthenticated(false);
    }
  }, [location]); // Re-check on location change

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                <CalendarDays className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-display font-bold text-white tracking-tight">Eventure</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`font-medium transition-colors text-sm ${isActive('/') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              className={`font-medium transition-colors text-sm ${isActive('/events') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
            >
              Discover
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`font-medium transition-colors text-sm flex items-center space-x-1 ${isActive('/dashboard') ? 'text-primary' : 'text-gray-300 hover:text-white'}`}
                >
                  <User className="h-4 w-4" />
                  <span>{userName || 'Dashboard'}</span>
                </Link>
                <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 font-medium transition-colors text-sm flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-300 hover:text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden glass border-t border-white/5 animate-in slide-in-from-top duration-300">
          <div className="px-4 pt-2 pb-6 space-y-3">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl font-medium ${isActive('/') ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
            >
              Home
            </Link>
            <Link 
              to="/events" 
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-xl font-medium ${isActive('/events') ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
            >
              Discover Events
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-medium ${isActive('/dashboard') ? 'bg-primary/20 text-primary' : 'text-gray-300 hover:bg-white/5'}`}
                >
                  My Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl font-medium text-gray-300 hover:bg-red-500/10 hover:text-red-400"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-center rounded-xl font-medium text-gray-300 bg-white/5 border border-white/10"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="px-4 py-3 text-center rounded-xl font-bold text-black bg-white"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
