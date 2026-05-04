import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, MapPin, Clock, Tag, DollarSign, Plus, X } from 'lucide-react';
import getApiUrl from '../utils/api';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    category: 'Tech',
    imageUrl: '',
    price: 0,
    tickets: [{ type: 'General Admission', price: 0, quantity: 100 }]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTicketChange = (index, field, value) => {
    const newTickets = [...formData.tickets];
    newTickets[index][field] = field === 'type' ? value : Number(value);
    setFormData(prev => ({ ...prev, tickets: newTickets }));
  };

  const addTicketType = () => {
    setFormData(prev => ({
      ...prev,
      tickets: [...prev.tickets, { type: '', price: 0, quantity: 0 }]
    }));
  };

  const removeTicketType = (index) => {
    if (formData.tickets.length > 1) {
      const newTickets = formData.tickets.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, tickets: newTickets }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to create an event');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(getApiUrl('/events'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      navigate(`/events/${data._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Create New Event</h1>
        <p className="text-gray-400">Fill in the details to launch your next experience.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="glass-card p-8 border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Tag className="mr-2 h-5 w-5 text-primary" /> Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Event Title</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Web3 & AI Summit 2026"
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="Tech">Tech</option>
                  <option value="Music">Music</option>
                  <option value="Sports">Sports</option>
                  <option value="Food">Food</option>
                  <option value="Business">Business</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Art">Art</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                name="description"
                required
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell people what your event is about..."
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
              ></textarea>
            </div>
          </div>
        </div>

        {/* Date & Location */}
        <div className="glass-card p-8 border-white/10 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-primary" /> Date, Time & Location
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Time</label>
              <div className="relative">
                <Clock className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  name="time"
                  required
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="e.g. 09:00 AM - 05:00 PM"
                  className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-500" />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Moscone Center, San Francisco"
                className="w-full bg-[#1a1a24] border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Tickets */}
        <div className="glass-card p-8 border-white/10 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-primary" /> Ticket Tiers
            </h2>
            <button
              type="button"
              onClick={addTicketType}
              className="text-primary hover:text-white text-sm font-bold flex items-center transition-colors"
            >
              <Plus className="mr-1 h-4 w-4" /> Add Tier
            </button>
          </div>

          <div className="space-y-4">
            {formData.tickets.map((ticket, index) => (
              <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/5 flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Tier Name</label>
                  <input
                    type="text"
                    value={ticket.type}
                    onChange={(e) => handleTicketChange(index, 'type', e.target.value)}
                    placeholder="General Admission"
                    className="w-full bg-dark-bg border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={ticket.price}
                    onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    className="w-full bg-dark-bg border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div className="w-32">
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-500 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={ticket.quantity}
                    onChange={(e) => handleTicketChange(index, 'quantity', e.target.value)}
                    className="w-full bg-dark-bg border border-white/5 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTicketType(index)}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(124,58,237,0.4)] disabled:opacity-50"
        >
          {loading ? 'Creating Event...' : 'Launch Event'}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
