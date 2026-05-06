import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, BarChart3, Settings as SettingsIcon, Plus, Download, QrCode, Loader2, AlertCircle, User, Shield, Bell, CreditCard, CheckCircle2, Users, X } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import getApiUrl from '../utils/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [managedEvents, setManagedEvents] = useState([]);
  const [stats, setStats] = useState({ revenue: 0, sold: 0, views: 0, registrations: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  
  // Settings State
  const [updatedName, setUpdatedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Modal State for registrations
  const [selectedEventRegs, setSelectedEventRegs] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
    if (storedUser) setUpdatedName(storedUser.name);

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
              views: eventsData.length * 150,
              registrations: statsData.registrations
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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateSuccess(false);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(getApiUrl('/auth/profile'), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: updatedName }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      const newUser = { ...user, name: data.user.name };
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(getApiUrl(`/events/${eventId}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to delete event');

      setManagedEvents(prev => prev.filter(e => e._id !== eventId));
      alert('Event deleted successfully');
    } catch (err) {
      alert(err.message);
    }
  };

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
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-lg text-white mb-3 shadow-glow-primary">
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
              <SettingsIcon className="mr-3 h-5 w-5" /> Settings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-[600px]">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
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
                      <div className="w-32 h-32 bg-white rounded-xl p-2 mb-4 flex items-center justify-center overflow-hidden">
                        <QRCodeCanvas 
                          value={JSON.stringify({ ticketId: ticket._id, event: ticket.event?.title, user: user?.email })}
                          size={120}
                          bgColor={"#ffffff"}
                          fgColor={"#000000"}
                          level={"L"}
                        />
                      </div>
                      <p className="text-xs text-gray-400 font-mono tracking-widest uppercase">TKT-{ticket._id.slice(-8)}</p>
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
            <div className="glass-card border-white/5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    <th className="px-6 py-4">Event Name</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
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
                    managedEvents.map((event) => {
                      const eventRegs = stats.registrations.filter(r => r.event?._id === event._id || r.event === event._id);
                      return (
                        <tr key={event._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white">{event.title}</p>
                            <p className="text-xs text-gray-500">{event.category}</p>
                          </td>
                          <td className="px-6 py-4 text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setSelectedEventRegs({ event, regs: eventRegs })}
                              className="flex items-center text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md hover:bg-primary/20 transition-colors"
                            >
                              <Users className="w-3 h-3 mr-1" /> {eventRegs.length} Attendees
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 bg-white/5 text-gray-300 border border-white/10 rounded-full text-xs font-bold">
                              {event.price === 0 ? 'Free' : `$${event.price}`}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-4">
                            <Link to={`/events/${event._id}`} className="text-primary hover:text-white font-medium transition-colors">View</Link>
                            <button 
                              onClick={() => handleDeleteEvent(event._id)}
                              className="text-red-500 hover:text-red-400 font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-xl font-display font-bold text-white mb-6">Performance Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <div className="glass-card p-6 border-white/5">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Registration Trend</h4>
                  <div className="h-48 flex items-end justify-between gap-2">
                    {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-primary to-secondary rounded-t-lg transition-all hover:opacity-80" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-gray-500 font-bold uppercase">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
               </div>
               <div className="glass-card p-6 border-white/5">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Top Categories</h4>
                  <div className="space-y-4">
                    {[
                      { name: 'Tech', val: 75, color: 'bg-blue-500' },
                      { name: 'Music', val: 60, color: 'bg-purple-500' },
                      { name: 'Sports', val: 40, color: 'bg-green-500' }
                    ].map((c, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-white font-medium">{c.name}</span>
                          <span className="text-gray-500">{c.val}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full ${c.color}`} style={{ width: `${c.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-display font-bold text-white mb-8">Account Settings</h2>
            
            <div className="space-y-6">
              <form onSubmit={handleUpdateProfile} className="glass-card p-6 border-white/5">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                  <User className="mr-3 h-5 w-5 text-primary" /> Profile Information
                </h3>
                
                {updateSuccess && (
                  <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-5 w-5 mr-3" />
                    Profile updated successfully!
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                    <input 
                      type="text" 
                      value={updatedName}
                      onChange={(e) => setUpdatedName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={user?.email}
                      disabled
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="mt-8 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all flex items-center disabled:opacity-50 shadow-glow-primary"
                >
                  {isUpdating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Save Changes'}
                </button>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <Shield className="mr-3 h-5 w-5 text-primary" /> Security
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">Update your password to keep your account secure.</p>
                  <button 
                    onClick={() => alert('Password reset link sent to your email!')}
                    className="w-full border border-white/10 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/5 transition-colors"
                  >
                    Change Password
                  </button>
                </div>
                <div className="glass-card p-6 border-white/5">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center">
                    <Bell className="mr-3 h-5 w-5 text-primary" /> Notifications
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">Manage how you receive updates about your events.</p>
                  <button className="w-full border border-white/10 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-white/5 transition-colors">
                    Configure
                  </button>
                </div>
              </div>

              <div className="glass-card p-6 border-red-500/10 bg-red-500/5">
                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                <p className="text-gray-400 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="text-red-500 font-bold hover:underline">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Attendee Modal */}
      {selectedEventRegs && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="glass-card w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)] border-white/10">
            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedEventRegs.event.title}</h3>
                <p className="text-sm text-gray-400">Total Attendees: {selectedEventRegs.regs.length}</p>
              </div>
              <button onClick={() => setSelectedEventRegs(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {selectedEventRegs.regs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 italic">No registrations found for this event.</div>
              ) : (
                selectedEventRegs.regs.map((reg, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold mr-4">
                        {reg.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-bold">{reg.user?.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{reg.user?.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-white">{reg.quantity} Tickets</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Booked on {new Date(reg.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
