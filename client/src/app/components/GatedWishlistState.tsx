import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function GatedWishlistState() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: '#FDF6EE' }}
    >
      <div className="flex flex-col items-center" style={{ maxWidth: '360px' }}>
        {/* Lock Icon */}
        <div className="mb-6">
          <Lock
            style={{
              width: '48px',
              height: '48px',
              color: '#722F37',
              strokeWidth: 1.5
            }}
          />
        </div>

        {/* Heading */}
        <h2
          className="text-center mb-3"
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '22px',
            color: '#722F37',
            lineHeight: '1.3'
          }}
        >
          Sign in to view your wishlist
        </h2>

        {/* Subtext */}
        <p
          className="text-center mb-8"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            color: '#7A7A7A',
            lineHeight: '1.5'
          }}
        >
          Create an account to start tracking wines and get price drop alerts
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Sign In Button */}
          <button
            className="transition-all"
            style={{
              padding: '10px 28px',
              borderRadius: '999px',
              backgroundColor: '#722F37',
              border: 'none',
              color: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/login')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5e2529';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#722F37';
            }}
          >
            Sign in
          </button>

          {/* Create Account Button */}
          <button
            className="transition-all"
            style={{
              padding: '10px 28px',
              borderRadius: '999px',
              backgroundColor: 'transparent',
              border: '1px solid #722F37',
              color: '#722F37',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
            onClick={() => navigate('/signup')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(114, 47, 55, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}
