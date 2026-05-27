import { useState } from 'react';
import { Building, Mail, Phone, Calendar, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import getApiUrl from '../utils/api';

const BecomeOrganizer = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    eventType: ''
  });
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert("Please log in first to apply.");
        navigate('/login');
        return;
      }

      // Send request to the backend
      const response = await fetch(getApiUrl('/auth/request-organizer'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: formData.businessName,
          email: formData.email,
          phone,
          eventType: formData.eventType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to submit request');
      }

      const data = await response.json();
      
      // Update local storage only if a fresh token is returned
      if (data.token) localStorage.setItem('token', data.token);
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert(err.message || 'There was an error processing your request.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-dark-bg">
        <div className="glass-card max-w-lg w-full p-10 text-center animate-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-white mb-4">Request Submitted!</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Thank you for your interest in becoming an organizer! Our team will review your application and get back to you within 24-48 hours. Once approved, your account role will be upgraded to 'organizer'.
          </p>
          <Link to="/" className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-glow-primary">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-5xl flex flex-col md:flex-row gap-12 items-center">
        {/* Left Side Info */}
        <div className="md:w-1/2 space-y-6">
          <span className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider inline-block">
            For Creators
          </span>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white leading-tight">
            Host incredible events and reach millions.
          </h1>
          <p className="text-gray-400 text-lg">
            Join our platform as an organizer to easily manage ticketing, analyze attendance, and create unforgettable experiences for your community.
          </p>
          <ul className="space-y-4 pt-4 text-gray-300 font-medium">
            <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Zero setup fees</li>
            <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Real-time analytics dashboard</li>
            <li className="flex items-center"><CheckCircle2 className="h-5 w-5 text-primary mr-3" /> Automated ticketing and QR codes</li>
          </ul>
        </div>

        {/* Right Side Form */}
        <div className="md:w-1/2 w-full">
          <div className="glass-card p-8 border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none"></div>
            
            <h3 className="text-2xl font-bold text-white mb-6">Organizer Application</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Business or Organization Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-500" />
                  </div>
                  <input required type="text" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Acme Events" 
                    value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Business Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input required type="email" className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none" placeholder="hello@acme.com" 
                    value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
                <div className="relative phone-input-container">
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    value={phone}
                    onChange={setPhone}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus-within:ring-2 focus-within:ring-primary/50 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Primary Event Type</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-500" />
                  </div>
                  <select required className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-primary/50 outline-none appearance-none"
                    value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                  >
                    <option value="" className="bg-dark-bg text-gray-500">Select type...</option>
                    <option value="tech" className="bg-dark-bg">Tech & Professional</option>
                    <option value="music" className="bg-dark-bg">Music & Concerts</option>
                    <option value="business" className="bg-dark-bg">Business & Networking</option>
                    <option value="other" className="bg-dark-bg">Other</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-glow-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : (
                  <>Submit Request <ArrowRight className="ml-2 h-5 w-5" /></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeOrganizer;
