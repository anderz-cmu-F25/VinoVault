import { Pencil, Trash2 } from 'lucide-react'
import { StarRating } from './StarRating'

export interface Review {
  _id: string
  userId: string
  userName: string
  wineId: string
  wineName: string
  rating: number
  notes: string[]
  reviewText?: string
  photoUrl?: string
  createdAt: string
  updatedAt?: string
}

interface ReviewCardProps {
  review: Review
  canEdit: boolean
  onEdit?: () => void
  onDelete?: () => void
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

export function ReviewCard({ review, canEdit, onEdit, onDelete }: ReviewCardProps) {
  const initial = (review.userName || 'A').trim().charAt(0).toUpperCase()

  return (
    <div
      className="bg-white p-5"
      style={{ borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: '#722F37',
              color: '#ffffff',
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            {initial}
          </div>
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 600,
                color: '#2A2A2A',
                fontSize: '14px',
              }}
            >
              {review.userName || 'Anonymous'}
            </div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#9A9A9A',
                fontSize: '12px',
              }}
            >
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size={18} />
      </div>

      {review.notes && review.notes.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {review.notes.map((note) => (
            <span
              key={note}
              className="px-3 py-1 rounded-full"
              style={{
                backgroundColor: '#FDF6EE',
                color: '#722F37',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                border: '1px solid #E8D9C4',
              }}
            >
              {note}
            </span>
          ))}
        </div>
      )}

      {review.reviewText && (
        <p
          className="mb-3"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#3A3A3A',
            fontSize: '14px',
            lineHeight: 1.55,
            whiteSpace: 'pre-wrap',
          }}
        >
          {review.reviewText}
        </p>
      )}

      {review.photoUrl && (
        <img
          src={review.photoUrl}
          alt="Review photo"
          className="mb-3"
          style={{
            maxWidth: '240px',
            maxHeight: '240px',
            borderRadius: '8px',
            objectFit: 'cover',
          }}
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
          }}
        />
      )}

      {canEdit && (
        <div className="flex items-center gap-4 pt-2 border-t" style={{ borderColor: '#F0F0F0' }}>
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-xs transition-all"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#722F37',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-xs transition-all"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#C4494F',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
            }}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  )
}
