import { BellRing, Target, Wine } from 'lucide-react'

interface EmptyWishlistProps {
  onAddClick: () => void
}

export function EmptyWishlist({ onAddClick }: EmptyWishlistProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      {/* Wine Glass Icon */}
      <div className="mb-6">
        <Wine
          className="w-16 h-16"
          style={{
            color: '#722F37',
            strokeWidth: 1.5,
          }}
        />
      </div>

      {/* Heading */}
      <h2
        className="text-3xl mb-3 text-center"
        style={{
          fontFamily: "'Playfair Display', serif",
          color: '#722F37',
        }}
      >
        No wishlist
      </h2>

      {/* Subtext */}
      <p
        className="text-base text-center mb-8 max-w-md"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#7A7A7A',
          lineHeight: '1.6',
        }}
      >
        Add wines you are considering and set a target price for each one.
      </p>

      <div
        className="mb-8 grid w-full max-w-md gap-3 rounded-lg border p-4 sm:grid-cols-2"
        style={{ backgroundColor: '#FFFDF9', borderColor: '#E8DDD2' }}
      >
        <div className="flex items-start gap-2">
          <Target className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#722F37' }} />
          <p
            className="text-xs text-left"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6F6A64', lineHeight: 1.5 }}
          >
            Use target prices to define what counts as a good deal.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <BellRing className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#722F37' }} />
          <p
            className="text-xs text-left"
            style={{ fontFamily: "'DM Sans', sans-serif", color: '#6F6A64', lineHeight: 1.5 }}
          >
            Watch for notifications when monitored prices drop.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="flex items-center">
        <button
          onClick={onAddClick}
          className="px-8 py-3 rounded-full transition-all hover:shadow-md"
          style={{
            backgroundColor: '#722F37',
            color: '#ffffff',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
          }}
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
    </div>
  )
}
