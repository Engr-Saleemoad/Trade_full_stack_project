import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import axios from 'axios'
import './index.css'
import App from './App.jsx'

// Dynamic API Base URL configuration for Vercel/Production deployment
let apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
// Strip trailing /api if present to prevent double /api/api prefix in request paths
if (apiBase.endsWith('/api')) {
  apiBase = apiBase.slice(0, -4);
}
axios.defaults.baseURL = apiBase;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
