import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, MapPin, Calendar, Filter, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import getApiUrl from '../utils/api';

const Events = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [searchTerm, setSearchTerm] = useState(queryParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(queryParams.get('category') || '');
  const [locationFilter, setLocationFilter] = useState(queryParams.get('location') || '');
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Update state if URL changes (e.g. clicking category in navbar or home)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || '');
    setCategoryFilter(params.get('category') || '');
    setLocationFilter(params.get('location') || '');
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
        console.log('Fetching from:', url);
        
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch from ${url}. Status: ${response.status}`);
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

  return (
    <div className="py-12 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">Explore Events</h1>
          <p className="text-gray-400 text-lg">Discover the best experiences happening around you.</p>
        </div>

        {/* Filters */}
        <div className="glass rounded-2xl p-4 mb-12 flex flex-col md:flex-row gap-4 border-white/10 shadow-lg shadow-black/50">
          <div className="flex-[2] relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="Search by event name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-500" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="City (e.g. Chennai)"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
            />
          </div>
          <div className="md:w-56 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-500" />
            </div>
            <select
              className="block w-full pl-12 pr-4 py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-white appearance-none focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Tech">Tech</option>
              <option value="Music">Music</option>
              <option value="Business">Business</option>
              <option value="Food">Food</option>
              <option value="Art">Art</option>
              <option value="Wellness">Wellness</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-24 glass rounded-2xl border-red-500/20">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(event => (
                <div key={event._id} className="group h-full">
                  <div className="glass-card overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-2 hover:shadow-glow-primary border-white/5">
                    <div className="relative h-60 overflow-hidden">
                      <img src={event.imageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                        {event.category}
                      </div>
                      <div className="absolute top-4 right-4 bg-white text-black rounded-full px-3 py-1 text-xs font-extrabold shadow-lg">
                        {event.price === 0 ? 'FREE' : `$${event.price}`}
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-display font-bold text-white mb-4 line-clamp-2 group-hover:text-primary transition-colors">{event.title}</h3>
                      <div className="space-y-3 mt-auto">
                        <div className="flex items-center text-gray-400 text-sm">
                          <Calendar className="h-4 w-4 mr-3 text-primary shrink-0" /> 
                          {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="flex items-center text-gray-400 text-sm">
                          <MapPin className="h-4 w-4 mr-3 text-primary shrink-0" /> 
                          {event.location}
                        </div>
                      </div>
                      <Link to={`/events/${event._id}`} className="mt-6 w-full py-3.5 bg-[#1a1a24] border border-white/5 rounded-xl text-center font-semibold text-white hover:bg-white/10 transition-colors group-hover:border-primary/30 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.2)]">
                        Get Tickets
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {events.length === 0 && (
              <div className="text-center py-24 glass rounded-2xl border-dashed border-white/20 mt-8">
                <h3 className="text-2xl font-display font-bold text-white mb-2">No events found</h3>
                <p className="text-gray-400 mb-6">Try adjusting your search or filter criteria.</p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={() => {setSearchTerm(''); setCategoryFilter(''); setLocationFilter('');}}
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
                  >
                    Clear filters
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const res = await fetch(getApiUrl('/health'));
                        const data = await res.json();
                        if (data.status === 'ok') {
                          alert(`Backend Health:\nStatus: ${data.status}\nEvents in DB: ${data.events}\nDatabase: ${data.database}`);
                        } else {
                          alert(`Backend Error:\n${data.message}\nDetail: ${data.error_detail}`);
                        }
                      } catch (err) {
                        alert(`Network Error: Could not reach backend at ${getApiUrl('/health')}`);
                      }
                    }}
                    className="px-6 py-2.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg font-medium transition-colors border border-primary/30"
                  >
                    Check Connection
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;
