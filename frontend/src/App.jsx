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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-bg text-gray-100 font-sans selection:bg-primary selection:text-white relative overflow-x-hidden">
        {/* Global Background Layers */}
        <div className="fixed inset-0 bg-grid-pattern opacity-[0.05] pointer-events-none z-0"></div>
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full mix-blend-screen filter blur-[120px] opacity-40 pointer-events-none z-0 animate-pulse"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full mix-blend-screen filter blur-[120px] opacity-30 pointer-events-none z-0 animate-pulse delay-700"></div>
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent blur-[100px] pointer-events-none z-0"></div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetails />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/edit-event/:id" element={<EditEvent />} />
              <Route path="/dashboard" element={<Dashboard />} />
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
