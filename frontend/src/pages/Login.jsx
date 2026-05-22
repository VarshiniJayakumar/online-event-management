import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import getApiUrl from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const handleGoogleLoginResponse = async (response) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(getApiUrl('/auth/google-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Google Login failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(from);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1081512411986-e2a229q6a603952f.apps.googleusercontent.com',
          callback: handleGoogleLoginResponse
        });
        window.google.accounts.id.renderButton(
          document.getElementById("google-signin-btn"),
          { theme: "dark", size: "large", type: "standard", shape: "rectangular", text: "signin_with", logo_alignment: "left", width: 380 }
        );
      }
    };
    
    if (window.google) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          initGoogle();
          clearInterval(interval);
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save token and user data
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      console.log(`Login successful, navigating to ${from}...`);
      navigate(from);
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/20 via-transparent to-transparent blur-[60px] pointer-events-none z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -30 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card max-w-md w-full p-8 md:p-10 border-white/10 shadow-2xl relative z-10"
      >
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              state={{ from }}
              className="text-primary hover:text-white transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center flex flex-col items-center gap-3">
            <span>{error}</span>
            {error.includes('verify your email') && (
              <button 
                onClick={async () => {
                  try {
                    const res = await fetch(getApiUrl('/auth/resend-verification'), {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: formData.email }),
                    });
                    const data = await res.json();
                    alert(data.message);
                  } catch (err) {
                    alert('Failed to resend email');
                  }
                }}
                className="text-primary hover:underline font-bold"
              >
                Resend Verification Email
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" type="checkbox" className="h-4 w-4 bg-[#1a1a24] border-white/20 rounded text-primary focus:ring-primary" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-white transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in to Eventure'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#12121a] px-3 text-gray-500 font-bold tracking-widest">Or continue with</span>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <div id="google-signin-btn" className="w-full overflow-hidden rounded-xl flex justify-center"></div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
