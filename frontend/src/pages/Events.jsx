import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Loader2, Music, Laptop, Trophy, Utensils, Briefcase, Palette, HeartPulse, Navigation, Sparkles, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import getApiUrl from '../utils/api';
import { CardSkeleton } from '../components/Skeleton';

const categoryConfig = {
  'Music': { icon: <Music />, color: 'from-[#8A2BE2] to-[#4B0082]', description: 'Experience the rhythm of live performances' },
  'Tech': { icon: <Laptop />, color: 'from-[#00CED1] to-[#00008B]', description: 'Innovate and learn from industry leaders' },
  'Sports': { icon: <Trophy />, color: 'from-[#32CD32] to-[#006400]', description: 'Feel the adrenaline of competition' },
  'Food': { icon: <Utensils />, color: 'from-[#FF4500] to-[#8B0000]', description: 'Savor flavors from around the world' },
  'Business': { icon: <Briefcase />, color: 'from-[#FFD700] to-[#DAA520]', description: 'Network and grow your professional reach' },
  'Art': { icon: <Palette />, color: 'from-[#FF1493] to-[#8B008B]', description: 'Express yourself through creative arts' },
  'Wellness': { icon: <HeartPulse />, color: 'from-[#40E0D0] to-[#20B2AA]', description: 'Rejuvenate your body and mind' },
  'Default': { icon: <Sparkles />, color: 'from-[#1a1a24] to-[#000000]', description: 'Discover extraordinary experiences' }
};

const Events = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category') || '');
  const [locationFilter, setLocationFilter] = useState(queryParams.get('location') || '');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearchTerm(queryParams.get('search') || '');
    setCategoryFilter(queryParams.get('category') || '');
    setLocationFilter(queryParams.get('location') || '');
  }, [location.search]);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        if (searchTerm) query.append('search', searchTerm);
        if (categoryFilter) query.append('category', categoryFilter);
        if (locationFilter) query.append('location', locationFilter);

        const url = getApiUrl(`/events?${query.toString()}`);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch events`);
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    const debounceTimer = setTimeout(fetchEvents, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, categoryFilter, locationFilter]);

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
          setLocationFilter(city);
        } else {
          alert('Could not determine your city name. Please enter it manually.');
        }
      } catch (err) {
        console.error('Error getting location:', err);
      } finally {
        setLocating(false);
      }
    }, (error) => {
      setLocating(false);
    });
  };

  const currentCat = categoryConfig[categoryFilter] || categoryConfig['Default'];

  return (
    <div className="py-8 md:py-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Dynamic Category Header - Glassmorphic Minimal */}
        <div className={`relative py-8 md:py-10 px-6 rounded-[2rem] overflow-hidden mb-10 transition-all duration-700 animate-in fade-in zoom-in-95 glass border-white/10 shadow-2xl`}>
            {/* Subtle Color Tint Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${currentCat.color} opacity-20`}></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
            
            <div className="relative z-10 text-center">
                <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${currentCat.color} mb-3 text-white text-xl shadow-lg shadow-black/20`}>
                    {currentCat.icon}
                </div>
                <h1 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 tracking-tight drop-shadow-md">
                    {categoryFilter || 'All Events'}
                </h1>
                <p className="text-white/70 text-xs md:text-base max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm">
                    {currentCat.description}
                </p>
            </div>
        </div>

        {/* Search & Filter Bar - Compact */}
        <div className="glass rounded-2xl p-2 mb-10 flex flex-col lg:flex-row gap-2 border-white/5 shadow-xl sticky top-16 z-30 backdrop-blur-xl">
          <div className="flex-[1.5] flex items-center px-4 py-2.5 border-b lg:border-b-0 lg:border-r border-white/5">
            <Search className="h-5 w-5 text-primary mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Search by title, location or category..." 
              className="w-full bg-transparent border-none focus:outline-none text-white text-base placeholder-gray-500" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex-1 flex items-center px-4 py-2.5">
            <MapPin className="h-5 w-5 text-gray-400 mr-3 shrink-0" />
            <input 
              type="text" 
              placeholder="Filter by city..." 
              className="w-full bg-transparent border-none focus:outline-none text-white text-base placeholder-gray-500" 
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={locating}
              className="ml-auto p-2 rounded-xl hover:bg-white/5 transition-colors text-primary disabled:opacity-50"
            >
              {locating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Navigation className="h-5 w-5" />}
            </button>
          </div>

          <div className="lg:w-64 relative group">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none" />
            <select
              className="block w-full pl-16 pr-10 py-4 bg-dark-bg/50 border border-white/5 rounded-2xl text-white appearance-none focus:outline-none focus:border-primary/30 transition-all cursor-pointer text-lg"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Interest</option>
              {Object.keys(categoryConfig).filter(c => c !== 'Default').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="glass-card p-20 text-center animate-in fade-in zoom-in duration-500">
            <Search className="h-24 w-24 text-gray-700 mx-auto mb-8 opacity-20" />
            <h3 className="text-4xl font-display font-bold text-white mb-6">No events found</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-12 text-xl leading-relaxed">
              We couldn't find any events matching your criteria in this galaxy. Try a different city or category.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('');
                setLocationFilter('');
              }}
              className="bg-white text-black px-12 py-4 rounded-2xl font-black text-lg hover:bg-primary hover:text-white transition-all shadow-glow-primary active:scale-95"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map(event => {
              const cat = categoryConfig[event.category] || categoryConfig['Default'];
              return (
                <Link to={`/events/${event._id}`} key={event._id} className="group">
                  <div className="glass-card glass-shine overflow-hidden h-full flex flex-col transition-all duration-500 hover:-translate-y-3 border-white/5 group-hover:shadow-glow-primary/20">
                    <div className="relative aspect-[16/10] overflow-hidden bg-white/5">
                      <img 
                        src={event.imageUrl || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=75'} 
                        alt={event.title} 
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 glass rounded-full px-4 py-1.5 text-xs font-bold text-white backdrop-blur-md uppercase tracking-wider">{event.category}</div>
                      <div className="absolute top-4 right-4 bg-white text-black rounded-full px-4 py-1.5 text-xs font-black shadow-xl">
                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    </div>
                    <div className="p-8 flex flex-col flex-1">
                      <h3 className="text-2xl font-display font-bold text-white mb-6 line-clamp-2 group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
                      <div className="space-y-4 mt-auto text-gray-400">
                        <div className="flex items-center text-sm font-medium"><Calendar className="h-5 w-5 mr-3 text-primary" /> {new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</div>
                        <div className="flex items-center text-sm font-medium"><MapPin className="h-5 w-5 mr-3 text-primary" /> {event.location}</div>
                      </div>
                      <div className="mt-8 w-full py-4 glass border-white/5 rounded-2xl text-center font-bold text-white group-hover:bg-primary group-hover:border-primary transition-all">
                        View Details
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
