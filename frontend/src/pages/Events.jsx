import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Loader2, Music, Laptop, Trophy, Utensils, Briefcase, Palette, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import getApiUrl from '../utils/api';
import { CardSkeleton } from '../components/Skeleton';

const categoryConfig = {
  'Music': { icon: <Music className="h-12 w-12" />, color: 'from-purple-600 to-purple-900' },
  'Tech': { icon: <Laptop className="h-12 w-12" />, color: 'from-blue-600 to-blue-900' },
  'Sports': { icon: <Trophy className="h-12 w-12" />, color: 'from-green-600 to-green-900' },
  'Food': { icon: <Utensils className="h-12 w-12" />, color: 'from-orange-600 to-orange-900' },
  'Business': { icon: <Briefcase className="h-12 w-12" />, color: 'from-pink-600 to-pink-900' },
  'Art': { icon: <Palette className="h-12 w-12" />, color: 'from-indigo-600 to-indigo-900' },
  'Wellness': { icon: <HeartPulse className="h-12 w-12" />, color: 'from-teal-600 to-teal-900' },
  'Default': { icon: <Calendar className="h-12 w-12" />, color: 'from-gray-600 to-gray-900' }
};

const Events = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category') || '');
  const [locationFilter, setLocationFilter] = useState(queryParams.get('location') || '');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sync state with URL parameters
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

  const getCatConfig = (cat) => categoryConfig[cat] || categoryConfig['Default'];

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Explore Events</h1>
        </div>

        <div className="glass rounded-2xl p-4 mb-12 flex flex-col md:flex-row gap-4 border-white/10 shadow-lg">
          <div className="flex-[2] relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none"
              placeholder="Search for city (e.g. Chennai, Mumbai...)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div className="md:w-64 relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" />
            <select
              className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-white appearance-none focus:outline-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {Object.keys(categoryConfig).filter(c => c !== 'Default').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => {
              const cat = getCatConfig(event.category);
              return (
                <div key={event._id} className="group h-full">
                  <div className="glass-card overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 border-white/5">
                    <div className={`relative h-60 overflow-hidden bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                      <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white">
                        {cat.icon}
                      </div>
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
                      <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-md">{event.category}</div>
                      <div className="absolute top-4 right-4 bg-white text-black rounded-full px-3 py-1 text-xs font-extrabold shadow-lg">
                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-display font-bold text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="space-y-3 mt-auto text-gray-400 text-sm">
                        <div className="flex items-center"><Calendar className="h-4 w-4 mr-3 text-primary" /> {new Date(event.date).toLocaleDateString()}</div>
                        <div className="flex items-center"><MapPin className="h-4 w-4 mr-3 text-primary" /> {event.location}</div>
                      </div>
                      <Link to={`/events/${event._id}`} className="mt-6 w-full py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-center font-semibold text-white hover:bg-white/10 transition-colors">
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
    </div>
  );
};

export default Events;
