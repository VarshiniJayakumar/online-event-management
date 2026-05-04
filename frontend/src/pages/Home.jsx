import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import getApiUrl from '../utils/api';

const categories = [
  { name: 'Music', icon: '🎵', color: 'from-purple-500/20 to-purple-500/5', border: 'border-purple-500/30' },
  { name: 'Tech', icon: '💻', color: 'from-blue-500/20 to-blue-500/5', border: 'border-blue-500/30' },
  { name: 'Sports', icon: '⚽', color: 'from-green-500/20 to-green-500/5', border: 'border-green-500/30' },
  { name: 'Food', icon: '🍕', color: 'from-orange-500/20 to-orange-500/5', border: 'border-orange-500/30' },
  { name: 'Business', icon: '💼', color: 'from-pink-500/20 to-pink-500/5', border: 'border-pink-500/30' },
];

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = getApiUrl('/events');
        console.log('Home fetching from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
        const data = await response.json();
        setEvents(data.slice(0, 6)); // Show first 6 as trending
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (locationQuery) params.append('location', locationQuery);
    navigate(`/events?${params.toString()}`);
  };

  const handleCategoryClick = (categoryName) => {
    navigate(`/events?category=${categoryName}`);
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 lg:pt-40 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/20 via-secondary/10 to-transparent blur-[80px] pointer-events-none z-0"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full glass border-white/10 text-xs font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
            <span className="text-gray-300">Over 5,000 live events today</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-8">
            Find your next <br className="hidden md:block" />
            <span className="text-gradient">unforgettable</span> experience
          </h1>
          
          <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium">
            The world's most vibrant platform for discovering, creating, and experiencing the moments that matter.
          </p>

          <form onSubmit={handleSearch} className="max-w-3xl mx-auto glass rounded-2xl p-2 flex flex-col sm:flex-row shadow-2xl shadow-primary/10">
            <div className="flex-1 flex items-center px-4 py-3 border-b sm:border-b-0 sm:border-r border-white/10">
              <Search className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Search events, creators, or topics" 
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-500" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4 py-3">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-500" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <button type="submit" className="mt-2 sm:mt-0 px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0">
              Search
            </button>
          </form>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => handleCategoryClick(cat.name)}
                className={`px-5 py-2.5 rounded-full bg-gradient-to-b ${cat.color} border ${cat.border} flex items-center space-x-2 hover:-translate-y-1 transition-transform backdrop-blur-md`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium text-white">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Horizontal Scroll */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-display font-bold text-white">Trending this week</h2>
            <p className="text-gray-400 mt-2">The most anticipated events everyone is talking about.</p>
          </div>
          <Link to="/events" className="hidden sm:flex items-center text-primary font-medium hover:text-white transition-colors">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>
          ) : (
            <>
              {events.length > 0 ? (
                <div className="flex space-x-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
                  {events.map((event) => (
                    <div key={event._id} className="min-w-[320px] md:min-w-[380px] snap-start shrink-0 group">
                      <div className="glass-card overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-primary border-white/5">
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80';
                            }}
                          />
                          <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                            {event.category}
                          </div>
                          <div className="absolute top-4 right-4 bg-white text-black rounded-full px-3 py-1 text-xs font-extrabold shadow-lg">
                            {event.price === 0 ? 'FREE' : `$${event.price}`}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="text-xl font-display font-bold text-white mb-4 line-clamp-1 group-hover:text-primary transition-colors">{event.title}</h3>
                          <div className="space-y-2 mt-auto">
                            <div className="flex items-center text-gray-400 text-sm">
                              <Calendar className="h-4 w-4 mr-2 text-primary" /> {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center text-gray-400 text-sm">
                              <MapPin className="h-4 w-4 mr-2 text-primary" /> {event.location}
                            </div>
                          </div>
                          <Link to={`/events/${event._id}`} className="mt-6 w-full py-3 bg-dark-bg border border-white/10 rounded-xl text-center font-semibold text-white hover:bg-white/5 transition-colors">
                            Get Tickets
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 glass rounded-2xl border-white/5">
                  <p className="text-gray-400">No trending events available right now.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
      
      {/* Happening Today Section */}
      <section className="py-24 relative border-t border-white/5 bg-gradient-to-b from-dark-bg to-[#0d0d14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between border-primary/20 shadow-glow-primary relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full mix-blend-screen filter blur-[80px] pointer-events-none"></div>
             
             <div className="md:w-1/2 mb-8 md:mb-0 relative z-10">
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 mb-6 uppercase tracking-wider">
                 <span className="flex h-2 w-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                 Live Now
               </div>
               <h2 className="text-4xl font-display font-bold text-white mb-4">Don't miss out on what's happening today.</h2>
               <p className="text-gray-400 mb-8 text-lg">Join thousands of people connecting at live events in your city right now.</p>
               <Link to="/events" className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity inline-flex items-center shadow-lg shadow-primary/20">
                 Explore Live Events <ArrowRight className="ml-2 h-5 w-5" />
               </Link>
             </div>
             
             <div className="md:w-1/2 flex justify-center md:justify-end relative z-10">
                <div className="relative w-72 h-72">
                  <div className="absolute top-0 right-0 w-64 h-80 glass-card bg-[#1a1a24] border-white/10 rotate-6 transform translate-x-4 translate-y-4 opacity-50"></div>
                  <div className="absolute top-0 right-0 w-64 h-80 glass-card bg-[#1c1c28] border-white/10 -rotate-3 transform translate-x-2 translate-y-2 opacity-75"></div>
                  <div className="absolute top-0 right-0 w-64 h-80 glass-card border-white/20 p-4 shadow-2xl flex flex-col">
                    <img src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=400&q=80" alt="Tech" className="w-full h-36 object-cover rounded-xl mb-4" />
                    <h4 className="font-bold text-white mb-1">Developer Meetup</h4>
                    <p className="text-xs text-gray-400 mb-4 flex-1">Downtown Tech Hub • Starts in 30m</p>
                    <button className="w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-semibold transition-colors">Join Waitlist</button>
                  </div>
                </div>
             </div>
           </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
