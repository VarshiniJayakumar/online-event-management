import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Music, Laptop, Trophy, Utensils, Briefcase, Palette, HeartPulse, Navigation } from 'lucide-react';
import getApiUrl from '../utils/api';
import { CardSkeleton } from '../components/Skeleton';

const categories = [
  { name: 'Music', icon: <Music className="h-12 w-12" />, color: 'from-purple-600 to-purple-900', border: 'border-purple-500/30' },
  { name: 'Tech', icon: <Laptop className="h-12 w-12" />, color: 'from-blue-600 to-blue-900', border: 'border-blue-500/30' },
  { name: 'Sports', icon: <Trophy className="h-12 w-12" />, color: 'from-green-600 to-green-900', border: 'border-green-500/30' },
  { name: 'Food', icon: <Utensils className="h-12 w-12" />, color: 'from-orange-600 to-orange-900', border: 'border-orange-500/30' },
  { name: 'Business', icon: <Briefcase className="h-12 w-12" />, color: 'from-pink-600 to-pink-900', border: 'border-pink-500/30' },
  { name: 'Art', icon: <Palette className="h-12 w-12" />, color: 'from-indigo-600 to-indigo-900', border: 'border-indigo-500/30' },
  { name: 'Wellness', icon: <HeartPulse className="h-12 w-12" />, color: 'from-teal-600 to-teal-900', border: 'border-teal-500/30' },
];

const Home = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const url = getApiUrl('/events');
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from ${url}`);
        const data = await response.json();
        setEvents(data.slice(0, 6));
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

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        
        // Try to get city, town, or village
        const city = data.address.city || data.address.town || data.address.village || data.address.state || '';
        if (city) {
          setLocationQuery(city);
        } else {
          alert('Could not determine your city name. Please enter it manually.');
        }
      } catch (err) {
        console.error('Error getting location:', err);
        alert('Failed to get your location. Please check your permissions.');
      } finally {
        setLocating(false);
      }
    }, (error) => {
      console.error('Geolocation error:', error);
      alert('Location access denied or unavailable.');
      setLocating(false);
    });
  };

  const getCategoryData = (name) => {
    return categories.find(c => c.name === name) || categories[1]; // Default to tech
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
            <span className="text-gray-300">Discover handpicked events</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tight mb-6 md:mb-8 leading-[1.1]">
            Find your next <br className="hidden sm:block" />
            <span className="text-gradient">unforgettable</span> experience
          </h1>
          
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
            <div className="flex-1 flex items-center px-4 py-3 relative group/loc">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Location" 
                className="w-full bg-transparent border-none focus:outline-none text-white placeholder-gray-500 pr-10" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="absolute right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-primary disabled:opacity-50"
                title="Use my current location"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </button>
            </div>
            <button type="submit" className="mt-2 sm:mt-0 px-8 py-3.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0">
              Search
            </button>
          </form>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate(`/events?category=${cat.name}`)}
                className={`px-5 py-2.5 rounded-full bg-gradient-to-b ${cat.color.replace('from-', 'from-').replace('to-', 'to-')} border border-white/10 flex items-center space-x-2 hover:-translate-y-1 transition-transform backdrop-blur-md opacity-80 hover:opacity-100`}
              >
                <span className="text-white font-medium">{cat.name}</span>
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
          </div>
          <Link to="/events" className="hidden sm:flex items-center text-primary font-medium hover:text-white transition-colors">
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex space-x-6 overflow-x-auto pb-8 hide-scrollbar">
              {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="flex space-x-6 overflow-x-auto pb-8 hide-scrollbar snap-x">
              {events.map((event) => {
                const cat = getCategoryData(event.category);
                return (
                  <div key={event._id} className="min-w-[320px] md:min-w-[380px] snap-start shrink-0 group">
                    <div className="glass-card overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-primary border-white/5">
                      <div className={`relative h-56 overflow-hidden bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                        {/* CSS Icon Fallback (underneath) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                           {cat.icon}
                        </div>
                        {/* Actual Image */}
                        <img 
                          src={event.imageUrl ? (event.imageUrl.includes('unsplash.com') ? `${event.imageUrl.split('?')[0]}?w=600&q=75` : event.imageUrl) : 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75'} 
                          alt={event.title} 
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          onError={(e) => { 
                            if (e.target.src !== 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75') {
                              e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75';
                            } else {
                              e.target.style.display = 'none';
                            }
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
                        <div className="space-y-2 mt-auto text-gray-400 text-sm">
                          <div className="flex items-center"><Calendar className="h-4 w-4 mr-2 text-primary" /> {new Date(event.date).toLocaleDateString()}</div>
                          <div className="flex items-center"><MapPin className="h-4 w-4 mr-2 text-primary" /> {event.location}</div>
                        </div>
                        <Link to={`/events/${event._id}`} className="mt-6 w-full py-3 bg-dark-bg border border-white/10 rounded-xl text-center font-semibold text-white hover:bg-white/5 transition-colors">
                          Get Tickets
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
