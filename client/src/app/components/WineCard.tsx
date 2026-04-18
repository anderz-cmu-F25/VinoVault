interface WineCardProps {
  name: string;
  region: string;
  marketPrice: number;
  targetPrice: number;
  imageUrl: string;
  status: "watching" | "priceDropped" | "targetMet";
}

export function WineCard({
  name,
  region,
  marketPrice,
  targetPrice,
  imageUrl,
  status,
}: WineCardProps) {
  const getStatusBadge = () => {
    if (status === "priceDropped" || status === "targetMet") {
      return (
        <div 
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ 
            backgroundColor: '#E8F5E9',
            color: '#2E7D32'
          }}
        >
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#2E7D32' }}
          />
          <span 
            className="text-xs"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500
            }}
          >
            Price Dropped!
          </span>
        </div>
      );
    }
    
    return (
      <div 
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ 
          backgroundColor: '#F5F5F5',
          color: '#757575'
        }}
      >
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ backgroundColor: '#757575' }}
        />
        <span 
          className="text-xs"
          style={{ 
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500
          }}
        >
          Watching
        </span>
      </div>
    );
  };

  return (
    <div 
      className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
      style={{ 
        borderRadius: '12px',
        border: status === "targetMet" ? '2px solid #C9A96E' : 'none'
      }}
    >
      <div className="flex items-center gap-4">
        {/* Wine Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={imageUrl}
            alt={name}
            className="w-16 h-16 object-cover"
            style={{ borderRadius: '8px' }}
          />
        </div>

        {/* Middle Section - Wine Details */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-base mb-1"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              fontWeight: 600,
              color: '#2A2A2A',
              lineHeight: '1.3'
            }}
          >
            {name}
          </h3>
          <p 
            className="text-sm mb-3"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              color: '#9A9A9A'
            }}
          >
            {region}
          </p>
          
          {/* Price Labels */}
          <div className="flex items-center gap-4">
            <div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2A2A2A',
                  fontWeight: 500
                }}
              >
                Market Price: ${marketPrice.toFixed(2)}
              </span>
            </div>
            <div>
              <span 
                className="text-sm"
                style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#9A9A9A'
                }}
              >
                Your Target: ${targetPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Right Section - Status and Remove */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {getStatusBadge()}
          <button 
            className="text-xs transition-all"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              color: '#C4494F',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.textDecoration = 'underline';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.textDecoration = 'none';
            }}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}