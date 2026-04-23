import { Pencil } from 'lucide-react'
import { useState, useEffect } from 'react'

interface EditWineModalProps {
  isOpen: boolean
  wineName: string
  currentTargetPrice: number
  onCancel: () => void
  onConfirm: (newPrice: number) => void
}

export function EditWineModal({
  isOpen,
  wineName,
  currentTargetPrice,
  onCancel,
  onConfirm,
}: EditWineModalProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (isOpen) {
      setValue(String(currentTargetPrice))
    }
  }, [isOpen, currentTargetPrice])

  if (!isOpen) return null

  const canSave = value.trim() !== '' && Number(value) > 0

  const handleConfirm = () => {
    if (!canSave) return
    onConfirm(Number(value))
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
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
            maxWidth: '380px',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '32px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <Pencil style={{ width: '40px', height: '40px', color: '#722F37', strokeWidth: 1.5 }} />
          </div>

          {/* Heading */}
          <h2
            className="text-center mb-3"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '20px',
              color: '#722F37',
              lineHeight: '1.3',
            }}
          >
            Update Target Price
          </h2>

          {/* Subtext */}
          <p
            className="text-center mb-6"
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              color: '#7A7A7A',
              lineHeight: '1.5',
            }}
          >
            Set a new target price for{' '}
            <span style={{ color: '#2A2A2A', fontWeight: 500 }}>{wineName}</span>.
          </p>

          {/* Input */}
          <div className="mb-6">
            <label
              className="block text-sm mb-2"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: '#2A2A2A',
                fontWeight: 500,
              }}
            >
              New Target Price
            </label>
            <input
              type="text"
              placeholder="$0.00"
              value={value}
              onChange={(e) => {
                const cleaned = e.target.value.replace(/[^0-9.]/g, '')
                setValue(cleaned)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && canSave) handleConfirm()
                if (e.key === 'Escape') onCancel()
              }}
              autoFocus
              className="w-full px-4 py-2.5 rounded-lg border transition-colors"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                borderColor: '#E0E0E0',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#722F37'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#E0E0E0'
              }}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              className="flex-1 transition-all"
              style={{
                height: '40px',
                borderRadius: '8px',
                backgroundColor: 'transparent',
                border: '1px solid #D0D0D0',
                color: '#2A2A2A',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onClick={onCancel}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F5F5F5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              Cancel
            </button>

            <button
              className="flex-1 transition-all"
              disabled={!canSave}
              style={{
                height: '40px',
                borderRadius: '8px',
                backgroundColor: canSave ? '#722F37' : '#D0D0D0',
                border: 'none',
                color: '#ffffff',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                cursor: canSave ? 'pointer' : 'not-allowed',
                opacity: canSave ? 1 : 0.6,
              }}
              onClick={handleConfirm}
              onMouseEnter={(e) => {
                if (canSave) e.currentTarget.style.backgroundColor = '#5e2529'
              }}
              onMouseLeave={(e) => {
                if (canSave) e.currentTarget.style.backgroundColor = '#722F37'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
