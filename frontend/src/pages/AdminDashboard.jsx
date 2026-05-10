import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar as CalendarIcon, CheckCircle, XCircle, LayoutDashboard, Loader2, RefreshCw } from 'lucide-react';
import getApiUrl from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('requests');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalEvents: 0, pendingRequests: 0 });
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return navigate('/login');

      // Fetch Stats
      const statsRes = await fetch(getApiUrl('/admin/stats'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (statsRes.ok) setStats(await statsRes.json());

      // Fetch Requests
      const reqRes = await fetch(getApiUrl('/admin/organizer-requests'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (reqRes.ok) setRequests(await reqRes.json());

      // Fetch All Users
      const usersRes = await fetch(getApiUrl('/admin/users'), { headers: { 'Authorization': `Bearer ${token}` } });
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [navigate]);

  const handleAction = async (userId, action) => {
    try {
      setActionLoading(userId);
      const token = localStorage.getItem('token');
      
      let endpoint = '';
      let method = 'POST';
      
      if (action === 'approve') endpoint = `/admin/approve-organizer/${userId}`;
      if (action === 'reject') endpoint = `/admin/reject-organizer/${userId}`;
      if (action === 'delete') {
        endpoint = `/admin/users/${userId}`;
        method = 'DELETE';
        if (!window.confirm("Are you sure you want to completely delete this user?")) {
          setActionLoading(null);
          return;
        }
      }

      const res = await fetch(getApiUrl(endpoint), {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error(`Failed to ${action} user`);
      
      // Refresh data
      fetchDashboardData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-white flex items-center">
            <LayoutDashboard className="mr-3 h-8 w-8 text-primary" />
            Admin Panel
          </h1>
          <p className="text-gray-400 mt-2">Manage users, events, and platform settings.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="p-2 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors text-white"
          title="Refresh Data"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
            <p className="text-3xl font-display font-black text-white">{stats.totalUsers}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>
        <div className="glass-card p-6 border-white/10 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Events</p>
            <p className="text-3xl font-display font-black text-white">{stats.totalEvents}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-500/20 flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-purple-500" />
          </div>
        </div>
        <div className="glass-card p-6 border-primary/30 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5"></div>
          <div className="relative z-10">
            <p className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-1">Pending Requests</p>
            <p className="text-3xl font-display font-black text-primary">{stats.pendingRequests}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center relative z-10 border border-primary/30">
            <CheckCircle className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-white/10 mb-6">
        <button
          className={`px-6 py-3 font-bold text-sm tracking-wide rounded-t-xl transition-colors ${activeTab === 'requests' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('requests')}
        >
          Organizer Requests ({requests.length})
        </button>
        <button
          className={`px-6 py-3 font-bold text-sm tracking-wide rounded-t-xl transition-colors ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          onClick={() => setActiveTab('users')}
        >
          All Users
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
        </div>
      ) : (
        <div className="glass-card border-white/10 overflow-hidden">
          {activeTab === 'requests' && (
            <div>
              {requests.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                  <p className="text-lg">No pending organizer requests. You're all caught up!</p>
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {requests.map(req => (
                    <div key={req._id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-colors gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center">
                          {req.organizerDetails?.businessName || 'N/A'}
                          <span className="ml-3 text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full uppercase tracking-wider font-bold">Pending</span>
                        </h3>
                        <p className="text-gray-400 mt-1">Applicant: <span className="text-gray-200">{req.name}</span> ({req.email})</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span>Phone: {req.organizerDetails?.phone || 'N/A'}</span>
                          <span>Event Type: <span className="capitalize">{req.organizerDetails?.eventType || 'N/A'}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => handleAction(req._id, 'reject')}
                          disabled={actionLoading === req._id}
                          className="px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-xl font-bold text-sm transition-colors flex items-center"
                        >
                          {actionLoading === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4 mr-2" /> Reject</>}
                        </button>
                        <button 
                          onClick={() => handleAction(req._id, 'approve')}
                          disabled={actionLoading === req._id}
                          className="px-4 py-2 bg-green-500 text-black hover:opacity-90 rounded-xl font-bold text-sm transition-opacity flex items-center"
                        >
                          {actionLoading === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4 mr-2" /> Approve</>}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-white/5 text-gray-300 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{u.name}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          u.role === 'admin' ? 'bg-red-500/20 text-red-500' :
                          u.role === 'organizer' ? 'bg-primary/20 text-primary' : 'bg-white/10 text-gray-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.organizerStatus === 'pending' ? <span className="text-yellow-500">Pending App.</span> : 
                         u.organizerStatus === 'approved' ? <span className="text-green-500">Org Approved</span> : 
                         u.organizerStatus === 'rejected' ? <span className="text-red-500">Org Rejected</span> : 
                         <span className="text-gray-500">-</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleAction(u._id, 'delete')}
                          disabled={actionLoading === u._id || u.role === 'admin'}
                          className="text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
