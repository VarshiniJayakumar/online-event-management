// Pings the backend every 10 minutes to prevent Render cold starts
const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const startKeepAlive = () => {
  const ping = () => {
    fetch(`${BACKEND_URL}/api/health`, { method: 'GET' })
      .then(() => console.log('[KeepAlive] Backend pinged'))
      .catch(() => {}); // Silently ignore errors
  };

  // Ping immediately on load
  ping();

  // Then ping every 10 minutes
  setInterval(ping, 10 * 60 * 1000);
};
