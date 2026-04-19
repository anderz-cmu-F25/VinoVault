import { Plus, RefreshCw, Info } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { WineCard } from "../components/WineCard";
import { AddWineModal } from "../components/AddWineModal";
import { EmptyWishlist } from "../components/EmptyWishlist";
import { GatedWishlistState } from "../components/GatedWishlistState";

interface WishlistItem {
  _id: string;
  wineId: string;
  name: string;
  region: string | null;
  marketPrice: number | null;
  targetPrice: number;
  isNotified: boolean;
}

export function WishlistPage() {
  const { isSignedIn, getToken } = useAuth();

  const [isAddWineModalOpen, setIsAddWineModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchWishlist = useCallback(async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/wishlist", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const json = await res.json();
      setWishlistItems(json.data ?? []);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch {
      toast.error("Could not load your wishlist");
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn, getToken]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleRefresh = () => {
    fetchWishlist();
  };

  const handleRemove = async (id: string) => {
    // Optimistic update
    setWishlistItems((prev) => prev.filter((item) => item._id !== id));
    try {
      const token = await getToken();
      const res = await fetch(`/api/wishlist?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) {
        // Revert on failure
        await fetchWishlist();
        toast.error("Failed to remove wine");
      } else {
        toast.success("Removed from wishlist");
      }
    } catch {
      await fetchWishlist();
      toast.error("Network error — please try again");
    }
  };

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
          {isSignedIn && (
            <div className="flex flex-col items-end gap-2">
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
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDF6EE'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
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
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#5e2529'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#722F37'; }}
                >
                  <Plus className="w-4 h-4" />
                  Add Wine
                </button>
              </div>

              {/* Last Updated Row */}
              {lastUpdated && (
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

                  <div
                    className="relative"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <Info
                      className="w-3.5 h-3.5"
                      style={{ color: '#8C8C8C', cursor: 'pointer' }}
                    />
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
                        Prices are checked daily by the monitor. Click refresh to reload.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Wine Cards List */}
      <div className="space-y-4 mb-12">
        {isSignedIn ? (
          isLoading && wishlistItems.length === 0 ? (
            <div
              className="text-center py-16"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#9A9A9A' }}
            >
              Loading your wishlist…
            </div>
          ) : wishlistItems.length > 0 ? (
            wishlistItems.map((item) => (
              <WineCard
                key={item._id}
                id={item._id}
                name={item.name}
                region={item.region}
                marketPrice={item.marketPrice}
                targetPrice={item.targetPrice}
                status={
                  item.marketPrice != null && item.marketPrice <= item.targetPrice
                    ? "targetMet"
                    : "watching"
                }
                onRemove={handleRemove}
              />
            ))
          ) : (
            <EmptyWishlist onAddClick={() => setIsAddWineModalOpen(true)} />
          )
        ) : (
          <GatedWishlistState />
        )}
      </div>

      {/* Add Wine Modal */}
      <AddWineModal
        isOpen={isAddWineModalOpen}
        onClose={() => setIsAddWineModalOpen(false)}
        onWineAdded={fetchWishlist}
      />
    </main>
  );
}
