import { X, Search } from "lucide-react";
import { useState } from "react";

interface AddWineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleWines = [
  { id: 1, name: "Château Lafite Rothschild 2015", region: "Pauillac, Bordeaux" },
  { id: 2, name: "Ornellaia 2018", region: "Bolgheri, Tuscany" },
  { id: 3, name: "Screaming Eagle Cabernet 2019", region: "Napa Valley, California" },
  { id: 4, name: "Penfolds Grange 2017", region: "South Australia" }
];

export function AddWineModal({ isOpen, onClose }: AddWineModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWine, setSelectedWine] = useState<typeof sampleWines[0] | null>(null);
  const [targetPrice, setTargetPrice] = useState("");

  if (!isOpen) return null;

  const handleAddToWishlist = () => {
    // Handle add logic here
    console.log("Adding wine:", selectedWine, "Target price:", targetPrice);
    onClose();
    setSearchQuery("");
    setSelectedWine(null);
    setTargetPrice("");
  };

  const handleCancel = () => {
    onClose();
    setSearchQuery("");
    setSelectedWine(null);
    setTargetPrice("");
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      onClick={handleCancel}
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
            onClick={handleCancel}
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
          <div className="mb-4 relative">
            <Search 
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#9A9A9A' }}
            />
            <input
              type="text"
              placeholder="Search wines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: '#E0E0E0',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#722F37'}
              onBlur={(e) => e.target.style.borderColor = '#E0E0E0'}
            />
          </div>

          {/* Dropdown Results */}
          {searchQuery && (
            <div 
              className="mb-4 border rounded-lg overflow-hidden"
              style={{ borderColor: '#E0E0E0' }}
            >
              {sampleWines.map((wine) => (
                <div
                  key={wine.id}
                  onClick={() => {
                    setSelectedWine(wine);
                    setSearchQuery(wine.name);
                  }}
                  className="px-4 py-3 cursor-pointer transition-colors border-b last:border-b-0"
                  style={{ 
                    borderColor: '#F0F0F0',
                    backgroundColor: selectedWine?.id === wine.id ? '#FDF6EE' : '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedWine?.id !== wine.id) {
                      e.currentTarget.style.backgroundColor = '#F9F9F9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedWine?.id !== wine.id) {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }
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
                    {wine.region}
                  </div>
                </div>
              ))}
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
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 rounded-full border-2 transition-colors"
              style={{ 
                borderColor: '#722F37',
                color: '#722F37',
                backgroundColor: 'transparent',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#FDF6EE';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddToWishlist}
              disabled={!selectedWine || !targetPrice}
              className="flex-1 px-4 py-2.5 rounded-full transition-all"
              style={{ 
                backgroundColor: (!selectedWine || !targetPrice) ? '#D0D0D0' : '#722F37',
                color: '#ffffff',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: (!selectedWine || !targetPrice) ? 'not-allowed' : 'pointer',
                opacity: (!selectedWine || !targetPrice) ? 0.6 : 1,
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (selectedWine && targetPrice) {
                  e.currentTarget.style.backgroundColor = '#5e2529';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedWine && targetPrice) {
                  e.currentTarget.style.backgroundColor = '#722F37';
                }
              }}
            >
              Add to Wishlist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}