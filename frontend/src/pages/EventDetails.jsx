import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CalendarDays, MapPin, Clock, Share2, Heart, ArrowLeft, Ticket, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import getApiUrl from '../utils/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Check if event is saved
    const savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    if (savedEvents.includes(id)) {
      setIsSaved(true);
    }
  }, [id]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(getApiUrl(`/events/${id}`));
        if (!response.ok) throw new Error('Event not found');
        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    setCheckoutLoading(true);

    try {
      let registrationData = {
        eventId: id,
        ticketType: 'General Admission',
        quantity: ticketCount,
        totalAmount: (event.price || 0) * ticketCount
      };

      // Handle Free Events
      if (event.price === 0) {
        const response = await fetch(getApiUrl('/registrations'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(registrationData),
        });

        if (!response.ok) throw new Error('Registration failed');
        
        setRegistrationSuccess(true);
        setCheckoutLoading(false);
        return;
      }

      // Handle Paid Events
      const response = await fetch(getApiUrl('/payment/create-checkout-session'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ eventId: id, ticketQuantity: ticketCount }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Payment failed');
      }

      // Handle Demo Mode
      if (data.isDemo) {
        // In demo mode, we manually create the registration since Stripe won't redirect back to a success URL
        const regResponse = await fetch(getApiUrl('/registrations'), {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            ...registrationData,
            stripeSessionId: data.id
          }),
        });

        if (!regResponse.ok) throw new Error('Registration failed');

        setTimeout(() => {
          setRegistrationSuccess(true);
          setCheckoutLoading(false);
        }, 1500);
        return;
      }

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({
        sessionId: data.id,
      });

      if (error) throw error;
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  );

  if (error || !event) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Oops!</h2>
        <p className="text-gray-400 mb-6">{error || 'Event not found'}</p>
        <Link to="/events" className="text-primary hover:underline flex items-center justify-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to events
        </Link>
      </div>
    </div>
  );

  const totalPrice = (event.price || 0) * ticketCount;
  const isPastEvent = new Date(event.date) < new Date();
  const availableTickets = event.tickets && event.tickets.length > 0 ? Math.max(0, event.tickets[0].quantity - event.tickets[0].sold) : null;

  const handleSave = () => {
    let savedEvents = JSON.parse(localStorage.getItem('savedEvents') || '[]');
    if (isSaved) {
      savedEvents = savedEvents.filter(eventId => eventId !== id);
      setIsSaved(false);
    } else {
      savedEvents.push(id);
      setIsSaved(true);
    }
    localStorage.setItem('savedEvents', JSON.stringify(savedEvents));
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="pb-20">
      {/* Hero Section */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={event.imageUrl ? (event.imageUrl.includes('unsplash.com') ? `${event.imageUrl.split('?')[0]}?w=1200&q=80` : event.imageUrl) : 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80'} 
            alt={event.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              if (e.target.src !== 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80') {
                e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&q=80';
              }
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-10">
          <div className="max-w-7xl mx-auto">
            <Link to="/events" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors font-medium">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
            </Link>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="glass rounded-full px-4 py-1 text-sm font-bold text-white backdrop-blur-md border-primary/30">
                {event.category}
              </span>
              <span className="flex items-center text-white/80 text-sm glass px-3 py-1 rounded-full">
                <Clock className="h-4 w-4 mr-2 text-primary" /> {event.time || 'All Day'}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="flex items-center text-white/90">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mr-4 border-white/10">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Date</p>
                  <p className="text-lg font-semibold">{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center text-white/90">
                <div className="w-12 h-12 rounded-xl glass flex items-center justify-center mr-4 border-white/10">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Location</p>
                  <p className="text-lg font-semibold">{event.location}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => document.getElementById('event-content').scrollIntoView({ behavior: 'smooth' })}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center group"
              >
                Explore Details
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="hidden md:flex flex-col items-center ml-8 animate-bounce opacity-50">
                <span className="text-[10px] uppercase tracking-widest font-bold mb-2">Scroll</span>
                <div className="w-1 h-8 bg-gradient-to-b from-primary to-transparent rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="event-content" className="max-w-7xl mx-auto px-4 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="flex border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-2 mr-8 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'overview' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
              >
                Overview
                {activeTab === 'overview' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
              </button>
              <button 
                onClick={() => setActiveTab('location')}
                className={`pb-4 px-2 text-sm font-bold tracking-wider uppercase transition-colors relative ${activeTab === 'location' ? 'text-primary' : 'text-gray-500 hover:text-white'}`}
              >
                Location
                {activeTab === 'location' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
              </button>
            </div>

            {activeTab === 'overview' ? (
              <div className="space-y-12">
                <section>
                  <h2 className="text-2xl font-display font-bold text-white mb-6">About this event</h2>
                  <div className="prose prose-invert max-w-none text-gray-400 text-lg leading-relaxed">
                    <p>{event.description}</p>
                  </div>
                </section>

                <section className="glass rounded-3xl p-8 border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-xl shadow-glow-primary">
                      {event.organizer?.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Organized by</p>
                      <p className="text-xl font-bold text-white">{event.organizer?.name || 'Eventure Admin'}</p>
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                 <h2 className="text-2xl font-display font-bold text-white mb-6">Venue Information</h2>
                 <div className="glass rounded-3xl p-8 border-white/5 flex items-start space-x-6">
                    <div className="w-12 h-12 rounded-xl glass flex items-center justify-center shrink-0 border-white/10">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-2">{event.location}</h4>
                      <p className="text-gray-400">Detailed location information and parking details will be sent with your tickets.</p>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 border-white/10 sticky top-32 shadow-2xl overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
              
              {registrationSuccess ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/30">
                    <CheckCircle2 className="h-10 w-10 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-gray-400 mb-8">Your tickets have been sent to your email. See you there!</p>
                  <Link to="/dashboard" className="block w-full py-4 bg-white text-black font-bold rounded-xl text-center hover:bg-gray-200 transition-colors">
                    View My Tickets
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Price</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-display font-bold text-white">{event.price === 0 ? 'FREE' : `$${event.price}`}</span>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-bold text-gray-300">Number of Attendees</label>
                        {availableTickets !== null && (
                          <span className="text-xs font-bold bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">
                            {availableTickets} tickets left
                          </span>
                        )}
                      </div>
                      <div className="flex items-center glass rounded-xl border-white/10 p-1">
                        <button 
                          onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                          disabled={isPastEvent || availableTickets === 0}
                          className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors text-xl disabled:opacity-50"
                        >-</button>
                        <div className="flex-1 text-center font-bold text-white text-lg">{ticketCount}</div>
                        <button 
                          onClick={() => setTicketCount(availableTickets !== null ? Math.min(availableTickets, ticketCount + 1) : ticketCount + 1)}
                          disabled={isPastEvent || availableTickets === 0 || (availableTickets !== null && ticketCount >= availableTickets)}
                          className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-lg transition-colors text-xl disabled:opacity-50"
                        >+</button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/10 mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-400 font-medium">Total</span>
                      <span className="text-2xl font-bold text-white">
                        {event.price === 0 ? 'FREE' : `$${totalPrice}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading || isPastEvent || availableTickets === 0}
                    className="w-full py-5 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-glow-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        <Ticket className="mr-3 h-6 w-6" /> 
                        {isPastEvent ? 'Event Completed' : (availableTickets === 0 ? 'Sold Out' : (event.price === 0 ? 'Register Now' : 'Get Tickets'))}
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-500 mt-6 font-medium">
                    {event.price === 0 ? 'Instant confirmation via email' : 'Secure checkout powered by Stripe'}
                  </p>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-center space-x-6">
              <button onClick={handleShare} className="flex items-center text-gray-400 hover:text-white transition-colors text-sm font-medium">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </button>
              <button onClick={handleSave} className={`flex items-center transition-colors text-sm font-medium ${isSaved ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'}`}>
                <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-pink-500' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
