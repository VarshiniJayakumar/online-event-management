import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import VerifyEmail from './pages/VerifyEmail';
import BecomeOrganizer from './pages/BecomeOrganizer';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
        {/* Global Background Layers */}
        <div className="fixed inset-0 bg-[#06060a] z-0"></div>
        <div className="fixed inset-0 bg-gradient-to-br from-primary/30 via-transparent to-secondary/30 pointer-events-none z-0"></div>
        <div className="fixed inset-0 bg-grid-pattern opacity-60 pointer-events-none z-0"></div>
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-gradient-radial from-primary/35 via-secondary/15 to-transparent blur-[160px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/become-organizer" element={<BecomeOrganizer />} />
              <Route path="/create-event" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><CreateEvent /></ProtectedRoute>} />
              <Route path="/edit-event/:id" element={<ProtectedRoute allowedRoles={['organizer', 'admin']}><EditEvent /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/verify-email/:token" element={<VerifyEmail />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
