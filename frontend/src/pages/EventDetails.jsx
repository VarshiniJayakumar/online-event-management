import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CalendarDays, MapPin, Clock, Share2, Heart, ArrowLeft, Ticket, Loader2, CheckCircle2, ArrowRight, CreditCard, Shield, X } from 'lucide-react';
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
  const [paymentModalData, setPaymentModalData] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiId, setUpiId] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvc: '',
    name: ''
  });

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
        // Show simulated payment gateway modal
        setPaymentModalData({
          token,
          registrationData: {
            ...registrationData,
            stripeSessionId: data.id
          }
        });
        setCheckoutLoading(false);
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

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing', err);
    }
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
                  {availableTickets !== null && availableTickets <= 20 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 font-bold px-4 py-2 rounded-xl text-center text-sm mb-6 animate-pulse">
                      Hurry! Only {availableTickets} tickets left!
                    </div>
                  )}
                  {availableTickets !== null && availableTickets > 20 && (
                    <div className="bg-primary/10 border border-primary/20 text-primary font-bold px-4 py-2 rounded-xl text-center text-sm mb-6">
                      {availableTickets} tickets available
                    </div>
                  )}

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

      {/* Fake Payment Modal for Demo Mode */}
      {paymentModalData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-md p-0 overflow-hidden shadow-[0_0_50px_rgba(124,58,237,0.3)] border-white/10 relative">
            {/* Header */}
            <div className="bg-white/5 p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center">
                <CreditCard className="mr-3 h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-white">Payment Method</h3>
              </div>
              <div className="flex space-x-2">
                <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white/50 border border-white/10">VISA</div>
                <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center text-[8px] font-bold text-white/50 border border-white/10">MC</div>
              </div>
            </div>

            <div className="p-4 bg-white/5 border-b border-white/10 flex">
              <button 
                onClick={() => setPaymentMethod('card')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'card' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Card
              </button>
              <button 
                onClick={() => setPaymentMethod('upi')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${paymentMethod === 'upi' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white'}`}
              >
                UPI / QR
              </button>
            </div>

            <div className="p-8">
              {paymentMethod === 'card' ? (
                <>
                  {/* Card Visual */}
                  <div className="relative h-44 w-full bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 mb-8 shadow-xl overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-10 h-8 bg-yellow-400/80 rounded-md shadow-inner"></div>
                      <div className="text-white/30 italic font-bold">Eventure Pay</div>
                    </div>
                    <div className="text-xl text-white font-mono tracking-[0.2em] mb-4">
                      {cardDetails.number || '**** **** **** ****'}
                    </div>
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest mb-1">Card Holder</p>
                        <p className="text-sm text-white font-medium uppercase">{cardDetails.name || 'YOUR NAME'}</p>
                      </div>
                      <div>
                        <p className="text-[8px] text-white/50 uppercase tracking-widest mb-1">Expires</p>
                        <p className="text-sm text-white font-medium">{cardDetails.expiry || 'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Card Number</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Card Number" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" 
                          value={cardDetails.number}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                            let formatted = val.match(/.{1,4}/g)?.join(' ') || '';
                            if (formatted.length <= 19) setCardDetails({...cardDetails, number: formatted});
                          }}
                        />
                        {cardDetails.number.length >= 19 && <CheckCircle2 className="absolute right-4 top-3 h-5 w-5 text-green-500" />}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Cardholder Name</label>
                      <input 
                        type="text" 
                        placeholder="Cardholder Name" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50" 
                        value={cardDetails.name}
                        onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Expiry Date</label>
                        <input 
                          type="text" 
                          placeholder="MM/YY" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" 
                          value={cardDetails.expiry}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
                            if (val.length >= 2) val = val.substring(0, 2) + '/' + val.substring(2, 4);
                            if (val.length <= 5) setCardDetails({...cardDetails, expiry: val});
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">CVC</label>
                        <input 
                          type="password" 
                          placeholder="123" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" 
                          value={cardDetails.cvc}
                          onChange={(e) => {
                            let val = e.target.value.replace(/[^0-9]/gi, '');
                            if (val.length <= 3) setCardDetails({...cardDetails, cvc: val});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-8 py-4">
                  <div className="flex justify-around items-center gap-4">
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-primary transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_Logo.svg" alt="GPay" className="w-10" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">GPay</span>
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-primary transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="w-10" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">Paytm</span>
                    </div>
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-lg border-2 border-transparent group-hover:border-primary transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/PhonePe_Logo.svg" alt="PhonePe" className="w-10" />
                      </div>
                      <span className="text-[10px] text-gray-500 mt-2 font-bold uppercase tracking-widest">PhonePe</span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-[#1a1a24] px-4 text-gray-500 font-bold tracking-widest">Or enter UPI ID</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">VPA / UPI ID</label>
                    <input 
                      type="text" 
                      placeholder="username@bank" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                    <p className="text-[10px] text-gray-500 mt-2">Example: 9876543210@paytm</p>
                  </div>
                </div>
              )}

              <button 
                onClick={async () => {
                  if (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || !cardDetails.cvc)) {
                    alert('Please fill in all payment details');
                    return;
                  }
                  if (paymentMethod === 'upi' && !upiId) {
                    alert('Please enter your UPI ID');
                    return;
                  }
                  setProcessingPayment(true);
                  try {
                    const regResponse = await fetch(getApiUrl('/registrations'), {
                      method: 'POST',
                      headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${paymentModalData.token}`
                      },
                      body: JSON.stringify(paymentModalData.registrationData),
                    });

                    if (!regResponse.ok) throw new Error('Registration failed');
                    
                    setTimeout(() => {
                      setRegistrationSuccess(true);
                      setPaymentModalData(null);
                      setProcessingPayment(false);
                    }, 2000);
                  } catch(e) {
                    alert('Payment failed');
                    setProcessingPayment(false);
                  }
                }}
                disabled={processingPayment || (paymentMethod === 'card' && (!cardDetails.number || !cardDetails.name || !cardDetails.expiry || cardDetails.cvc.length < 3)) || (paymentMethod === 'upi' && upiId.length < 3)}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center shadow-glow-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingPayment ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin mr-3" /> 
                    {paymentMethod === 'card' ? 'Verifying with bank...' : 'Requesting from app...'}
                  </>
                ) : (
                  `Confirm & Pay $${totalPrice}`
                )}
              </button>

              <div className="mt-6 flex items-center justify-center space-x-6 opacity-40">
                <div className="text-[10px] text-white flex items-center">
                  <Shield className="h-3 w-3 mr-1" /> Secure SSL
                </div>
                <div className="text-[10px] text-white flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> PCI DSS
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setPaymentModalData(null)}
              disabled={processingPayment}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors disabled:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
