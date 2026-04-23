import { useAuth } from "@clerk/clerk-react";
import { Check, ExternalLink, Loader2, Plus, Search, SlidersHorizontal, Star, Wine, X } from "lucide-react";
import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { StarRating } from "../components/StarRating";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";
const API_BASE = `${SERVER_URL}/api/discovery`;
const PAGE_SIZE = 24;

type DiscoveryMode = "personalized" | "filter-ranking" | "keyword";

interface DiscoveredWine {
  wineId: string;
  name: string;
  vintage: string | number | null;
  region: string | null;
  stock: number | null;
  regularPrice: number | null;
  salePrice: number | null;
  rating: string | null;
  averageRating: number;
  reviewCount: number;
  topNotes: string[];
  wineUrl: string | null;
  reason: string;
}

interface DiscoveryResponse {
  strategy: string;
  data: DiscoveredWine[];
  meta: {
    regions?: string[];
    personalized?: boolean;
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
    nextPage?: number | null;
  };
}

interface WishlistResponse {
  data?: Array<{ wineId: string }>;
}

const MODE_TABS: Array<{ label: string; value: DiscoveryMode }> = [
  { label: "For You", value: "personalized" },
  { label: "Browse", value: "filter-ranking" },
  { label: "Search", value: "keyword" },
];

const PRICE_FILTERS = [
  { label: "All prices", value: "" },
  { label: "Under $30", value: "under-30" },
  { label: "$30-$60", value: "30-60" },
  { label: "$60-$100", value: "60-100" },
  { label: "$100+", value: "100-plus" },
];

function formatPrice(value: number | null) {
  return value == null ? "Price unavailable" : `$${value.toFixed(2)}`;
}

function getPriceRangeText(wine: DiscoveredWine) {
  if (wine.salePrice != null && wine.regularPrice != null && wine.salePrice < wine.regularPrice) {
    return (
      <>
        <span style={{ color: "#722F37", fontWeight: 700 }}>{formatPrice(wine.salePrice)}</span>
        <span style={{ color: "#B0B0B0", textDecoration: "line-through" }}>
          {formatPrice(wine.regularPrice)}
        </span>
      </>
    );
  }

  return <span style={{ color: "#2A2A2A", fontWeight: 600 }}>{formatPrice(wine.salePrice ?? wine.regularPrice)}</span>;
}

