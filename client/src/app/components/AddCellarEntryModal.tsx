import { X, Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

interface WineResult {
  _id: string;
  wineName: string;
  winery?: string;
  type?: string;
  region?: string;
  vintage?: number;
}

interface CellarEntryData {
  _id?: string;
  wineName: string;
  winery?: string;
  type?: string;
  region?: string;
  vintage?: number;
  quantity: number;
  purchaseDate?: string;
  storageLocation?: string;
  status?: "storing" | "ready" | "consumed";
  notes?: string;
}

interface AddCellarEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  editEntry?: CellarEntryData | null;
}

const WINE_TYPES = ["red", "white", "rosé", "sparkling", "dessert", "other"];
const STATUS_OPTIONS = [
  { value: "storing", label: "Storing" },
  { value: "ready", label: "Ready to Drink" },
  { value: "consumed", label: "Consumed" },
];

export function AddCellarEntryModal({
  isOpen,
  onClose,
  onSaved,
  editEntry,
}: AddCellarEntryModalProps) {
  const { getToken } = useAuth();
  const isEditMode = !!editEntry;

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WineResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [form, setForm] = useState({
    wineName: "",
    winery: "",
    type: "",
    region: "",
    vintage: "",
    quantity: "1",
    purchaseDate: "",
    storageLocation: "",
    status: "storing",
    notes: "",
  });

  useEffect(() => {
    if (isOpen && editEntry) {
      setForm({
        wineName: editEntry.wineName || "",
        winery: editEntry.winery || "",
        type: editEntry.type || "",
        region: editEntry.region || "",
        vintage: editEntry.vintage ? String(editEntry.vintage) : "",
        quantity: String(editEntry.quantity ?? 1),
        purchaseDate: editEntry.purchaseDate || "",
        storageLocation: editEntry.storageLocation || "",
        status: editEntry.status || "storing",
        notes: editEntry.notes || "",
      });
      setIsManual(true);
    } else if (isOpen && !editEntry) {
      resetForm();
    }
  }, [isOpen, editEntry]);

  function resetForm() {
    setForm({
      wineName: "", winery: "", type: "", region: "",
      vintage: "", quantity: "1", purchaseDate: "",
      storageLocation: "", status: "storing", notes: "",
    });
    setSearchQuery("");
    setSearchResults([]);
    setIsManual(false);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSearchChange(value: string) {
    setSearchQuery(value);
    setField("wineName", value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${SERVER_URL}/api/inventory/wines/search?q=${encodeURIComponent(value)}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const json = await res.json();
        setSearchResults(json.data || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      }
    }, 300);
  }

  function selectWineFromSearch(wine: WineResult) {
    setForm({
      wineName: wine.wineName,
      winery: wine.winery || "",
      type: wine.type || "",
      region: wine.region || "",
      vintage: wine.vintage ? String(wine.vintage) : "",
      quantity: "1",
      purchaseDate: "",
      storageLocation: "",
      status: "storing",
      notes: "",
    });
    setSearchQuery(wine.wineName);
    setShowDropdown(false);
    setIsManual(true);
  }

  async function handleSubmit() {
    if (!form.wineName.trim()) return;
    if (!form.quantity || Number(form.quantity) < 0) return;

    setIsSubmitting(true);
    try {
      const token = await getToken();
      const payload = {
        wineName: form.wineName.trim(),
        winery: form.winery.trim() || undefined,
        type: form.type || undefined,
        region: form.region.trim() || undefined,
        vintage: form.vintage ? Number(form.vintage) : undefined,
        quantity: Number(form.quantity),
        purchaseDate: form.purchaseDate || undefined,
        storageLocation: form.storageLocation.trim() || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      };

      const url = isEditMode
        ? `${SERVER_URL}/api/inventory/${editEntry!._id}`
        : `${SERVER_URL}/api/inventory/`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save entry.");
      onSaved();
      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const canSubmit = form.wineName.trim().length > 0 && Number(form.quantity) >= 0 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-y-auto"
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid #F0E8E0" }}
        >
          <h2
            className="text-xl"
            style={{ fontFamily: "'Playfair Display', serif", color: "#722F37" }}
          >
            {isEditMode ? "Edit Cellar Entry" : "Add to Cellar"}
          </h2>
          <button
            onClick={handleClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9A9A9A" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Wine search (add mode only) */}
          {!isEditMode && (
            <div className="relative">
              <label style={labelStyle}>Search wine catalog</label>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: "#9A9A9A" }}
                />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: "36px" }}
                />
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div
                  className="absolute w-full mt-1 rounded-xl shadow-lg z-10 overflow-hidden"
                  style={{ backgroundColor: "#fff", border: "1px solid #F0E8E0" }}
                >
                  {searchResults.map((wine) => (
                    <button
                      key={wine._id}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ background: "none", border: "none", cursor: "pointer" }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FDF6EE"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                      onClick={() => selectWineFromSearch(wine)}
                    >
                      <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#2A2A2A" }}>
                        {wine.wineName}
                      </p>
                      {(wine.winery || wine.region) && (
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "12px", color: "#7A7A7A" }}>
                          {[wine.winery, wine.region].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isManual && (
                <button
                  className="mt-2 text-sm underline"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#722F37", fontFamily: "'DM Sans', sans-serif" }}
                  onClick={() => setIsManual(true)}
                >
                  Enter manually instead
                </button>
              )}
            </div>
          )}

          {/* Manual fields */}
          {(isManual || isEditMode) && (
            <>
              <div>
                <label style={labelStyle}>Wine Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Château Margaux"
                  value={form.wineName}
                  onChange={(e) => setField("wineName", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Winery</label>
                  <input
                    type="text"
                    placeholder="e.g. Domaine Leflaive"
                    value={form.winery}
                    onChange={(e) => setField("winery", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setField("type", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select type</option>
                    {WINE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Region</label>
                  <input
                    type="text"
                    placeholder="e.g. Bordeaux, France"
                    value={form.region}
                    onChange={(e) => setField("region", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Vintage</label>
                  <input
                    type="number"
                    placeholder="e.g. 2018"
                    value={form.vintage}
                    onChange={(e) => setField("vintage", e.target.value)}
                    style={inputStyle}
                    min={1900}
                    max={new Date().getFullYear()}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Quantity *</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={form.quantity}
                    onChange={(e) => setField("quantity", e.target.value)}
                    style={inputStyle}
                    min={0}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setField("purchaseDate", e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Rack A, Shelf 2"
                    value={form.storageLocation}
                    onChange={(e) => setField("storageLocation", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField("status", e.target.value)}
                    style={inputStyle}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  placeholder="Tasting notes, occasion, etc."
                  value={form.notes}
                  onChange={(e) => setField("notes", e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: "none" }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4"
          style={{ borderTop: "1px solid #F0E8E0" }}
        >
          <button
            onClick={handleClose}
            style={{
              background: "none", border: "1px solid #D0C8C0",
              borderRadius: "999px", padding: "8px 20px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
              color: "#6B6B6B", cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              backgroundColor: canSubmit ? "#722F37" : "#C0A8A8",
              border: "none", borderRadius: "999px", padding: "8px 24px",
              fontFamily: "'DM Sans', sans-serif", fontSize: "14px",
              fontWeight: 500, color: "#fff",
              cursor: canSubmit ? "pointer" : "not-allowed",
            }}
          >
            {isSubmitting ? "Saving…" : isEditMode ? "Save Changes" : "Add to Cellar"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "12px",
  fontWeight: 500,
  color: "#6B6B6B",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid #E0D8D0",
  fontFamily: "'DM Sans', sans-serif",
  fontSize: "14px",
  color: "#2A2A2A",
  backgroundColor: "#FAFAFA",
  outline: "none",
  boxSizing: "border-box",
};
