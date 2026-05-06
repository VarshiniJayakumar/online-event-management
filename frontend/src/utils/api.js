const getApiUrl = (endpoint) => {
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Auto-correct localhost if accessing from another device (like mobile)
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
      // Replace localhost with the current hostname so mobile devices can connect to the same machine
      baseUrl = baseUrl.replace('localhost', window.location.hostname).replace('127.0.0.1', window.location.hostname);
    }
  }

  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  
  // Ensure /api is only added once
  if (!baseUrl.endsWith('/api') && !endpoint.startsWith('/api')) {
    return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default getApiUrl;