export function DiscoverPage() {
  const { getToken } = useAuth();
  const [mode, setMode] = useState<DiscoveryMode>("personalized");
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [wines, setWines] = useState<DiscoveredWine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [wishlistWineIds, setWishlistWineIds] = useState<string[]>([]);
  const [addingWineId, setAddingWineId] = useState<string | null>(null);
  const [wishlistTarget, setWishlistTarget] = useState<DiscoveredWine | null>(null);
  const [targetPrice, setTargetPrice] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [usedPersonalSignals, setUsedPersonalSignals] = useState(false);
  const canSubmitSearch = search.trim().length >= 2;

  const effectiveMode = useMemo<DiscoveryMode>(() => {
    return mode;
  }, [mode]);

  const handleModeChange = (nextMode: DiscoveryMode) => {
    setMode(nextMode);
    setPage(1);
    if (nextMode !== "keyword") {
      setSearch("");
      setSubmittedSearch("");
    }
  };

  const handleSearchSubmit = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setPage(1);
    setSubmittedSearch(search.trim());
  };

  const handleRegionChange = (value: string) => {
    setPage(1);
    setSelectedRegion(value);
  };

  const handlePriceRangeChange = (value: string) => {
    setPage(1);
    setSelectedPriceRange(value);
  };

  const fetchWines = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const params = new URLSearchParams({
        strategy: effectiveMode,
        limit: String(PAGE_SIZE),
        page: String(page),
      });

      if (effectiveMode === "keyword" && submittedSearch.length >= 2) {
        params.set("search", submittedSearch);
      }

      if (effectiveMode === "keyword" && selectedRegion) {
        params.set("region", selectedRegion);
      }

      if (effectiveMode === "keyword" && selectedPriceRange) {
        params.set("priceRange", selectedPriceRange);
      }

      const res = await fetch(`${API_BASE}?${params.toString()}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json: DiscoveryResponse = await res.json();

      if (!res.ok) throw new Error((json as unknown as { message?: string }).message || "Failed to load wines");

      setWines(json.data || []);
      setUsedPersonalSignals(Boolean(json.meta?.personalized));
      setRegionOptions(json.meta?.regions ?? []);
      setTotal(json.meta?.total ?? 0);
      setHasMore(Boolean(json.meta?.hasMore));
    } catch (err) {
      setWines([]);
      setTotal(0);
      setHasMore(false);
      setError(err instanceof Error ? err.message : "Failed to load wines");
    } finally {
      setIsLoading(false);
    }
  }, [effectiveMode, getToken, page, selectedPriceRange, selectedRegion, submittedSearch]);

  useEffect(() => {
    fetchWines();
  }, [fetchWines]);

  const fetchWishlist = useCallback(async () => {
    try {
      const token = await getToken();
      const res = await fetch("/api/wishlist", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const json: WishlistResponse = await res.json();
      if (!res.ok) throw new Error("Failed to load wishlist");
      setWishlistWineIds((json.data || []).map((item) => item.wineId));
    } catch {
      setWishlistWineIds([]);
    }
  }, [getToken]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const openWishlistDialog = (wine: DiscoveredWine) => {
    const currentPrice = wine.salePrice ?? wine.regularPrice;
    if (currentPrice == null || wishlistWineIds.includes(wine.wineId)) return;
    setWishlistTarget(wine);
    setTargetPrice(currentPrice.toFixed(2));
  };

  const closeWishlistDialog = () => {
    setWishlistTarget(null);
    setTargetPrice("");
  };

  const handleAddToWishlist = async () => {
    if (!wishlistTarget || !targetPrice) return;

    const numericTargetPrice = Number(targetPrice);
    if (!Number.isFinite(numericTargetPrice) || numericTargetPrice <= 0) {
      toast.error("Enter a valid target price");
      return;
    }

    setAddingWineId(wishlistTarget.wineId);
    try {
      const token = await getToken();
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          wineId: wishlistTarget.wineId,
          targetPrice: numericTargetPrice,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add wine");

      setWishlistWineIds((prev) => [...new Set([...prev, wishlistTarget.wineId])]);
      window.dispatchEvent(new Event("vinovault:notifications-refresh"));
      toast.success(`${wishlistTarget.name} added to your wishlist`);
      closeWishlistDialog();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add wine");
    } finally {
      setAddingWineId(null);
    }
  };

  const subtitle = useMemo(() => {
    if (mode === "keyword" && submittedSearch.length >= 2) {
      return `Search results for "${submittedSearch}"`;
    }
    if (mode === "keyword") {
      return "Search the shared wine catalog by name";
    }
    if (mode === "personalized") {
      return usedPersonalSignals
        ? "Recommendations shaped by your cellar, reviews, and watched wines"
        : "A curated starting point while VinoVault learns your taste";
    }
    return "Ranked wines from the shared catalog";
  }, [mode, submittedSearch, usedPersonalSignals]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const resultStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const resultEnd = Math.min(page * PAGE_SIZE, total);
  const showFilters = mode === "keyword";

  return (
    <main className="max-w-6xl mx-auto px-8 py-16">
      <div className="mb-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h1
              className="text-5xl mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#722F37",
                lineHeight: "1.2",
              }}
            >
              Discover Wines
            </h1>
            <p
              className="text-base"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#7A7A7A" }}
            >
              {subtitle}
            </p>
          </div>

          <div
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full"
            style={{
              backgroundColor: "#ffffff",
              color: "#722F37",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              fontWeight: 600,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <Wine className="w-4 h-4" />
            Strategy powered
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {MODE_TABS.map((tab) => {
              const isActive = mode === tab.value && effectiveMode === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => handleModeChange(tab.value)}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: isActive ? "#722F37" : "#E0D8D0",
                    backgroundColor: isActive ? "#722F37" : "transparent",
                    color: isActive ? "#ffffff" : "#6B6B6B",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {mode === "keyword" && (
            <form onSubmit={handleSearchSubmit} className="flex w-full max-w-3xl items-center gap-3">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
                  style={{ color: "#9A9A9A" }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by wine name..."
                  className="w-full pl-11 pr-4 py-3 rounded-full border"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    borderColor: "#E0D8D0",
                    backgroundColor: "#ffffff",
                    outline: "none",
                    fontSize: "14px",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={!canSubmitSearch}
                className="h-11 px-5 rounded-full inline-flex items-center justify-center gap-2"
                style={{
                  border: "none",
                  backgroundColor: canSubmitSearch ? "#722F37" : "#BFA2A7",
                  color: "#ffffff",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor: canSubmitSearch ? "pointer" : "not-allowed",
                }}
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          )}

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="h-11 px-4 rounded-full border"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: "#E0D8D0",
                  backgroundColor: "#ffffff",
                  color: "#4A4A4A",
                  fontSize: "13px",
                  minWidth: "180px",
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
                onChange={(e) => handlePriceRangeChange(e.target.value)}
                className="h-11 px-4 rounded-full border"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: "#E0D8D0",
                  backgroundColor: "#ffffff",
                  color: "#4A4A4A",
                  fontSize: "13px",
                  minWidth: "160px",
                }}
              >
                {PRICE_FILTERS.map((priceFilter) => (
                  <option key={priceFilter.value || "all"} value={priceFilter.value}>
                    {priceFilter.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div
          className="mb-6 p-4 rounded-xl"
          style={{
            backgroundColor: "#FDECEE",
            color: "#C4494F",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={item}
              className="h-56 rounded-2xl"
              style={{ backgroundColor: "#F5F0EB", opacity: 0.7 }}
            />
          ))}
        </div>
      ) : wines.length === 0 ? (
        <div
          className="bg-white text-center py-16 px-6"
          style={{ borderRadius: "16px" }}
        >
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-4" style={{ color: "#C9A96E" }} />
          <h3
            className="text-2xl mb-2"
            style={{ fontFamily: "'Playfair Display', serif", color: "#722F37" }}
          >
            No wines found
          </h3>
          <p style={{ fontFamily: "'DM Sans', sans-serif", color: "#7A7A7A" }}>
            {mode === "keyword"
              ? "Type at least two characters to search the catalog."
              : "No recommendations are available yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {wines.map((wine) => (
            <article
              key={wine.wineId}
              className="bg-white p-5 transition-shadow hover:shadow-md flex flex-col h-full"
              style={{
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="min-w-0">
                  <h3
                    className="text-xl mb-1"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#2A2A2A",
                      lineHeight: "1.25",
                    }}
                  >
                    {wine.name}
                  </h3>
                  <p
                    className="text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "#8C8C8C" }}
                  >
                    {wine.region || "Unknown region"}
                    {wine.vintage ? ` · ${wine.vintage}` : ""}
                  </p>
                </div>

                {wine.salePrice != null && wine.regularPrice != null && wine.salePrice < wine.regularPrice && (
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px]"
                    style={{
                      backgroundColor: "#FFF8E1",
                      color: "#E65100",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                    }}
                  >
                    On sale
                  </span>
                )}
              </div>

              <div
                className="flex items-center gap-2 mb-4 text-sm"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {getPriceRangeText(wine)}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <StarRating value={wine.averageRating || 0} readOnly size={16} />
                <span
                  className="text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#7A7A7A" }}
                >
                  {(wine.averageRating || 0).toFixed(1)} · {wine.reviewCount}{" "}
                  {wine.reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>

              <p
                className="text-sm mb-4 min-h-[40px]"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#5A5A5A",
                  lineHeight: 1.45,
                }}
              >
                {wine.reason}
              </p>

              {wine.topNotes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {wine.topNotes.map((note) => (
                    <span
                      key={note}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                      style={{
                        backgroundColor: "#F3E8E9",
                        color: "#722F37",
                        fontFamily: "'DM Sans', sans-serif",
                        fontWeight: 600,
                      }}
                    >
                      <Star className="w-3 h-3" />
                      {note}
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-auto grid grid-cols-[1fr_1fr_auto] items-center gap-2">
                <Link
                  to={`/reviews/wine/${encodeURIComponent(wine.wineId)}`}
                  className="h-10 inline-flex items-center justify-center text-center px-4 rounded-full"
                  style={{
                    backgroundColor: "#722F37",
                    color: "#ffffff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  View Reviews
                </Link>

                <button
                  type="button"
                  disabled={
                    addingWineId === wine.wineId ||
                    wishlistWineIds.includes(wine.wineId) ||
                    (wine.salePrice ?? wine.regularPrice) == null
                  }
                  onClick={() => openWishlistDialog(wine)}
                  className="h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-full border"
                  style={{
                    borderColor: wishlistWineIds.includes(wine.wineId) ? "#C9A96E" : "#722F37",
                    backgroundColor: wishlistWineIds.includes(wine.wineId) ? "#FDF6EE" : "#ffffff",
                    color: wishlistWineIds.includes(wine.wineId) ? "#8A6D2F" : "#722F37",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor:
                      wishlistWineIds.includes(wine.wineId) || (wine.salePrice ?? wine.regularPrice) == null
                        ? "not-allowed"
                        : "pointer",
                    opacity: (wine.salePrice ?? wine.regularPrice) == null ? 0.55 : 1,
                  }}
                >
                  {addingWineId === wine.wineId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : wishlistWineIds.includes(wine.wineId) ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {wishlistWineIds.includes(wine.wineId) ? "Added" : "Wishlist"}
                </button>

                {wine.wineUrl && (
                  <a
                    href={wine.wineUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Open ${wine.name}`}
                    className="h-10 w-10 rounded-full border"
                    style={{
                      borderColor: "#722F37",
                      color: "#722F37",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && total > 0 && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p
            className="text-sm"
            style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6B6B" }}
          >
            Showing {resultStart}-{resultEnd} of {total}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="h-10 px-4 rounded-full border"
              style={{
                borderColor: "#E0D8D0",
                backgroundColor: "#ffffff",
                color: page <= 1 ? "#B0B0B0" : "#4A4A4A",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: page <= 1 ? "not-allowed" : "pointer",
              }}
            >
              Previous
            </button>

            <span
              className="px-3 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: "#6B6B6B" }}
            >
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!hasMore}
              className="h-10 px-4 rounded-full border"
              style={{
                borderColor: "#E0D8D0",
                backgroundColor: "#ffffff",
                color: !hasMore ? "#B0B0B0" : "#4A4A4A",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
                fontWeight: 600,
                cursor: !hasMore ? "not-allowed" : "pointer",
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {wishlistTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={closeWishlistDialog}
        >
          <div
            className="bg-white w-full max-w-md shadow-2xl"
            style={{ borderRadius: "16px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h2
                className="text-2xl"
                style={{ fontFamily: "'Playfair Display', serif", color: "#722F37" }}
              >
                Add to Wishlist
              </h2>
              <button
                type="button"
                onClick={closeWishlistDialog}
                aria-label="Close"
                className="p-1 rounded-full"
                style={{ border: "none", background: "transparent", cursor: "pointer" }}
              >
                <X className="w-5 h-5" style={{ color: "#5A5A5A" }} />
              </button>
            </div>

            <div className="px-6 pb-6">
              <div className="mb-5">
                <h3
                  className="text-lg mb-1"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#2A2A2A",
                    lineHeight: 1.25,
                  }}
                >
                  {wishlistTarget.name}
                </h3>
                <p
                  className="text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif", color: "#7A7A7A" }}
                >
                  Current price: {formatPrice(wishlistTarget.salePrice ?? wishlistTarget.regularPrice)}
                </p>
              </div>

              <label
                className="block text-sm mb-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#2A2A2A",
                  fontWeight: 600,
                }}
              >
                Target Price
              </label>
              <input
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value.replace(/[^0-9.]/g, ""))}
                className="w-full px-4 py-3 rounded-lg border mb-5"
                placeholder="$0.00"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  borderColor: "#E0D8D0",
                  outline: "none",
                }}
              />

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeWishlistDialog}
                  className="flex-1 h-10 rounded-full border"
                  style={{
                    borderColor: "#722F37",
                    color: "#722F37",
                    backgroundColor: "transparent",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddToWishlist}
                  disabled={addingWineId === wishlistTarget.wineId}
                  className="flex-1 h-10 rounded-full inline-flex items-center justify-center gap-2"
                  style={{
                    border: "none",
                    backgroundColor: "#722F37",
                    color: "#ffffff",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 600,
                    cursor: addingWineId === wishlistTarget.wineId ? "wait" : "pointer",
                  }}
                >
                  {addingWineId === wishlistTarget.wineId && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Add Wine
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div
          className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            backgroundColor: "#722F37",
            color: "#ffffff",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
            boxShadow: "0 8px 18px rgba(0,0,0,0.15)",
          }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading recommendations
        </div>
      )}
    </main>
  );
}
