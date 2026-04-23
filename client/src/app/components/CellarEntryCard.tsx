import { Pencil, Trash2 } from "lucide-react";

interface CellarEntryCardProps {
  entryId: string;
  wineName: string;
  winery?: string;
  region?: string;
  type?: string;
  vintage?: number;
  quantity: number;
  storageLocation?: string;
  status: "storing" | "ready" | "consumed";
  notes?: string;
  onEdit: (entryId: string) => void;
  onDelete: (entryId: string) => void;
}

const STATUS_CONFIG = {
  storing: { label: "Storing", bg: "#F5F5F5", color: "#6B6B6B", dot: "#6B6B6B" },
  ready: { label: "Ready to Drink", bg: "#E8F5E9", color: "#2E7D32", dot: "#2E7D32" },
  consumed: { label: "Consumed", bg: "#FFF3E0", color: "#E65100", dot: "#E65100" },
};

export function CellarEntryCard({
  entryId,
  wineName,
  winery,
  region,
  type,
  vintage,
  quantity,
  storageLocation,
  status,
  notes,
  onEdit,
  onDelete,
}: CellarEntryCardProps) {
  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.storing;

  const meta = [
    winery,
    region,
    type ? type.charAt(0).toUpperCase() + type.slice(1) : null,
    vintage ? String(vintage) : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="flex items-center gap-5 p-5 rounded-2xl transition-all"
      style={{
        backgroundColor: "#ffffff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
        border: "1px solid #F0E8E0",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 16px rgba(0,0,0,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 4px rgba(0,0,0,0.07)";
      }}
    >
      {/* Quantity badge */}
      <div
        className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
        style={{ backgroundColor: "#FDF6EE", border: "1px solid #F0E8E0" }}
      >
        <span
          className="text-2xl font-semibold leading-none"
          style={{ fontFamily: "'Playfair Display', serif", color: "#722F37" }}
        >
          {quantity}
        </span>
        <span
          className="text-xs mt-0.5"
          style={{ fontFamily: "'DM Sans', sans-serif", color: "#7A7A7A" }}
        >
          {quantity === 1 ? "bottle" : "bottles"}
        </span>
      </div>

      {/* Wine info */}
      <div className="flex-1 min-w-0">
        <h3
          className="text-lg truncate"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#2A2A2A",
            lineHeight: "1.3",
          }}
        >
          {wineName}
        </h3>

        {meta && (
          <p
            className="text-sm mt-0.5 truncate"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#7A7A7A",
            }}
          >
            {meta}
          </p>
        )}

        <div className="flex items-center gap-3 mt-2 flex-wrap">
          {/* Status badge */}
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ backgroundColor: statusCfg.bg }}
          >
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusCfg.dot }}
            />
            <span
              className="text-xs"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                color: statusCfg.color,
              }}
            >
              {statusCfg.label}
            </span>
          </div>

          {storageLocation && (
            <span
              className="text-xs"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#8C8C8C",
              }}
            >
              {storageLocation}
            </span>
          )}
        </div>

        {notes && (
          <p
            className="text-xs mt-1.5 truncate"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "#9A9A9A",
              fontStyle: "italic",
            }}
          >
            {notes}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex-shrink-0 flex items-center gap-2">
        <button
          className="p-2 rounded-lg transition-all"
          style={{ color: "#722F37", cursor: "pointer", border: "none", background: "none" }}
          onClick={() => onEdit(entryId)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FDF6EE";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>

        <button
          className="p-2 rounded-lg transition-all"
          style={{ color: "#9A9A9A", cursor: "pointer", border: "none", background: "none" }}
          onClick={() => onDelete(entryId)}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#C0392B";
            e.currentTarget.style.backgroundColor = "#FDF0F0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#9A9A9A";
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
