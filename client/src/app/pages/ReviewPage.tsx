import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { ReviewModal } from "../components/ReviewModal";
import { StarRating } from "../components/StarRating";

const API_BASE =
  (import.meta.env.VITE_SERVER_URL || "http://localhost:3000") + "/api/reviews";

interface ReviewedWine {
  _id: string;              // wineId (from $group)
  wineName: string;
  averageRating: number;
  reviewCount: number;
  lastReviewedAt: string;
}

export function ReviewPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [wines, setWines] = useState<ReviewedWine[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWines = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_BASE}/wines?q=${encodeURIComponent(query)}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to load reviews");
      setWines(body.data || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    const t = window.setTimeout(() => fetchWines(search), 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, isLoaded, isSignedIn]);

  const emptyState = useMemo(
    () => !loading && wines.length === 0,
    [loading, wines.length]
  );

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <div className="mb-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1
              className="text-5xl mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#722F37",
                lineHeight: "1.2",
              }}
            >
              Wine Reviews
            </h1>
            <p
              className="text-base"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#7A7A7A",
              }}
            >
              Discover what others are saying about the wines you love
            </p>
          </div>

          <button
            className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-md"
            style={{
              backgroundColor: "#722F37",
              color: "#ffffff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Write Review
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-8 relative">
        <Search
          className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2"
          style={{ color: "#9A9A9A" }}
        />
        <input
          type="text"
          placeholder="Search wines by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-full border"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            borderColor: "#E0E0E0",
            backgroundColor: "#ffffff",
            outline: "none",
            fontSize: "14px",
          }}
        />
      </div>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: "#FDECEE",
            color: "#C4494F",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div
          className="text-center py-12"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: "#9A9A9A",
          }}
        >
          Loading reviews...
        </div>
      ) : emptyState ? (
        <div
          className="bg-white p-12 text-center"
          style={{ borderRadius: "16px" }}
        >
          <h3
            className="text-2xl mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#722F37",
            }}
          >
            No reviews yet
          </h3>
          <p
            className="mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#7A7A7A",
            }}
          >
            {search.trim()
              ? `No wines match "${search.trim()}" yet. Be the first to review!`
              : "Start the conversation by posting the first review."}
          </p>
          <button
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: "#722F37",
              color: "#ffffff",
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              border: "none",
            }}
            onClick={() => setIsModalOpen(true)}
          >
            Write a Review
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {wines.map((w) => (
            <Link
              key={w._id}
              to={`/reviews/wine/${encodeURIComponent(w._id)}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="bg-white p-5 flex items-center justify-between transition-shadow hover:shadow-md"
                style={{
                  borderRadius: "12px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                  marginBottom: "16px",
                }}
              >
                <div className="flex-1 min-w-0">
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontWeight: 600,
                      color: "#2A2A2A",
                      fontSize: "18px",
                    }}
                  >
                    {w.wineName}
                  </h3>
                  <div className="flex items-center gap-3">
                    <StarRating value={w.averageRating} readOnly size={16} />
                    <span
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        color: "#7A7A7A",
                        fontSize: "13px",
                      }}
                    >
                      {w.averageRating.toFixed(1)} · {w.reviewCount}{" "}
                      {w.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#722F37",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                >
                  View →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={() => fetchWines(search)}
      />
    </main>
  );
}
