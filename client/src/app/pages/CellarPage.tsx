import { GlassWater, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CellarPage() {
  const navigate = useNavigate();

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        {/* Icon */}
        <div 
          className="mb-8"
          style={{ opacity: 0.3 }}
        >
          <GlassWater 
            className="w-20 h-20"
            style={{ 
              color: '#722F37',
              strokeWidth: 1
            }}
          />
        </div>

        {/* Heading */}
        <h1 
          className="text-4xl mb-4 text-center"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            color: '#722F37',
            lineHeight: '1.2'
          }}
        >
          My Cellar
        </h1>

        {/* Subtext */}
        <p 
          className="text-base mb-10 text-center max-w-md"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            color: '#7A7A7A'
          }}
        >
          This feature is being built by our team and will be available soon.
        </p>

        {/* Back Button */}
        <button
          className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-md"
          style={{ 
            backgroundColor: '#722F37',
            color: '#ffffff',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none'
          }}
          onClick={() => navigate('/wishlist')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#5e2529';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#722F37';
          }}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Wishlist
        </button>
      </div>
    </main>
  );
}
