import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, setActive, isLoaded } = useSignIn();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError("");
    setIsLoading(true);
    try {
      const result = await signIn.create({ identifier: email, password });
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        navigate("/discover");
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Sign in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: "/discover",
      });
    } catch (err: unknown) {
      console.error("Google SignIn Error:", err);
      const clerkError = err as { errors?: { message: string }[] };
      setError(clerkError.errors?.[0]?.message ?? "Google sign-in failed. Please try again.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#FDF6EE' }}
    >
      {/* Login Card */}
      <div 
        className="w-full"
        style={{ 
          maxWidth: '420px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Logo */}
        <h1 
          className="text-center mb-2"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            fontSize: '32px',
            color: '#722F37',
            lineHeight: '1.2'
          }}
        >
          VinoVault
        </h1>

        {/* Subtitle */}
        <p 
          className="text-center mb-8"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '15px',
            color: '#7A7A7A'
          }}
        >
          Welcome back
        </p>

        {/* Login Form */}
        <form onSubmit={handleSignIn}>
          {/* Email Field */}
          <div className="mb-4">
            <label 
              htmlFor="email"
              className="block mb-2"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full transition-all"
              style={{ 
                height: '44px',
                padding: '0 14px',
                borderRadius: '8px',
                border: '1px solid #D0D0D0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#2A2A2A'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#722F37';
                e.target.style.outline = 'none';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#D0D0D0';
              }}
            />
          </div>

          {/* Password Field */}
          <div className="mb-6">
            <label 
              htmlFor="password"
              className="block mb-2"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#5A5A5A'
              }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full transition-all"
                style={{ 
                  height: '44px',
                  padding: '0 44px 0 14px',
                  borderRadius: '8px',
                  border: '1px solid #D0D0D0',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#2A2A2A'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#722F37';
                  e.target.style.outline = 'none';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D0D0D0';
                }}
              />
              <button
                type="button"
                className="absolute right-0 top-0 flex items-center justify-center transition-opacity"
                style={{ 
                  width: '44px',
                  height: '44px',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  color: '#7A7A7A'
                }}
                onClick={() => setShowPassword(!showPassword)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <p className="mb-4 text-center" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#DC2626' }}>
              {error}
            </p>
          )}

          {/* Clerk CAPTCHA widget mount point (required for bot protection) */}
          <div id="clerk-captcha" />

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mb-6 transition-all"
            style={{
              height: '44px',
              borderRadius: '8px',
              backgroundColor: '#722F37',
              color: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              border: 'none',
              opacity: isLoading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#5e2529';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#722F37';
            }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center mb-6">
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              backgroundColor: '#E0E0E0'
            }}
          />
          <span 
            className="mx-4"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#9A9A9A'
            }}
          >
            or
          </span>
          <div 
            className="flex-1"
            style={{ 
              height: '1px',
              backgroundColor: '#E0E0E0'
            }}
          />
        </div>

        {/* SSO Buttons */}
        <div className="mb-8">
          {/* Google Button */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 transition-all"
            style={{
              height: '44px',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              border: '1px solid #D0D0D0',
              color: '#2A2A2A',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={handleGoogleSignIn}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F9F9F9';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
              <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707 0-.593.102-1.17.282-1.709V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.335z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Sign Up Link */}
        <p 
          className="text-center"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
            color: '#7A7A7A'
          }}
        >
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="transition-colors"
            style={{ 
              color: '#722F37',
              textDecoration: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
