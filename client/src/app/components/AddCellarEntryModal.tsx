import { X, Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

interface WineResult {
  id: number
  wineName: string
  winery?: string
  type?: string
  region?: string
  vintage?: number
}

const SAMPLE_WINES: WineResult[] = [
  {
    id: 1,
    wineName: 'Château Margaux',
    winery: 'Château Margaux',
    type: 'red',
    region: 'Bordeaux, France',
    vintage: 2018,
  },
  {
    id: 2,
    wineName: 'Château Lafite Rothschild',
    winery: 'Château Lafite Rothschild',
    type: 'red',
    region: 'Pauillac, Bordeaux',
    vintage: 2015,
  },
  {
    id: 3,
    wineName: 'Opus One',
    winery: 'Opus One Winery',
    type: 'red',
    region: 'Napa Valley, California',
    vintage: 2019,
  },
  {
    id: 4,
    wineName: 'Penfolds Grange',
    winery: 'Penfolds',
    type: 'red',
    region: 'South Australia',
    vintage: 2017,
  },
  {
    id: 5,
    wineName: 'Screaming Eagle Cabernet',
    winery: 'Screaming Eagle',
    type: 'red',
    region: 'Napa Valley, California',
    vintage: 2019,
  },
  {
    id: 6,
    wineName: 'Ornellaia',
    winery: "Tenuta dell'Ornellaia",
    type: 'red',
    region: 'Bolgheri, Tuscany',
    vintage: 2018,
  },
  {
    id: 7,
    wineName: 'Barolo Riserva',
    winery: 'Giacomo Conterno',
    type: 'red',
    region: 'Piedmont, Italy',
    vintage: 2016,
  },
  {
    id: 8,
    wineName: 'Cloudy Bay Sauvignon Blanc',
    winery: 'Cloudy Bay',
    type: 'white',
    region: 'Marlborough, New Zealand',
    vintage: 2022,
  },
  {
    id: 9,
    wineName: 'Dom Pérignon',
    winery: 'Moët & Chandon',
    type: 'sparkling',
    region: 'Champagne, France',
    vintage: 2013,
  },
  {
    id: 10,
    wineName: 'Caymus Cabernet Sauvignon',
    winery: 'Caymus Vineyards',
    type: 'red',
    region: 'Napa Valley, California',
    vintage: 2021,
  },
  {
    id: 11,
    wineName: 'Pinot Noir Reserve',
    winery: 'Domaine Drouhin',
    type: 'red',
    region: 'Burgundy, France',
    vintage: 2019,
  },
  {
    id: 12,
    wineName: 'Whispering Angel Rosé',
    winery: "Château d'Esclans",
    type: 'rosé',
    region: 'Provence, France',
    vintage: 2023,
  },
]

interface CellarEntryData {
  _id?: string
  wineName: string
  winery?: string
  type?: string
  region?: string
  vintage?: number
  quantity: number
  purchaseDate?: string
  storageLocation?: string
  status?: 'storing' | 'ready' | 'consumed'
  notes?: string
}

interface AddCellarEntryModalProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  editEntry?: CellarEntryData | null
}

const WINE_TYPES = ['red', 'white', 'rosé', 'sparkling', 'dessert', 'other']
const STATUS_OPTIONS = [
  { value: 'storing', label: 'Storing' },
  { value: 'ready', label: 'Ready to Drink' },
  { value: 'consumed', label: 'Consumed' },
]

