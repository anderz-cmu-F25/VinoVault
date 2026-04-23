import { X, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { StarRating } from "./StarRating";

const API_BASE =
  (import.meta.env.VITE_SERVER_URL || "http://localhost:3000") + "/api/reviews";

const NOTE_OPTIONS = [
  "Citrus", "Apple", "Pear", "Grapefruit", "Herbaceous",
  "Blackcurrant", "Blackberry", "Cedar", "Plum", "Cherry",
  "Chocolate", "Raspberry", "Earthy", "Black Pepper", "Smoky",
  "Spicy", "Tobacco", "Strawberry", "Tomato", "Leather",
  "Rose", "Tar",
];

interface WineSuggestion {
  wineId: string;
  name: string;
  region?: string;
  vintage?: string;
}

export interface ReviewModalInitialValues {
  reviewId?: string;
  wineId?: string;
  wineName?: string;
  rating?: number;
  notes?: string[];
  reviewText?: string;
  photoUrl?: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (wineId: string) => void;
  initialValues?: ReviewModalInitialValues;
  lockedWine?: { wineId: string; wineName: string };
}

export function ReviewModal({
  isOpen,
  onClose,
  onSaved,
  initialValues,
  lockedWine,
}: ReviewModalProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const isEditMode = Boolean(initialValues?.reviewId);

  const [wineSearch, setWineSearch] = useState("");
  const [selectedWine, setSelectedWine] = useState<{ wineId?: string; name: string } | null>(null);
  const [suggestions, setSuggestions] = useState<WineSuggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (lockedWine) {
      setSelectedWine({ wineId: lockedWine.wineId, name: lockedWine.wineName });
      setWineSearch(lockedWine.wineName);
    } else if (initialValues?.wineName) {
      setSelectedWine({ wineId: initialValues.wineId, name: initialValues.wineName });
      setWineSearch(initialValues.wineName);
    } else {
      setSelectedWine(null);
      setWineSearch("");
    }
    setRating(initialValues?.rating ?? 0);
    setNotes(initialValues?.notes ?? []);
    setReviewText(initialValues?.reviewText ?? "");
    setPhotoUrl(initialValues?.photoUrl ?? "");
    setError(null);
    setSuggestions([]);
    setShowDropdown(false);
  }, [isOpen, initialValues, lockedWine]);

  useEffect(() => {
    if (isEditMode || lockedWine) return;
    if (searchTimer.current) window.clearTimeout(searchTimer.current);
    if (!wineSearch.trim() || (selectedWine && wineSearch === selectedWine.name)) {
      setSuggestions([]);
      return;
    }
    searchTimer.current = window.setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${API_BASE}/wines/search?q=${encodeURIComponent(wineSearch)}&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const body = await res.json();
        setSuggestions(body.data || []);
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => {
      if (searchTimer.current) window.clearTimeout(searchTimer.current);
    };
  }, [wineSearch, isEditMode, lockedWine, selectedWine, getToken]);

  const toggleNote = (note: string) => {
    setNotes((prev) => {
      if (prev.includes(note)) return prev.filter((n) => n !== note);
      if (prev.length >= 3) return prev;
      return [...prev, note];
    });
  };

  const canSubmit = useMemo(() => {
    if (submitting) return false;
    if (isEditMode) return true;
    return Boolean((selectedWine?.name || wineSearch).trim());
  }, [submitting, isEditMode, selectedWine, wineSearch]);

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      const token = await getToken();
      const userName = user?.username || user?.firstName || "Anonymous";

      if (isEditMode && initialValues?.reviewId) {
        const res = await fetch(`${API_BASE}/${initialValues.reviewId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rating, notes, reviewText, photoUrl }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Failed to update review");
        onSaved(body.data.review.wineId);
      } else {
        const wineName = (selectedWine?.name || wineSearch).trim();
        const res = await fetch(`${API_BASE}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            wineName,
            rating,
            notes,
            reviewText,
            photoUrl,
            userName,
          }),
        });
        const body = await res.json();
        if (!res.ok) throw new Error(body.message || "Failed to create review");
        onSaved(body.data.review.wineId);
      }
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.4)" }}
      onClick={onClose}
    >
      <div
        className="bg-white shadow-2xl w-full max-w-xl my-8"
        style={{ borderRadius: "16px" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2
            className="text-2xl"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: "#722F37",
            }}
          >
            {isEditMode ? "Edit Your Review" : "Write a Review"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
            style={{ cursor: "pointer", border: "none", background: "none" }}
          >
            <X className="w-5 h-5" style={{ color: "#5A5A5A" }} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {/* Wine search / selection */}
          {!lockedWine && !isEditMode && (
            <div className="mb-5">
              <label
                className="block mb-2"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#2A2A2A",
                  fontWeight: 500,
                  fontSize: "14px",
                }}
              >
                Wine <span style={{ color: "#C4494F" }}>*</span>
              </label>
              <div className="relative">
                <Search
                  className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#9A9A9A" }}
                />
                <input
                  type="text"
                  placeholder="Search or enter a new wine name..."
                  value={wineSearch}
                  onChange={(e) => {
                    setWineSearch(e.target.value);
                    setSelectedWine(null);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    borderColor: "#E0E0E0",
                    outline: "none",
                  }}
                />
              </div>
              {showDropdown && suggestions.length > 0 && (
                <div
                  className="mt-1 border rounded-lg overflow-hidden"
                  style={{ borderColor: "#E0E0E0", maxHeight: "200px", overflowY: "auto" }}
                >
                  {suggestions.map((wine) => (
                    <div
                      key={wine.wineId}
                      onClick={() => {
                        setSelectedWine({ wineId: wine.wineId, name: wine.name });
                        setWineSearch(wine.name);
                        setShowDropdown(false);
                      }}
                      className="px-4 py-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0"
                      style={{ borderColor: "#F0F0F0" }}
                    >
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 500,
                          color: "#2A2A2A",
                          fontSize: "14px",
                        }}
                      >
                        {wine.name}
                      </div>
                      {wine.region && (
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            color: "#9A9A9A",
                            fontSize: "12px",
                          }}
                        >
                          {wine.region}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && wineSearch.trim() && suggestions.length === 0 && !selectedWine && (
                <div
                  className="mt-1 px-4 py-3 border rounded-lg"
                  style={{
                    borderColor: "#E0E0E0",
                    backgroundColor: "#FDF6EE",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#5A5A5A",
                  }}
                >
                  No match found — "<strong>{wineSearch.trim()}</strong>" will be added as a new wine.
                </div>
              )}
            </div>
          )}

          {lockedWine && (
            <div
              className="mb-5 p-3 rounded-lg"
              style={{ backgroundColor: "#FDF6EE" }}
            >
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "12px",
                  color: "#9A9A9A",
                }}
              >
                Wine
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "16px",
                  color: "#2A2A2A",
                }}
              >
                {lockedWine.wineName}
              </div>
            </div>
          )}

          {/* Rating */}
          <div className="mb-5">
            <label
              className="block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#2A2A2A",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Rating
            </label>
            <div className="flex items-center gap-3">
              <StarRating value={rating} onChange={setRating} size={28} />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#7A7A7A",
                  fontSize: "14px",
                }}
              >
                {rating.toFixed(1)} / 5
              </span>
            </div>
          </div>

          {/* Tasting notes */}
          <div className="mb-5">
            <label
              className="block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#2A2A2A",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Tasting Notes <span style={{ color: "#9A9A9A", fontWeight: 400 }}>(up to 3)</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {NOTE_OPTIONS.map((note) => {
                const active = notes.includes(note);
                const disabled = !active && notes.length >= 3;
                return (
                  <button
                    key={note}
                    type="button"
                    onClick={() => toggleNote(note)}
                    disabled={disabled}
                    className="px-3 py-1.5 rounded-full transition-all"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "12px",
                      border: `1px solid ${active ? "#722F37" : "#E0E0E0"}`,
                      backgroundColor: active ? "#722F37" : "#ffffff",
                      color: active ? "#ffffff" : disabled ? "#C0C0C0" : "#3A3A3A",
                      cursor: disabled ? "not-allowed" : "pointer",
                      opacity: disabled ? 0.6 : 1,
                    }}
                  >
                    {note}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Review text */}
          <div className="mb-5">
            <label
              className="block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#2A2A2A",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Review <span style={{ color: "#9A9A9A", fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              placeholder="Share your impressions..."
              className="w-full px-3 py-2 rounded-lg border resize-y"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                borderColor: "#E0E0E0",
                outline: "none",
              }}
            />
          </div>

          {/* Photo URL */}
          <div className="mb-5">
            <label
              className="block mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#2A2A2A",
                fontWeight: 500,
                fontSize: "14px",
              }}
            >
              Photo URL <span style={{ color: "#9A9A9A", fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="url"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-lg border"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                borderColor: "#E0E0E0",
                outline: "none",
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

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-full border-2"
              style={{
                borderColor: "#722F37",
                color: "#722F37",
                backgroundColor: "transparent",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 rounded-full"
              style={{
                backgroundColor: canSubmit ? "#722F37" : "#D0D0D0",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: canSubmit ? "pointer" : "not-allowed",
                border: "none",
              }}
            >
              {submitting ? "Saving..." : isEditMode ? "Save Changes" : "Post Review"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
