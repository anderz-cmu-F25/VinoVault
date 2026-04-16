import { Plus, RefreshCw, Info } from "lucide-react";
import { useState } from "react";
import { WineCard } from "../components/WineCard";
import { AddWineModal } from "../components/AddWineModal";
import { EmptyWishlist } from "../components/EmptyWishlist";
import { GatedWishlistState } from "../components/GatedWishlistState";
import { useAuth } from "@clerk/clerk-react";

// Mock wine wishlist data
const wineWishlist = [
  {
    id: 1,
    name: "Château Margaux 2018",
    region: "Bordeaux, France",
    marketPrice: 95.50,
    targetPrice: 75.00,
    status: "watching" as const,
    imageUrl: "https://images.unsplash.com/photo-1655574282139-144861418cc8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib3JkZWF1eCUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzc2MjQxMjM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 2,
    name: "Barolo Riserva 2016",
    region: "Piedmont, Italy",
    marketPrice: 68.00,
    targetPrice: 75.00,
    status: "targetMet" as const,
    imageUrl: "https://images.unsplash.com/photo-1722587972174-015a1686f257?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpdGFsaWFuJTIwd2luZSUyMGJvdHRsZXxlbnwxfHx8fDE3NzYyMzU5NjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    name: "Pinot Noir Reserve 2019",
    region: "Burgundy, France",
    marketPrice: 89.99,
    targetPrice: 90.00,
    status: "targetMet" as const,
    imageUrl: "https://images.unsplash.com/photo-1629154168869-95c8e955eaed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXJndW5keSUyMHdpbmUlMjBib3R0bGV8ZW58MXx8fHwxNzc2MjQxMjM4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  }
];

export function WishlistPage() {
  const [isAddWineModalOpen, setIsAddWineModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("2 min ago");

  const handleRefresh = () => {
    // In real app, this would fetch latest data
    setLastUpdated("just now");
    setTimeout(() => {
      setLastUpdated("1 min ago");
    }, 60000);
  };

  const { isSignedIn } = useAuth();

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      {/* Header Section */}
      <div className="mb-12">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1 
              className="text-5xl mb-3"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#722F37',
                lineHeight: '1.2'
              }}
            >
              My Wishlist
            </h1>
            <p 
              className="text-base"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                color: '#7A7A7A'
              }}
            >
              Track prices and get notified when they drop
            </p>
          </div>
          
          {/* Right Actions */}
          {isSignedIn && <div className="flex flex-col items-end gap-2">
            {/* Buttons Row */}
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                className="flex items-center gap-1.5 rounded-full transition-all border"
                style={{ 
                  backgroundColor: 'transparent',
                  borderColor: '#722F37',
                  borderWidth: '1px',
                  color: '#722F37',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  fontSize: '14px',
                  cursor: 'pointer',
                  padding: '6px 14px'
                }}
                onClick={handleRefresh}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#FDF6EE';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>

              {/* Add Wine Button */}
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
                onClick={() => setIsAddWineModalOpen(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#5e2529';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#722F37';
                }}
              >
                <Plus className="w-4 h-4" />
                Add Wine
              </button>
            </div>

            {/* Last Updated Row */}
            <div className="flex items-center gap-1.5">
              <span 
                style={{ 
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#8C8C8C'
                }}
              >
                Last updated {lastUpdated}
              </span>
              
              {/* Info Icon with Tooltip */}
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Info 
                  className="w-3.5 h-3.5"
                  style={{ 
                    color: '#8C8C8C',
                    cursor: 'pointer'
                  }}
                />
                
                {/* Tooltip */}
                {showTooltip && (
                  <div 
                    className="absolute right-0 top-full mt-2 px-3 py-2 rounded-lg whitespace-nowrap"
                    style={{ 
                      backgroundColor: '#2A2A2A',
                      color: '#ffffff',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '11px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                      zIndex: 100
                    }}
                  >
                    Prices are automatically checked every hour. Click refresh to see the latest.
                  </div>
                )}
              </div>
            </div>
          </div>}
        </div>
      </div>

      {/* Wine Cards List */}
      <div className="space-y-4 mb-12">
        {isSignedIn ? (
          wineWishlist.length > 0 ? (
            wineWishlist.map((wine) => (
              <WineCard
                key={wine.id}
                name={wine.name}
                region={wine.region}
                marketPrice={wine.marketPrice}
                targetPrice={wine.targetPrice}
                status={wine.status}
                imageUrl={wine.imageUrl}
              />
            ))
          ) : (
            <EmptyWishlist onBrowseClick={() => console.log("Browse wines clicked")} />
          )
        ) : (
          <GatedWishlistState />
        )}
      </div>

      {/* Add Wine Modal */}
      <AddWineModal
        isOpen={isAddWineModalOpen}
        onClose={() => setIsAddWineModalOpen(false)}
      />
    </main>
  );
}