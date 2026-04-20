import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './app/App.tsx'
import './styles/index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key. Set VITE_CLERK_PUBLISHABLE_KEY in your .env file.')
}

createRoot(document.getElementById('root')!).render(
  <ClerkProvider
    publishableKey={PUBLISHABLE_KEY}
    signInUrl="/login"
    signUpUrl="/signup"
    signInFallbackRedirectUrl="/wishlist"
    signUpFallbackRedirectUrl="/wishlist"
  >
    <App />
  </ClerkProvider>
)