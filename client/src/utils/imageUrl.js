/**
 * Returns a fully resolved image URL for upload paths (e.g., /uploads/filename.png)
 * ensuring that relative backend static paths render cleanly on frontend.
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || 
    (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000` : 'http://localhost:5000');
  
  const cleanPath = url.startsWith('/') ? url : `/${url}`;
  return `${baseUrl}${cleanPath}`;
};
