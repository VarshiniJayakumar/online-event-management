import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import getApiUrl from '../utils/api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await fetch(getApiUrl(`/auth/verify/${token}`));
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Connection error. Please try again.');
      }
    };

    if (token) {
      verifyToken();
    }
  }, [token]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12">
      <div className="glass-card max-w-md w-full p-10 text-center animate-in zoom-in duration-500">
        
        {status === 'verifying' && (
          <>
            <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold text-white mb-2">Verifying Email...</h2>
            <p className="text-gray-400">Please wait while we confirm your account.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-500/30">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-display font-bold text-white mb-4">Email Verified!</h2>
            <p className="text-gray-400 mb-8">{message || 'Your account is now active and ready to use.'}</p>
            <Link to="/login" className="block w-full py-4 bg-primary text-white font-bold rounded-xl shadow-glow-primary hover:opacity-90 transition-all">
              Login to Dashboard
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-500/30">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">Verification Failed</h2>
            <p className="text-gray-400 mb-8">{message || 'The verification link is invalid or has expired.'}</p>
            <Link to="/register" className="block w-full py-4 border border-white/10 text-white font-bold rounded-xl hover:bg-white/5 transition-all">
              Try Registering Again
            </Link>
          </>
        )}

      </div>
    </div>
  );
};

export default VerifyEmail;
