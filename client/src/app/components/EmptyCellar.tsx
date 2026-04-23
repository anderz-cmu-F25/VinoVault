import { Boxes, GlassWater, MapPin } from 'lucide-react'

interface EmptyCellarProps {
  onAddClick: () => void
}

export function EmptyCellar({ onAddClick }: EmptyCellarProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="mb-6" style={{ opacity: 0.3 }}>
        <GlassWater className="w-16 h-16" style={{ color: '#722F37', strokeWidth: 1 }} />
      </div>

      <h2
        className="text-2xl mb-3 text-center"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: '#722F37',
        }}
      >
        Your cellar is empty
      </h2>

      <p
        className="text-sm mb-8 text-center max-w-xs"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#7A7A7A',
        }}
      >
        Add bottles you own so you can track quantity, storage location, and drinking status.
      </p>

      <div
        className="mb-8 grid w-full max-w-md gap-3 rounded-lg border p-4 sm:grid-cols-2"
        style={{ backgroundColor: '#FFFDF9', borderColor: '#E8DDD2' }}
      >
        <div className="flex items-start gap-2">
          <Boxes className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#722F37' }} />
          <p
            className="text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6F6A64', lineHeight: 1.5 }}
          >
            Record how many bottles are ready, storing, or consumed.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#722F37' }} />
          <p
            className="text-xs"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6F6A64', lineHeight: 1.5 }}
          >
            Save shelf, rack, or fridge notes before bottles get hard to find.
          </p>
        </div>
      </div>

      <button
        className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-md"
        style={{
          backgroundColor: '#722F37',
          color: '#ffffff',
          fontFamily: "'DM Sans', sans-serif",
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
        }}
        onClick={onAddClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#5e2529'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#722F37'
        }}
      >
        Add Wine
      </button>
    </div>
  )
}
