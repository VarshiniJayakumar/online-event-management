import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Loader2, Music, Laptop, Trophy, Utensils, Briefcase, Palette, HeartPulse, Navigation, Sparkles, ChevronDown } from 'lucide-react';
import getApiUrl from '../utils/api';
import { CardSkeleton } from '../components/Skeleton';

const categories = [
  { name: 'Music', icon: <Music />, color: 'from-[#8A2BE2] to-[#4B0082]', description: 'Live concerts, festivals & raves' },
  { name: 'Tech', icon: <Laptop />, color: 'from-[#00CED1] to-[#00008B]', description: 'Workshops, hackathons & talks' },
  { name: 'Sports', icon: <Trophy />, color: 'from-[#32CD32] to-[#006400]', description: 'Matches, tournaments & fitness' },
  { name: 'Food', icon: <Utensils />, color: 'from-[#FF4500] to-[#8B0000]', description: 'Tastings, brunches & culinary' },
  { name: 'Business', icon: <Briefcase />, color: 'from-[#FFD700] to-[#DAA520]', description: 'Networking, summits & expos' },
  { name: 'Art', icon: <Palette />, color: 'from-[#FF1493] to-[#8B008B]', description: 'Galleries, theatre & workshops' },
  { name: 'Wellness', icon: <HeartPulse />, color: 'from-[#40E0D0] to-[#20B2AA]', description: 'Yoga, meditation & retreats' },
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
        setEvents(data);
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

  const getEventsByCategory = (category) => {
    return events.filter(e => e.category === category).slice(0, 4);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section - Compact Search Engine */}
      <section className="relative min-h-[60vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">

        <div className="relative z-10 max-w-5xl mx-auto px-4 w-full text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full glass border-white/5 text-[10px] md:text-xs font-medium mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="h-3 w-3 text-primary mr-2 fill-primary/20" />
            <span className="text-gray-300 uppercase tracking-widest">Event Discovery Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold tracking-tight mb-12 leading-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Find your next <span className="text-shimmer">unforgettable</span> experience
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto glass rounded-[2rem] p-1.5 flex flex-col md:flex-row shadow-2xl shadow-black/40 border-white/10 animate-in fade-in zoom-in duration-700 delay-300">
            <div className="flex-[1.2] flex items-center px-5 py-3 border-b md:border-b-0 md:border-r border-white/5">
              <Search className="h-5 w-5 text-primary mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Find events..." 
                className="w-full bg-transparent border-none focus:outline-none text-white text-base placeholder-gray-500" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-5 py-3 relative group/loc">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
              <input 
                type="text" 
                placeholder="Where?" 
                className="w-full bg-transparent border-none focus:outline-none text-white text-base placeholder-gray-500 pr-10" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="absolute right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors text-primary disabled:opacity-50"
              >
                {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
              </button>
            </div>
            <button type="submit" className="md:ml-1 px-8 py-3.5 bg-white text-black font-bold text-base rounded-[1.5rem] hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center shrink-0 shadow-lg active:scale-95">
              Search
            </button>
          </form>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-40">
            <ChevronDown className="h-4 w-4 text-primary" />
          </div>
        </div>
      </section>

      {/* Category Discovery - Compact Grid */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-2">Browse by Interest</h2>
            <p className="text-gray-400 text-sm md:text-base">Find your next adventure by category</p>
          </div>

          <div className="flex overflow-x-auto pb-6 hide-scrollbar gap-4 snap-x">
            {categories.map((cat, idx) => (
              <button 
                key={idx} 
                onClick={() => navigate(`/events?category=${cat.name}`)}
                className="group relative min-w-[130px] md:min-w-[180px] aspect-square rounded-[2rem] overflow-hidden snap-start flex flex-col p-5 transition-all duration-500 hover:scale-[1.05] active:scale-95"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-80 group-hover:opacity-100 transition-opacity duration-500 shimmer-bg`}></div>
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                
                <div className="relative z-10 w-10 h-10 md:w-12 md:h-12 rounded-xl glass flex items-center justify-center mb-auto text-white text-xl md:text-2xl shadow-lg group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-base md:text-xl font-display font-bold text-white tracking-tight">{cat.name}</h3>
                  <div className="w-6 h-1 bg-white/30 rounded-full mt-2 group-hover:w-10 group-hover:bg-white transition-all"></div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Dynamic Category Sections - "The Next Pages" */}
      {['Music', 'Tech', 'Sports'].map((catName) => {
        const catEvents = getEventsByCategory(catName);
        const catInfo = categories.find(c => c.name === catName);
        if (catEvents.length === 0 && !loading) return null;

        return (
          <section key={catName} className="py-24 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-end justify-between mb-12">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${catInfo?.color} text-white`}>
                      {catInfo?.icon}
                    </div>
                    <span className="text-primary font-bold uppercase tracking-widest text-sm">{catName} Spotlight</span>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white">Featured in {catName}</h2>
                </div>
                <Link to={`/events?category=${catName}`} className="flex items-center text-gray-400 font-medium hover:text-white transition-colors group">
                  See all {catName} <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {catEvents.map((event) => (
                    <Link to={`/events/${event._id}`} key={event._id} className="group">
                      <div className="elegant-card h-full flex flex-col glass-shine shimmer-bg">
                        <div className={`elegant-card-hover-glow bg-gradient-to-br ${catInfo?.color}`}></div>
                        
                        <div className="elegant-card-image-wrap !aspect-video">
                          <img 
                            src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75'} 
                            alt={event.title} 
                            loading="lazy"
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          />
                          <div className="absolute top-3 right-3 bg-white/90 text-black rounded-full px-3 py-1 text-[9px] font-black shadow-xl backdrop-blur-sm border border-white/20">
                            {event.price === 0 ? 'FREE' : `$${event.price}`}
                          </div>
                        </div>

                        <div className="p-5 pt-2 flex flex-col flex-1 relative z-10">
                          <h3 className="text-lg font-display font-bold text-white mb-3 line-clamp-1 group-hover:text-primary transition-colors leading-tight tracking-tight">{event.title}</h3>
                          
                          <div className="space-y-2 mt-auto text-white/40">
                            <div className="flex items-center text-[10px] font-medium tracking-wide"><Calendar className="h-3.5 w-3.5 mr-2 text-primary/70" /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</div>
                            <div className="flex items-center text-[10px] font-medium tracking-wide"><MapPin className="h-3.5 w-3.5 mr-2 text-primary/70" /> {event.location}</div>
                          </div>

                          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between group/btn">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] group-hover/btn:text-primary transition-colors">Details</span>
                            <Sparkles className="h-3.5 w-3.5 text-white/20 group-hover/btn:text-primary transition-all" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* Footer CTA */}
      <section className="py-32 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-primary/5 z-0"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-8">Ready to explore more?</h2>
          <p className="text-gray-400 text-xl mb-12">Join thousands of people discovering unforgettable experiences every day.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/events" className="w-full sm:w-auto px-12 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl">
              Browse All Events
            </Link>
            <Link to="/register" className="w-full sm:w-auto px-12 py-5 glass text-white font-black text-lg rounded-2xl hover:bg-white/5 transition-all">
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
