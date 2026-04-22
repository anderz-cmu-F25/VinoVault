import { Trash2 } from "lucide-react";

interface RemoveWineModalProps {
  isOpen: boolean;
  wineName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RemoveWineModal({ isOpen, wineName, onCancel, onConfirm }: RemoveWineModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center px-6"
        onClick={onCancel}
      >
        <div
          className="w-full"
          style={{
            maxWidth: "380px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "32px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <Trash2
              style={{ width: "40px", height: "40px", color: "#722F37", strokeWidth: 1.5 }}
            />
          </div>

          {/* Heading */}
          <h2
            className="text-center mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "20px",
              color: "#722F37",
              lineHeight: "1.3",
            }}
          >
            Remove from Wishlist?
          </h2>

          {/* Subtext */}
          <p
            className="text-center mb-8"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
              color: "#7A7A7A",
              lineHeight: "1.5",
            }}
          >
            <span style={{ color: "#2A2A2A", fontWeight: 500 }}>{wineName}</span> will be removed
            and you'll no longer receive price alerts for it.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 transition-all"
              style={{
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "transparent",
                border: "1px solid #D0D0D0",
                color: "#2A2A2A",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={onCancel}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F5F5F5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              Cancel
            </button>

            <button
              className="flex-1 transition-all"
              style={{
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#722F37",
                border: "none",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={onConfirm}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#5e2529"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#722F37"; }}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
