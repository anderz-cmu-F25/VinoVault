import { Plus } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { CellarEntryCard } from '../components/CellarEntryCard'
import { AddCellarEntryModal } from '../components/AddCellarEntryModal'
import { EmptyCellar } from '../components/EmptyCellar'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

interface CellarEntry {
  _id: string
  wineName: string
  winery?: string
  region?: string
  type?: string
  vintage?: number
  quantity: number
  storageLocation?: string
  status: 'storing' | 'ready' | 'consumed'
  notes?: string
  noteImages?: string[]
  purchaseDate?: string
}

type FilterStatus = 'all' | 'storing' | 'ready' | 'consumed'
type FilterType = 'all' | 'red' | 'white' | 'rosé' | 'sparkling' | 'dessert' | 'other'

export function CellarPage() {
  const { getToken } = useAuth()
  const [entries, setEntries] = useState<CellarEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<CellarEntry | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterType, setFilterType] = useState<FilterType>('all')

  const fetchCellar = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = await getToken()
      const res = await fetch(`${SERVER_URL}/api/inventory/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const json = await res.json()
      setEntries(json.data || [])
    } catch (err) {
      console.error('Failed to fetch cellar:', err)
    } finally {
      setIsLoading(false)
    }
  }, [getToken])

  useEffect(() => {
    fetchCellar()
  }, [fetchCellar])

  async function handleDelete(entryId: string) {
    try {
      const token = await getToken()
      await fetch(`${SERVER_URL}/api/inventory/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      setEntries((prev) => prev.filter((e) => e._id !== entryId))
    } catch (err) {
      console.error('Failed to delete:', err)
    } finally {
      setDeleteConfirmId(null)
    }
  }

  function handleEdit(entryId: string) {
    const entry = entries.find((e) => e._id === entryId)
    if (entry) {
      setEditEntry(entry)
      setIsModalOpen(true)
    }
  }

  function handleAddNew() {
    setEditEntry(null)
    setIsModalOpen(true)
  }

  function handleModalClose() {
    setIsModalOpen(false)
    setEditEntry(null)
  }

  const filteredEntries = entries.filter((e) => {
    const statusMatch = filterStatus === 'all' || e.status === filterStatus
    const typeMatch = filterType === 'all' || e.type === filterType
    return statusMatch && typeMatch
  })

  const totalBottles = entries.reduce((sum, e) => sum + e.quantity, 0)

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h1
              className="text-5xl mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#722F37',
                lineHeight: '1.2',
              }}
            >
              My Cellar
            </h1>
            <p
              className="text-base"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#7A7A7A' }}
            >
              {isLoading
                ? 'Loading your collection…'
                : `${entries.length} ${entries.length === 1 ? 'wine' : 'wines'} · ${totalBottles} ${totalBottles === 1 ? 'bottle' : 'bottles'}`}
            </p>
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
            onClick={handleAddNew}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5e2529'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#722F37'
            }}
          >
            <Plus className="w-4 h-4" />
            Add Wine
          </button>
        </div>

        {/* Filters */}
        {!isLoading && entries.length > 0 && (
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            {/* Status filter */}
            <div className="flex items-center gap-2">
              {(['all', 'storing', 'ready', 'consumed'] as FilterStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '5px 14px',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: filterStatus === s ? '#722F37' : '#E0D8D0',
                    backgroundColor: filterStatus === s ? '#722F37' : 'transparent',
                    color: filterStatus === s ? '#fff' : '#6B6B6B',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>

            <div style={{ width: '1px', height: '20px', backgroundColor: '#E0D8D0' }} />

            {/* Type filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              style={{
                padding: '5px 12px',
                borderRadius: '999px',
                border: '1px solid #E0D8D0',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '13px',
                color: '#6B6B6B',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All types</option>
              {['red', 'white', 'rosé', 'sparkling', 'dessert', 'other'].map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl"
              style={{ backgroundColor: '#F5F0EB', opacity: 0.6 }}
            />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyCellar onAddClick={handleAddNew} />
      ) : filteredEntries.length === 0 ? (
        <p
          className="text-center py-16"
          style={{ fontFamily: "'DM Sans', sans-serif", color: '#9A9A9A' }}
        >
          No wines match the selected filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <div key={entry._id}>
              <CellarEntryCard
                entryId={entry._id}
                wineName={entry.wineName}
                winery={entry.winery}
                region={entry.region}
                type={entry.type}
                vintage={entry.vintage}
                quantity={entry.quantity}
                storageLocation={entry.storageLocation}
                status={entry.status}
                notes={entry.notes}
                noteImages={entry.noteImages}
                onEdit={handleEdit}
                onDelete={(id) => setDeleteConfirmId(id)}
              />

              {/* Inline delete confirmation */}
              {deleteConfirmId === entry._id && (
                <div
                  className="flex items-center justify-between px-5 py-3 rounded-xl mt-1"
                  style={{
                    backgroundColor: '#FFF0F0',
                    border: '1px solid #F5C6C6',
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      color: '#C0392B',
                    }}
                  >
                    Remove "{entry.wineName}" from your cellar?
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '999px',
                        border: '1px solid #D0C8C0',
                        background: 'none',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        color: '#6B6B6B',
                        cursor: 'pointer',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleDelete(entry._id)}
                      style={{
                        padding: '5px 14px',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: '#C0392B',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#fff',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AddCellarEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSaved={fetchCellar}
        editEntry={editEntry}
      />
    </main>
  )
}
