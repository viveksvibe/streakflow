import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'
import { initTheme } from './hooks/useTheme'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID";

initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  </StrictMode>,
)
