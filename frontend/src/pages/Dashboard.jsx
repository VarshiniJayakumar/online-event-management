import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, BarChart3, Settings, Plus, Download, QrCode, Loader2, AlertCircle } from 'lucide-react';
import getApiUrl from '../utils/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [managedEvents, setManagedEvents] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, sold: 0, views: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);

    if (!token) {
      setError('Please login to view dashboard');
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch Tickets
        const ticketsRes = await fetch(getApiUrl('/registrations/my-tickets'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json();
          setTickets(ticketsData);
        }

        // If organizer, fetch managed events and stats
        if (storedUser?.role === 'organizer') {
          const eventsRes = await fetch(getApiUrl('/events/my-events/managed'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (eventsRes.ok) {
            const eventsData = await eventsRes.json();
            setManagedEvents(eventsData);
          }

          const statsRes = await fetch(getApiUrl('/registrations/organizer-stats'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (statsRes.ok) {
            const statsData = await statsRes.json();
            const totalRevenue = statsData.registrations.reduce((acc, reg) => acc + (reg.totalAmount || 0), 0);
            setStats({
              revenue: totalRevenue,
              sold: statsData.registrationsCount,
              views: eventsData.length * 150 // Mocked views based on event count
            });
          }
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-12 w-12 text-primary animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div className="glass-card p-8 max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Link to="/login" className="bg-primary text-white px-6 py-2 rounded-lg font-bold">Login</Link>
      </div>
    </div>
  );

  const role = user?.role || 'user';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="glass-card p-6 sticky top-28">
          <div className="mb-8 border-b border-white/10 pb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg text-white mb-3">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="font-display font-bold text-white text-xl truncate">{user?.name || 'User'}</h2>
            <p className="text-gray-400 text-sm truncate">{user?.email}</p>
          </div>
          
          <nav className="space-y-2">
            <button 
              onClick={() => setActiveTab('tickets')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'tickets' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Ticket className="mr-3 h-5 w-5" /> My Tickets
            </button>
            {role === 'organizer' && (
              <>
                <button 
                  onClick={() => setActiveTab('events')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'events' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <Calendar className="mr-3 h-5 w-5" /> Manage Events
                </button>
                <button 
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
                >
                  <BarChart3 className="mr-3 h-5 w-5" /> Analytics
                </button>
              </>
            )}
            <button 
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'settings' ? 'bg-primary/20 text-primary border border-primary/30' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            >
              <Settings className="mr-3 h-5 w-5" /> Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
          {role === 'organizer' && activeTab === 'events' && (
            <Link to="/create-event" className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-200 transition-colors flex items-center shadow-lg">
              <Plus className="h-4 w-4 mr-1" /> Create Event
            </Link>
          )}
        </div>

        {/* Stats Row (if organizer) */}
        {role === 'organizer' && (activeTab === 'events' || activeTab === 'analytics') && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="glass-card p-6 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-[20px] -mr-10 -mt-10"></div>
              <p className="text-gray-400 text-sm font-medium mb-1">Total Revenue</p>
              <h3 className="text-3xl font-display font-bold text-white">${stats.revenue.toLocaleString()}</h3>
              <p className="text-green-400 text-xs mt-2 flex items-center">↑ 14% vs last month</p>
            </div>
            <div className="glass-card p-6 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/20 rounded-full blur-[20px] -mr-10 -mt-10"></div>
              <p className="text-gray-400 text-sm font-medium mb-1">Tickets Sold</p>
              <h3 className="text-3xl font-display font-bold text-white">{stats.sold}</h3>
              <p className="text-green-400 text-xs mt-2 flex items-center">↑ 5% vs last month</p>
            </div>
            <div className="glass-card p-6 border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/20 rounded-full blur-[20px] -mr-10 -mt-10"></div>
              <p className="text-gray-400 text-sm font-medium mb-1">Page Views</p>
              <h3 className="text-3xl font-display font-bold text-white">{stats.views.toLocaleString()}</h3>
              <p className="text-red-400 text-xs mt-2 flex items-center">↓ 2% vs last month</p>
            </div>
          </div>
        )}
        
        {activeTab === 'tickets' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-display font-bold text-white mb-6">Upcoming Events</h2>
            
            {tickets.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <Ticket className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 mb-6">You haven't booked any tickets yet.</p>
                <Link to="/events" className="text-primary font-bold hover:underline">Explore Events</Link>
              </div>
            ) : (
              <div className="space-y-8">
                {tickets.map((ticket) => (
                  <div key={ticket._id} className="flex flex-col md:flex-row glass rounded-3xl border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary"></div>
                    
                    {/* Left Side: Event Info */}
                    <div className="md:w-3/4 p-8 border-b md:border-b-0 md:border-r border-dashed border-white/20 relative">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <span className="bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block">
                            {ticket.ticketType}
                          </span>
                          <h3 className="text-3xl font-display font-bold text-white leading-tight">
                            {ticket.event?.title || 'Unknown Event'}
                          </h3>
                        </div>
                        <div className="hidden sm:block w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-lg">
                          <img 
                            src={ticket.event?.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=200&q=80"} 
                            className="w-full h-full object-cover" 
                            alt="Event" 
                            onError={(e) => {
                              if (e.target.src !== 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80') {
                                e.target.src = 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=200&q=80';
                              }
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Date</p>
                          <p className="text-white font-medium">
                            {ticket.event ? new Date(ticket.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Time</p>
                          <p className="text-white font-medium">{ticket.event?.time || 'TBA'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Location</p>
                          <p className="text-white font-medium truncate">{ticket.event?.location || 'TBA'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Quantity</p>
                          <p className="text-white font-medium">{ticket.quantity} Tickets</p>
                        </div>
                      </div>
                      
                      {/* Visual punches for boarding pass effect */}
                      <div className="hidden md:block absolute -right-4 -top-4 w-8 h-8 bg-dark-bg rounded-full"></div>
                      <div className="hidden md:block absolute -right-4 -bottom-4 w-8 h-8 bg-dark-bg rounded-full"></div>
                    </div>

                    {/* Right Side: QR Code */}
                    <div className="md:w-1/4 p-8 flex flex-col items-center justify-center bg-[#1a1a24]/50 relative">
                      <div className="w-32 h-32 bg-white rounded-xl p-2 mb-4 flex items-center justify-center">
                        <QrCode className="w-full h-full text-black" />
                      </div>
                      <p className="text-xs text-gray-400 font-mono tracking-widest">TKT-{ticket._id.slice(-8).toUpperCase()}</p>
                      <button className="mt-4 text-xs font-bold text-primary hover:text-white transition-colors flex items-center">
                        <Download className="w-3 h-3 mr-1" /> Add to Apple Wallet
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="animate-in fade-in duration-300">
            <div className="glass-card border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <th className="px-6 py-4">Event Name</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {managedEvents.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">No events created yet.</td>
                    </tr>
                  ) : (
                    managedEvents.map((event) => (
                      <tr key={event._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 font-bold text-white">{event.title}</td>
                        <td className="px-6 py-4 text-gray-400">
                          {new Date(event.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400">{event.category}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-xs font-bold">
                            {event.price === 0 ? 'Free' : `$${event.price}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link to={`/events/${event._id}`} className="text-primary hover:text-white font-medium transition-colors">View</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-display font-bold text-white mb-6">Revenue Overview</h2>
            <div className="glass-card border-white/5 p-6 h-80 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
              {/* Mock Area Chart */}
              <div className="absolute bottom-0 w-full h-3/4 opacity-20 bg-gradient-to-t from-primary/50 to-transparent flex items-end px-6">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-primary stroke-primary/50 stroke-2">
                   <path d="M0,100 L0,80 Q10,70 20,60 T40,40 T60,50 T80,20 T100,10 L100,100 Z" />
                 </svg>
              </div>
              <p className="text-gray-500 font-medium z-10 relative">Chart Visualization Area</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;
