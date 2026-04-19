import { X, Search, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

interface WineOption {
  wineId: string;
  name: string;
  region: string | null;
  salePrice: number | null;
}

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWineAdded: () => void;
}

export function AddWineModal({ isOpen, onClose, onWineAdded }: AddWineModalProps) {
  const { getToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWine, setSelectedWine] = useState<WineOption | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [searchResults, setSearchResults] = useState<WineOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced wine search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/wines?search=${encodeURIComponent(searchQuery.trim())}`
        );
        const json = await res.json();
        setSearchResults(json.data ?? []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectWine = (wine: WineOption) => {
    setSelectedWine(wine);
    setSearchQuery(wine.name);
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedWine(null); // clear selection if user types again
  };

  const handleAddToWishlist = async () => {
    if (!selectedWine || !targetPrice) return;
    setIsSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          wineId: selectedWine.wineId,
          targetPrice: Number(targetPrice),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.message ?? "Failed to add wine");
        return;
      }

      toast.success(`${selectedWine.name} added to your wishlist`);
      onWineAdded();
      handleClose();
    } catch {
      toast.error("Network error — please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSearchQuery("");
    setSelectedWine(null);
    setTargetPrice("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  if (!isOpen) return null;

  const canSubmit = !!selectedWine && !!targetPrice && !isSubmitting;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4"
        style={{ borderRadius: '16px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2
            className="text-2xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#722F37'
            }}
          >
            Add to Wishlist
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            style={{ cursor: 'pointer', border: 'none', background: 'none' }}
          >
            <X className="w-5 h-5" style={{ color: '#5A5A5A' }} />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          {/* Search Input */}
          <div className="mb-1 relative">
            {isSearching ? (
              <Loader2
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 animate-spin"
                style={{ color: '#9A9A9A' }}
              />
            ) : (
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: '#9A9A9A' }}
              />
            )}
            <input
              type="text"
              placeholder="Search wines..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: '#E0E0E0',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#722F37';
                if (searchResults.length > 0) setShowDropdown(true);
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0';
                // delay so click on dropdown item registers first
                setTimeout(() => setShowDropdown(false), 150);
              }}
            />
          </div>

          {/* Dropdown Results */}
          {showDropdown && (
            <div
              className="mb-4 border rounded-lg overflow-hidden"
              style={{ borderColor: '#E0E0E0' }}
            >
              {searchResults.length === 0 ? (
                <div
                  className="px-4 py-3 text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: '#9A9A9A' }}
                >
                  No wines found
                </div>
              ) : (
                searchResults.map((wine) => (
                  <div
                    key={wine.wineId}
                    onMouseDown={() => handleSelectWine(wine)}
                    className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                    style={{
                      borderColor: '#F0F0F0',
                      backgroundColor:
                        selectedWine?.wineId === wine.wineId ? '#FDF6EE' : '#ffffff'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedWine?.wineId !== wine.wineId)
                        e.currentTarget.style.backgroundColor = '#F9F9F9';
                    }}
                    onMouseLeave={(e) => {
                      if (selectedWine?.wineId !== wine.wineId)
                        e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <div
                      className="text-sm mb-0.5"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 500,
                        color: '#2A2A2A'
                      }}
                    >
                      {wine.name}
                    </div>
                    <div
                      className="text-xs"
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: '#9A9A9A'
                      }}
                    >
                      {wine.region ?? "Unknown region"}
                      {wine.salePrice != null && ` · $${wine.salePrice.toFixed(2)}`}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Divider */}
          <div
            className="h-px my-5"
            style={{ backgroundColor: '#E0E0E0' }}
          />

          {/* Target Price Input */}
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2A2A2A',
                fontWeight: 500
              }}
            >
              Set Target Price
            </label>
            <input
              type="text"
              placeholder="$0.00"
              value={targetPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, '');
                setTargetPrice(value);
              }}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: '#E0E0E0',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#722F37'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-full border-2 transition-colors"
              style={{
                borderColor: '#722F37',
                color: '#722F37',
                backgroundColor: 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FDF6EE'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-full transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: !canSubmit ? '#D0D0D0' : '#722F37',
                color: '#ffffff',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: !canSubmit ? 'not-allowed' : 'pointer',
                opacity: !canSubmit ? 0.6 : 1,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (canSubmit) e.currentTarget.style.backgroundColor = '#5e2529';
              }}
              onMouseLeave={(e) => {
                if (canSubmit) e.currentTarget.style.backgroundColor = '#722F37';
              }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Adding..." : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
