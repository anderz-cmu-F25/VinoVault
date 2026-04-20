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

interface WinesResponse {
  data: WineOption[];
  meta?: {
    hasMore?: boolean;
    nextPage?: number | null;
    regions?: string[];
  };
}

interface WishlistResponse {
  data?: Array<{ wineId: string }>;
}

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWineAdded: () => void;
}

const PRICE_FILTERS = [
  { label: "All prices", value: "" },
  { label: "Under $30", value: "under-30" },
  { label: "$30-$60", value: "30-60" },
  { label: "$60-$100", value: "60-100" },
  { label: "$100+", value: "100-plus" },
];

export function AddWineModal({ isOpen, onClose, onWineAdded }: AddWineModalProps) {
  const { getToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWine, setSelectedWine] = useState<WineOption | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [wines, setWines] = useState<WineOption[]>([]);
  const [wishlistWineIds, setWishlistWineIds] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const skipNextSearchResetRef = useRef(false);

  const selectedWineIsAlreadySaved = !!selectedWine && wishlistWineIds.includes(selectedWine.wineId);

  const resetModalState = () => {
    setSearchQuery("");
    setSelectedWine(null);
    setTargetPrice("");
    setWines([]);
    setSelectedRegion("");
    setSelectedPriceRange("");
    setPage(1);
    setHasMore(true);
  };

  const handleClose = () => {
    onClose();
    resetModalState();
  };

  useEffect(() => {
    if (!isOpen) return;

    async function loadWishlist() {
      try {
        const token = await getToken();
        const res = await fetch("/api/wishlist", {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const json: WishlistResponse = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load wishlist");
        }

        setWishlistWineIds((json.data ?? []).map((item) => item.wineId));
      } catch {
        setWishlistWineIds([]);
      }
    }

    loadWishlist();
  }, [getToken, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (skipNextSearchResetRef.current) {
      skipNextSearchResetRef.current = false;
      return;
    }

    debounceRef.current = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      setWines([]);
      setSelectedWine(null);
    }, searchQuery.trim().length >= 2 ? 300 : 0);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isOpen, searchQuery, selectedPriceRange, selectedRegion]);

  useEffect(() => {
    if (!isOpen || isLoadingList || (!hasMore && page !== 1)) return;

    async function loadWines() {
      try {
        setIsLoadingList(true);

        const params = new URLSearchParams({
          page: String(page),
          limit: "24",
        });

        if (searchQuery.trim().length >= 2) {
          params.set("search", searchQuery.trim());
        }

        if (selectedRegion) {
          params.set("region", selectedRegion);
        }

        if (selectedPriceRange) {
          params.set("priceRange", selectedPriceRange);
        }

        const res = await fetch(`/api/wines?${params.toString()}`);
        const json: WinesResponse = await res.json();

        if (!res.ok) {
          throw new Error("Failed to load wines");
        }

        setWines((prev) => (page === 1 ? json.data ?? [] : [...prev, ...(json.data ?? [])]));
        setHasMore(Boolean(json.meta?.hasMore));
        setRegionOptions(json.meta?.regions ?? []);
      } catch {
        if (page === 1) setWines([]);
        setHasMore(false);
      } finally {
        setIsLoadingList(false);
      }
    }

    loadWines();
  }, [isOpen, page, searchQuery, selectedPriceRange, selectedRegion]);

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 48;

    if (isNearBottom && hasMore && !isLoadingList) {
      setPage((prev) => prev + 1);
    }
  };

  const handleSelectWine = (wine: WineOption) => {
    skipNextSearchResetRef.current = true;
    setSelectedWine(wine);
    setSearchQuery(wine.name);
  };

  const handleAddToWishlist = async () => {
    if (!selectedWine || !targetPrice || selectedWineIsAlreadySaved) return;

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

  if (!isOpen) return null;

  const canSubmit =
    !!selectedWine && !!targetPrice && !isSubmitting && !selectedWineIsAlreadySaved;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl mx-4"
        style={{ borderRadius: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2
            className="text-2xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#722F37",
            }}
          >
            Add to Wishlist
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            style={{ cursor: "pointer", border: "none", background: "none" }}
          >
            <X className="w-5 h-5" style={{ color: "#5A5A5A" }} />
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="mb-3 relative">
            {isLoadingList ? (
              <Loader2
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 animate-spin"
                style={{ color: "#9A9A9A" }}
              />
            ) : (
              <Search
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "#9A9A9A" }}
              />
            )}
            <input
              type="text"
              placeholder="Search wines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "#E0E0E0",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#722F37";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#E0E0E0";
              }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2.5 rounded-lg border"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "#E0E0E0",
                color: "#2A2A2A",
                backgroundColor: "#ffffff",
              }}
            >
              <option value="">All regions</option>
              {regionOptions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>

            <select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              className="px-3 py-2.5 rounded-lg border"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "#E0E0E0",
                color: "#2A2A2A",
                backgroundColor: "#ffffff",
              }}
            >
              {PRICE_FILTERS.map((filter) => (
                <option key={filter.value || "all"} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <p
            className="mb-3 text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#9A9A9A" }}
          >
            Scroll to load more wines. Wines already in your wishlist are marked.
          </p>

          <div
            ref={listRef}
            onScroll={handleListScroll}
            className="mb-4 border rounded-lg overflow-y-auto"
            style={{ borderColor: "#E0E0E0", maxHeight: "300px" }}
          >
            {wines.length === 0 && !isLoadingList ? (
              <div
                className="px-4 py-3 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "#9A9A9A" }}
              >
                No wines found
              </div>
            ) : (
              wines.map((wine) => {
                const isWishlisted = wishlistWineIds.includes(wine.wineId);

                return (
                  <div
                    key={wine.wineId}
                    onMouseDown={() => handleSelectWine(wine)}
                    className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                    style={{
                      borderColor: "#F0F0F0",
                      backgroundColor:
                        selectedWine?.wineId === wine.wineId ? "#FDF6EE" : "#ffffff",
                      opacity: isWishlisted ? 0.75 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (selectedWine?.wineId !== wine.wineId) {
                        e.currentTarget.style.backgroundColor = "#F9F9F9";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedWine?.wineId !== wine.wineId) {
                        e.currentTarget.style.backgroundColor = "#ffffff";
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div
                          className="text-sm mb-0.5"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontWeight: 500,
                            color: "#2A2A2A",
                          }}
                        >
                          {wine.name}
                        </div>
                        <div
                          className="text-xs"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: "#9A9A9A",
                          }}
                        >
                          {wine.region ?? "Unknown region"}
                          {wine.salePrice != null && ` · $${wine.salePrice.toFixed(2)}`}
                        </div>
                      </div>

                      {isWishlisted && (
                        <span
                          className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px]"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            backgroundColor: "#F3E8E9",
                            color: "#722F37",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                          }}
                        >
                          In wishlist
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {isLoadingList && (
              <div
                className="px-4 py-3 text-sm flex items-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif", color: "#9A9A9A" }}
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading more wines...
              </div>
            )}
          </div>

          <div className="h-px my-5" style={{ backgroundColor: "#E0E0E0" }} />

          <div className="mb-3">
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#2A2A2A",
                fontWeight: 500,
              }}
            >
              Set Target Price
            </label>
            <input
              type="text"
              placeholder="$0.00"
              value={targetPrice}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9.]/g, "");
                setTargetPrice(value);
              }}
              className="w-full px-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: "#E0E0E0",
                outline: "none",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#722F37")}
              onBlur={(e) => (e.target.style.borderColor = "#E0E0E0")}
            />
          </div>

          {selectedWineIsAlreadySaved && (
            <p
              className="mb-4 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#722F37" }}
            >
              This wine is already in your wishlist.
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 rounded-full border-2 transition-colors"
              style={{
                borderColor: "#722F37",
                color: "#722F37",
                backgroundColor: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#FDF6EE";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-full transition-all flex items-center justify-center gap-2"
              style={{
                backgroundColor: !canSubmit ? "#D0D0D0" : "#722F37",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: !canSubmit ? "not-allowed" : "pointer",
                opacity: !canSubmit ? 0.6 : 1,
                border: "none",
              }}
              onMouseEnter={(e) => {
                if (canSubmit) e.currentTarget.style.backgroundColor = "#5e2529";
              }}
              onMouseLeave={(e) => {
                if (canSubmit) e.currentTarget.style.backgroundColor = "#722F37";
              }}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {selectedWineIsAlreadySaved ? "Already Added" : "Add to Wishlist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
