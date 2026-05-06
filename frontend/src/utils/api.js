const getApiUrl = (endpoint) => {
  // Use VITE_API_URL if provided, otherwise default to localhost for development
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  if (typeof window !== 'undefined' && (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('render.com'))) {
    if (!import.meta.env.VITE_API_URL) {
      console.warn('🛑 API CONFIGURATION ERROR: The frontend cannot find your backend.');
      console.warn('1. Go to your Render.com dashboard and copy your backend URL.');
      console.warn('2. Go to Netlify -> Site Settings -> Environment Variables.');
      console.warn('3. Add VITE_API_URL = [Your Render URL].');
      console.warn('4. Redeploy your Netlify site.');
    }
  }
  
  // LOGIC FOR LOCAL NETWORK TESTING (Mobile/Tablet on the same Wi-Fi)
  // Only auto-replace if we are NOT on a production domain like .netlify.app or .render.com
  const isProduction = typeof window !== 'undefined' && 
    (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('render.com'));

  if (!isProduction && typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      // Replace localhost with the current hostname (IP address) so mobile devices can connect to the local dev server
      baseUrl = baseUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
  }

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Ensure /api is only added once
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!baseUrl.endsWith('/api') && !path.startsWith('/api')) {
    return `${baseUrl}/api${path}`;
  }
  return `${baseUrl}${path}`;
};

export default getApiUrl;
