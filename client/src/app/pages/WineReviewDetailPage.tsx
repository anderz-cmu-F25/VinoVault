import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { ReviewModal } from '../components/ReviewModal'
import type { ReviewModalInitialValues } from '../components/ReviewModal'
import { ReviewCard } from '../components/ReviewCard'
import type { Review } from '../components/ReviewCard'
import { StarRating } from '../components/StarRating'

const API_BASE = (import.meta.env.VITE_SERVER_URL || 'http://localhost:3000') + '/api/reviews'

interface WineMeta {
  wineId: string
  name: string
  region?: string
  vintage?: string
  varietal?: string
  regularPrice?: number | null
  salePrice?: number | null
  stock?: number | null
  wineUrl?: string
}

interface Aggregates {
  averageRating: number
  reviewCount: number
  topNotes: { note: string; count: number }[]
}

type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest'

export function WineReviewDetailPage() {
  const { wineId: rawWineId } = useParams<{ wineId: string }>()
  const wineId = rawWineId ? decodeURIComponent(rawWineId) : ''
  const { getToken, userId } = useAuth()

  const [wine, setWine] = useState<WineMeta | null>(null)
  const [aggregates, setAggregates] = useState<Aggregates>({
    averageRating: 0,
    reviewCount: 0,
    topNotes: [],
  })
  const [reviews, setReviews] = useState<Review[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [writeOpen, setWriteOpen] = useState(false)
  const [editingReview, setEditingReview] = useState<ReviewModalInitialValues | null>(null)

  const fetchReviews = useCallback(async () => {
    if (!wineId) return
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const res = await fetch(
        `${API_BASE}/wines/${encodeURIComponent(wineId)}/reviews?sort=${sortOrder}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to load reviews')
      setWine(body.data.wine)
      setAggregates(body.data.aggregates)
      setReviews(body.data.reviews)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load reviews')
    } finally {
      setLoading(false)
    }
  }, [wineId, sortOrder, getToken])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Delete this review? This can't be undone.")) return
    try {
      const token = await getToken()
      const res = await fetch(`${API_BASE}/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.message || 'Failed to delete review')
      fetchReviews()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to delete review')
    }
  }

  const displayName = useMemo(() => {
    if (wine?.name) return wine.name
    if (reviews.length > 0) return reviews[0].wineName
    return 'Wine'
  }, [wine, reviews])

  return (
    <main className="max-w-4xl mx-auto px-8 py-12">
      <Link
        to="/reviews"
        className="inline-flex items-center gap-1.5 mb-6"
        style={{
          fontFamily: "'DM Sans', sans-serif",
          color: '#722F37',
          fontSize: '14px',
          textDecoration: 'none',
        }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to reviews
      </Link>

      {error && (
        <div
          className="mb-4 p-3 rounded-lg"
          style={{
            backgroundColor: '#FDECEE',
            color: '#C4494F',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '13px',
          }}
        >
          {error}
        </div>
      )}

      {/* Wine header */}
      <div
        className="bg-white p-6 mb-6"
        style={{ borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
      >
        <h1
          className="text-4xl mb-2"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: '#722F37',
            lineHeight: 1.2,
          }}
        >
          {displayName}
        </h1>
        <div
          className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#7A7A7A',
            fontSize: '14px',
          }}
        >
          {wine?.region && <span>{wine.region}</span>}
          {wine?.vintage && <span>· {wine.vintage}</span>}
          {wine?.varietal && <span>· {wine.varietal}</span>}
        </div>

        {/* Price strip */}
        {wine && (wine.regularPrice != null || wine.salePrice != null) && (
          <div className="flex items-center gap-4 mb-4">
            {wine.salePrice != null && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#2A2A2A',
                  fontWeight: 600,
                  fontSize: '16px',
                }}
              >
                ${Number(wine.salePrice).toFixed(2)}
              </span>
            )}
            {wine.regularPrice != null && wine.regularPrice !== wine.salePrice && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#9A9A9A',
                  fontSize: '14px',
                  textDecoration: 'line-through',
                }}
              >
                ${Number(wine.regularPrice).toFixed(2)}
              </span>
            )}
            {wine.stock != null && (
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  color: '#7A7A7A',
                  fontSize: '13px',
                }}
              >
                · {wine.stock} in stock
              </span>
            )}
          </div>
        )}

        {/* Aggregates */}
        <div
          className="flex flex-wrap items-center gap-6 pt-4 border-t"
          style={{ borderColor: '#F0F0F0' }}
        >
          <div>
            <div
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#9A9A9A',
                marginBottom: '2px',
              }}
            >
              Average rating
            </div>
            <div className="flex items-center gap-2">
              <StarRating value={aggregates.averageRating} readOnly size={18} />
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  color: '#2A2A2A',
                  fontWeight: 600,
                }}
              >
                {aggregates.averageRating.toFixed(1)}
              </span>
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  color: '#7A7A7A',
                }}
              >
                ({aggregates.reviewCount} {aggregates.reviewCount === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          </div>

          {aggregates.topNotes.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px',
                  color: '#9A9A9A',
                  marginBottom: '4px',
                }}
              >
                Top notes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aggregates.topNotes.map((n) => (
                  <span
                    key={n.note}
                    className="px-3 py-1 rounded-full"
                    style={{
                      backgroundColor: '#FDF6EE',
                      color: '#722F37',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      border: '1px solid #E8D9C4',
                    }}
                  >
                    {n.note} · {n.count}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#7A7A7A',
            }}
          >
            Sort:
          </label>
          <select
            id="sort"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as SortOrder)}
            className="px-3 py-1.5 rounded-lg border bg-white"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              borderColor: '#E0E0E0',
              outline: 'none',
              color: '#2A2A2A',
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </select>
        </div>
        <button
          onClick={() => setWriteOpen(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-full"
          style={{
            backgroundColor: '#722F37',
            color: '#ffffff',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Plus className="w-4 h-4" />
          Write Review
        </button>
      </div>

      {/* Reviews list */}
      {loading ? (
        <div
          className="text-center py-12"
          style={{
            fontFamily: "'DM Sans', sans-serif",
            color: '#9A9A9A',
          }}
        >
          Loading...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white p-10 text-center" style={{ borderRadius: '16px' }}>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: '#7A7A7A',
            }}
          >
            Be the first to review this wine.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <ReviewCard
              key={r._id}
              review={r}
              canEdit={!!userId && r.userId === userId}
              onEdit={() =>
                setEditingReview({
                  reviewId: r._id,
                  wineId: r.wineId,
                  wineName: r.wineName,
                  rating: r.rating,
                  notes: r.notes,
                  reviewText: r.reviewText,
                  photoUrl: r.photoUrl,
                })
              }
              onDelete={() => handleDelete(r._id)}
            />
          ))}
        </div>
      )}

      <ReviewModal
        isOpen={writeOpen}
        onClose={() => setWriteOpen(false)}
        onSaved={() => fetchReviews()}
        lockedWine={wine ? { wineId: wine.wineId, wineName: wine.name } : undefined}
      />

      <ReviewModal
        isOpen={!!editingReview}
        onClose={() => setEditingReview(null)}
        onSaved={() => fetchReviews()}
        initialValues={editingReview || undefined}
      />
    </main>
  )
}