export function AddCellarEntryModal({
  isOpen,
  onClose,
  onSaved,
  editEntry,
}: AddCellarEntryModalProps) {
  const { getToken } = useAuth()
  const isEditMode = !!editEntry

  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [isManual, setIsManual] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const searchResults =
    searchQuery.trim().length > 0
      ? SAMPLE_WINES.filter(
          (w) =>
            w.wineName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (w.winery && w.winery.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (w.region && w.region.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : []

  const [form, setForm] = useState({
    wineName: '',
    winery: '',
    type: '',
    region: '',
    vintage: '',
    quantity: '1',
    purchaseDate: '',
    storageLocation: '',
    status: 'storing',
    notes: '',
  })

  useEffect(() => {
    if (isOpen && editEntry) {
      setForm({
        wineName: editEntry.wineName || '',
        winery: editEntry.winery || '',
        type: editEntry.type || '',
        region: editEntry.region || '',
        vintage: editEntry.vintage ? String(editEntry.vintage) : '',
        quantity: String(editEntry.quantity ?? 1),
        purchaseDate: editEntry.purchaseDate || '',
        storageLocation: editEntry.storageLocation || '',
        status: editEntry.status || 'storing',
        notes: editEntry.notes || '',
      })
      setIsManual(true)
    } else if (isOpen && !editEntry) {
      resetForm()
    }
  }, [isOpen, editEntry])

  function resetForm() {
    setForm({
      wineName: '',
      winery: '',
      type: '',
      region: '',
      vintage: '',
      quantity: '1',
      purchaseDate: '',
      storageLocation: '',
      status: 'storing',
      notes: '',
    })
    setSearchQuery('')
    setShowDropdown(false)
    setIsManual(false)
    setErrorMsg('')
  }

  function handleClose() {
    resetForm()
    onClose()
  }

  function setField(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setField('wineName', value)
    setShowDropdown(value.trim().length > 0)
  }

  function selectWineFromSearch(wine: WineResult) {
    setForm({
      wineName: wine.wineName,
      winery: wine.winery || '',
      type: wine.type || '',
      region: wine.region || '',
      vintage: wine.vintage ? String(wine.vintage) : '',
      quantity: '1',
      purchaseDate: '',
      storageLocation: '',
      status: 'storing',
      notes: '',
    })
    setSearchQuery(wine.wineName)
    setShowDropdown(false)
    setIsManual(true)
  }

  async function handleSubmit() {
    if (!form.wineName.trim()) return
    const qty = Number(form.quantity)
    if (form.quantity === '' || isNaN(qty) || qty < 0) return

    setIsSubmitting(true)
    setErrorMsg('')
    try {
      const token = await getToken()
      const payload = {
        wineName: form.wineName.trim(),
        winery: form.winery.trim() || undefined,
        type: form.type || undefined,
        region: form.region.trim() || undefined,
        vintage: form.vintage ? Number(form.vintage) : undefined,
        quantity: qty,
        purchaseDate: form.purchaseDate || undefined,
        storageLocation: form.storageLocation.trim() || undefined,
        status: form.status,
        notes: form.notes.trim() || undefined,
      }

      const url = isEditMode
        ? `${SERVER_URL}/api/inventory/${editEntry!._id}`
        : `${SERVER_URL}/api/inventory`
      const method = isEditMode ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.message || `Request failed (${res.status})`)
      }
      onSaved()
      handleClose()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  const canSubmit =
    form.wineName.trim().length > 0 &&
    form.quantity !== '' &&
    Number(form.quantity) >= 0 &&
    !isSubmitting

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-lg mx-4 rounded-2xl shadow-2xl overflow-y-auto"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid #F0E8E0' }}
        >
          <h2
            className="text-xl"
            style={{ fontFamily: "'Playfair Display', serif", color: '#722F37' }}
          >
            {isEditMode ? 'Edit Cellar Entry' : 'Add to Cellar'}
          </h2>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9A9A9A' }}
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
                  style={{ color: '#9A9A9A' }}
                />
                <input
                  type="text"
                  placeholder="Search by name…"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div
                  className="absolute w-full mt-1 rounded-xl shadow-lg z-10 overflow-hidden"
                  style={{ backgroundColor: '#fff', border: '1px solid #F0E8E0' }}
                >
                  {searchResults.map((wine) => (
                    <button
                      key={wine.id}
                      className="w-full text-left px-4 py-3 transition-colors"
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#FDF6EE'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                      onClick={() => selectWineFromSearch(wine)}
                    >
                      <p
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '14px',
                          color: '#2A2A2A',
                        }}
                      >
                        {wine.wineName}
                      </p>
                      {(wine.winery || wine.region) && (
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '12px',
                            color: '#7A7A7A',
                          }}
                        >
                          {[wine.winery, wine.region].filter(Boolean).join(' · ')}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {!isManual && (
                <button
                  className="mt-2 text-sm underline"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#722F37',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
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
                  onChange={(e) => setField('wineName', e.target.value)}
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
                    onChange={(e) => setField('winery', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setField('type', e.target.value)}
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
                    onChange={(e) => setField('region', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Vintage</label>
                  <input
                    type="number"
                    placeholder="e.g. 2018"
                    value={form.vintage}
                    onChange={(e) => setField('vintage', e.target.value)}
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
                    onChange={(e) => setField('quantity', e.target.value)}
                    style={inputStyle}
                    min={0}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Purchase Date</label>
                  <input
                    type="date"
                    value={form.purchaseDate}
                    onChange={(e) => setField('purchaseDate', e.target.value)}
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
                    onChange={(e) => setField('storageLocation', e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setField('status', e.target.value)}
                    style={inputStyle}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea
                  placeholder="Tasting notes, occasion, etc."
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  rows={3}
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4" style={{ borderTop: '1px solid #F0E8E0' }}>
          {errorMsg && (
            <p
              className="mb-3 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif", color: '#C0392B' }}
            >
              {errorMsg}
            </p>
          )}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              style={{
                background: 'none',
                border: '1px solid #D0C8C0',
                borderRadius: '999px',
                padding: '8px 20px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                color: '#6B6B6B',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            {(isManual || isEditMode) && (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  backgroundColor: canSubmit ? '#722F37' : '#C0A8A8',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '8px 24px',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#fff',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                }}
              >
                {isSubmitting ? 'Saving…' : isEditMode ? 'Save Changes' : 'Add to Cellar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '12px',
  fontWeight: 500,
  color: '#6B6B6B',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  borderRadius: '10px',
  border: '1px solid #E0D8D0',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  color: '#2A2A2A',
  backgroundColor: '#FAFAFA',
  outline: 'none',
  boxSizing: 'border-box',
}
