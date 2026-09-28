/**
 * Returns a fully resolved image URL for upload paths (e.g., /uploads/filename.png)
 * ensuring that relative backend static paths render cleanly on frontend.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  let baseUrl = 'http://localhost:5000';
  if (import.meta.env.VITE_API_URL) {
    baseUrl = import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '');
  } else if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      baseUrl = `${protocol}//${hostname}:5000`;
    } else {
      baseUrl = `${protocol}//${hostname}${port && port !== '80' && port !== '443' && port !== '5173' ? ':' + port : ''}`;
    }
  }
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};
