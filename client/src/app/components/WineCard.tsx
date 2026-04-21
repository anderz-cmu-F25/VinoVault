import { Pencil } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=200&q=80";

interface WineCardProps {
  id: string;
  name: string;
  region: string | null;
  marketPrice: number | null;
  regularPrice?: number | null;
  targetPrice: number;
  imageUrl?: string;
  status: "watching" | "priceDropped" | "targetMet";
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
}

export function WineCard({
  id,
  name,
  region,
  marketPrice,
  regularPrice,
  targetPrice,
  imageUrl,
  status,
  onRemove,
  onEdit,
}: WineCardProps) {
  const getStatusBadge = () => {
    if (status === "targetMet") {
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
            Target Met
          </span>
        </div>
      );
    }

    if (status === "priceDropped") {
      return (
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: '#FFF8E1',
            color: '#E65100'
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: '#E65100' }}
          />
          <span
            className="text-xs"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500
            }}
          >
            Price Dropped
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
            src={imageUrl || FALLBACK_IMAGE}
            alt={name}
            className="w-16 h-16 object-cover"
            style={{ borderRadius: '8px' }}
            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
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
            {region ?? "—"}
          </p>

          {/* Price Labels */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {regularPrice != null && marketPrice != null && marketPrice < regularPrice && (
                <span
                  className="text-sm"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: '#B0B0B0',
                    textDecoration: 'line-through',
                  }}
                >
                  ${regularPrice.toFixed(2)}
                </span>
              )}
              <span
                className="text-sm"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2A2A2A',
                  fontWeight: 500
                }}
              >
                {marketPrice != null ? `$${marketPrice.toFixed(2)}` : "—"}
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

        {/* Right Section - Status and Actions */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          {getStatusBadge()}
          <div className="flex items-center gap-3">
            <button
              aria-label="Edit target price"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                color: '#9A9A9A',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => onEdit(id)}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#722F37'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#9A9A9A'; }}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
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
              onClick={() => onRemove(id)}
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
    </div>
  );
}
