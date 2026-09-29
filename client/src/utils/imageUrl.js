/**
 * Returns a fully resolved image URL for upload paths (e.g., /uploads/filename.png)
 * ensuring that relative backend static paths render cleanly on frontend.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let baseUrl = 'https://trade-full-stack-project-backend.onrender.com';
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || port === '5173' || port === '3000') {
      baseUrl = `${protocol}//${hostname}:5000`;
    } else {
      const envUrl = import.meta.env.VITE_API_URL;
      if (envUrl && envUrl.startsWith('http') && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        baseUrl = envUrl.replace(/\/api\/?$/, '');
      }
    }
  }
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};
