import { Wine } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface EmptyWishlistProps {
  onAddClick: () => void;
}

export function EmptyWishlist({ onAddClick }: EmptyWishlistProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Wine Glass Icon */}
      <div className="mb-6">
        <Wine 
          className="w-16 h-16"
          style={{ 
            color: '#722F37',
            strokeWidth: 1.5
          }}
        />
      </div>

      {/* Heading */}
      <h2 
        className="text-3xl mb-3 text-center"
        style={{ 
          fontFamily: "'Playfair Display', serif",
          color: '#722F37'
        }}
      >
        Your wishlist is empty
      </h2>

      {/* Subtext */}
      <p 
        className="text-base text-center mb-8 max-w-md"
        style={{ 
          fontFamily: "'DM Sans', sans-serif",
          color: '#7A7A7A',
          lineHeight: '1.6'
        }}
      >
        Start tracking wines you love and we'll alert you when prices drop
      </p>

      {/* CTA Buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/discover')}
          className="px-8 py-3 rounded-full transition-all border"
          style={{
            backgroundColor: 'transparent',
            borderColor: '#722F37',
            color: '#722F37',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDF6EE'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          Browse Wines
        </button>
        <button
          onClick={onAddClick}
          className="px-8 py-3 rounded-full transition-all hover:shadow-md"
          style={{
            backgroundColor: '#722F37',
            color: '#ffffff',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5e2529'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#722F37'; }}
        >
          Add Wine
        </button>
      </div>
    </div>
  );
}