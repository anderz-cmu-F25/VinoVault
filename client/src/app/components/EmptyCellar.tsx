import { GlassWater } from "lucide-react";

interface EmptyCellarProps {
  onAddClick: () => void;
}

export function EmptyCellar({ onAddClick }: EmptyCellarProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6" style={{ opacity: 0.3 }}>
        <GlassWater
          className="w-16 h-16"
          style={{ color: "#722F37", strokeWidth: 1 }}
        />
      </div>

      <h2
        className="text-2xl mb-3 text-center"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: "#722F37",
        }}
      >
        Your cellar is empty
      </h2>

      <p
        className="text-sm mb-8 text-center max-w-xs"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: "#7A7A7A",
        }}
      >
        Start adding wines you own to track your collection.
      </p>

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
        onClick={onAddClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#5e2529";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#722F37";
        }}
      >
        Add Wine
      </button>
    </div>
  );
}
