import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { CalendarDays, MapPin, Clock, Share2, Heart, ArrowLeft, Ticket, Loader2 } from 'lucide-react';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ticketCount, setTicketCount] = useState(1);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/events/${id}`);
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
    setCheckoutLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: id, ticketQuantity: ticketCount }),
      });
      const session = await response.json();
      if (session.error) {
        alert(session.error); setCheckoutLoading(false); return;
      }
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <p className="text-red-400 text-xl mb-4">{error}</p>
      <Link to="/events" className="text-primary hover:underline flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Explore
      </Link>
    </div>
  );

  return (
    <div className="pb-24">
      {/* Full width hero image with gradient overlay */}
      <div className="relative h-[60vh] lg:h-[70vh] w-full">
        <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=2000&q=80'} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-dark-bg/80 via-transparent to-transparent"></div>
        
        <div className="absolute top-8 left-4 md:left-8 z-20">
          <Link to="/events" className="inline-flex items-center text-white/80 hover:text-white bg-black/20 backdrop-blur-md px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-black/40">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
          </Link>
        </div>

        {/* Hero Content positioned at bottom */}
        <div className="absolute bottom-0 w-full z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <div className="flex flex-wrap gap-3 mb-6">
              <span className="glass px-3 py-1 rounded-full text-xs font-bold text-white border-white/10 uppercase tracking-wider">
                {event.category}
              </span>
              <span className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-full text-xs font-bold text-red-400 flex items-center">
                <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                Coming Soon
              </span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 leading-tight max-w-4xl">
              {event.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-300">
              <div className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">{new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-primary" />
                <span className="font-medium">{event.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content Area */}
          <div className="lg:w-2/3">
            
            {/* Tab Navigation */}
            <div className="flex space-x-8 border-b border-white/10 mb-8 overflow-x-auto hide-scrollbar">
              {['overview', 'location'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-sm font-semibold capitalize whitespace-nowrap transition-colors relative ${activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full shadow-[0_-2px_10px_rgba(124,58,237,0.5)]"></div>
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-display font-bold text-white mb-4">About this event</h2>
                  <div className="prose prose-invert prose-p:text-gray-400 prose-p:leading-relaxed max-w-none">
                    <p className="whitespace-pre-line text-gray-400 leading-relaxed">{event.description}</p>
                  </div>
                  
                  <div className="mt-12 glass rounded-2xl p-6 border-white/5 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/40 to-secondary/40 flex items-center justify-center font-bold text-xl">
                        {event.organizer?.name?.charAt(0) || 'O'}
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Organized by</p>
                        <p className="text-white font-bold">{event.organizer?.name || 'Authorized Organizer'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-display font-bold text-white mb-6">Location</h2>
                  <div className="glass rounded-2xl p-2 border-white/5">
                    <div className="w-full h-64 bg-[#1a1a24] rounded-xl flex items-center justify-center text-gray-500 border border-white/5 relative overflow-hidden">
                       <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
                       <MapPin className="h-8 w-8 text-gray-600 mb-2" />
                       <span className="font-medium absolute bottom-4">Venue: {event.location}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Sidebar Checkout */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 glass-card p-6 border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full mix-blend-screen filter blur-[40px] pointer-events-none"></div>
              
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Price</p>
                  <div className="text-4xl font-display font-bold text-white">
                    ${event.price}
                  </div>
                </div>
              </div>

              <div className="mb-6 bg-[#1a1a24] rounded-xl border border-white/5 p-4">
                <div className="flex justify-between items-center">
                  <span className="text-white font-medium">Quantity</span>
                  <div className="flex items-center glass rounded-lg overflow-hidden border-white/10">
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    >-</button>
                    <span className="w-10 text-center font-bold text-white">{ticketCount}</span>
                    <button 
                      className="w-10 h-10 flex items-center justify-center text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                      onClick={() => setTicketCount(ticketCount + 1)}
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
                <span className="text-gray-400 font-medium">Total</span>
                <span className="text-2xl font-bold text-white">${event.price * ticketCount}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="w-full py-4 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity flex justify-center items-center shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50"
              >
                {checkoutLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Ticket className="h-5 w-5 mr-2" /> Get Tickets
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
