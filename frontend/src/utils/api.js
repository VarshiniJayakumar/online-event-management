const getApiUrl = (endpoint) => {
  let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  // Remove trailing slash if present
  baseUrl = baseUrl.replace(/\/$/, '');
  // Ensure /api is only added once
  if (!baseUrl.endsWith('/api') && !endpoint.startsWith('/api')) {
    return `${baseUrl}/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  }
  return `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default getApiUrl;
