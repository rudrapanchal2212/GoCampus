import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './styles.css' // Import global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "182103444002-vntt0pud93f8g10g2b36a16q9n9q1d06.apps.googleusercontent.com"}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>,
)
