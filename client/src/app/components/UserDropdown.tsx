import { useState, useRef, useEffect } from 'react'

import { Compass, Heart, Wine, LogOut, MessageCircle, Star, Pencil, Check, X } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'
import { SignOutModal } from './SignOutModal'
import { useCurrentUser } from '../hooks/useCurrentUser'

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false)
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [usernameError, setUsernameError] = useState('')
  const [isSavingUsername, setIsSavingUsername] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const usernameInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user, clerkUser, updateUsername } = useCurrentUser()
  const { signOut } = useClerk()

  const userName = user?.username || clerkUser?.fullName || clerkUser?.firstName || 'User'
  const userEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || ''
  const userInitials = ((userName[0] ?? '') + (userName[1] ?? '')).toUpperCase() || 'U'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleUsernameClick = () => {
    setUsernameInput(userName)
    setUsernameError('')
    setIsEditingUsername(true)
    setTimeout(() => usernameInputRef.current?.select(), 0)
  }

  const handleUsernameSave = async () => {
    const trimmed = usernameInput.trim()
    if (!trimmed || trimmed === userName) {
      setIsEditingUsername(false)
      return
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      setUsernameError("Username can only contain letters, numbers, - or _");
      return;
    }
    setIsSavingUsername(true);
    setUsernameError("");
    try {
      await updateUsername(trimmed)
      setIsEditingUsername(false)
    } catch (err: any) {
      setUsernameError(err.message || 'Failed to update username')
    } finally {
      setIsSavingUsername(false)
    }
  }

  const handleUsernameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleUsernameSave()
    if (e.key === 'Escape') setIsEditingUsername(false)
  }

  const menuItems = [
    { label: 'Discover', icon: Compass, path: '/discover' },
    { label: 'My Wishlist', icon: Heart, path: '/wishlist' },
    { label: 'My Cellar', icon: Wine, path: '/cellar' },
    { label: 'My Reviews', icon: Star, path: '/reviews' },
    { label: 'Social', icon: MessageCircle, path: '/social' },
  ]

  const handleMenuItemClick = (path: string) => {
    setIsOpen(false)
    navigate(path)
  }

  const handleSignOut = () => {
    setIsOpen(false)
    setIsSignOutModalOpen(true)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Button */}
      <button
        className="rounded-full flex items-center justify-center transition-transform"
        style={{
          width: '36px',
          height: '36px',
          backgroundColor: '#722F37',
          cursor: 'pointer',
          border: 'none',
        }}
        aria-label="User menu"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#ffffff',
          }}
        >
          {userInitials}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2"
          style={{
            minWidth: '240px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12)',
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {/* User Info Section */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #E0E0E0',
            }}
          >
            {/* Large Avatar */}
            <div
              className="flex items-center justify-center mx-auto mb-3"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#722F37',
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#ffffff',
                }}
              >
                {userInitials}
              </span>
            </div>

            {/* User Name */}
            <div className="flex items-center justify-center gap-1 mb-1">
              {isEditingUsername ? (
                <>
                  <input
                    ref={usernameInputRef}
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    onKeyDown={handleUsernameKeyDown}
                    disabled={isSavingUsername}
                    autoFocus
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#2A2A2A',
                      border: '1px solid #722F37',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      outline: 'none',
                      width: '140px',
                      textAlign: 'center',
                    }}
                  />
                  <button
                    onClick={handleUsernameSave}
                    disabled={isSavingUsername}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#722F37',
                    }}
                  >
                    <Check style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    onClick={() => setIsEditingUsername(false)}
                    disabled={isSavingUsername}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#7A7A7A',
                    }}
                  >
                    <X style={{ width: '14px', height: '14px' }} />
                  </button>
                </>
              ) : (
                <>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#2A2A2A',
                    }}
                  >
                    {userName}
                  </span>
                  <button
                    onClick={handleUsernameClick}
                    title="Edit username"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      color: '#7A7A7A',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Pencil style={{ width: '12px', height: '12px' }} />
                  </button>
                </>
              )}
            </div>
            {usernameError && (
              <div
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  color: '#B71C1C',
                  textAlign: 'center',
                  marginBottom: '4px',
                }}
              >
                {usernameError}
              </div>
            )}

            {/* User Email */}
            <div
              className="text-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#7A7A7A',
              }}
            >
              {userEmail}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ borderBottom: '1px solid #E0E0E0' }}>
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-3 transition-colors"
                  style={{
                    height: '44px',
                    padding: '0 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '13px',
                    fontWeight: 400,
                    color: '#2A2A2A',
                  }}
                  onClick={() => handleMenuItemClick(item.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Icon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: '#7A7A7A',
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </div>

          {/* Sign Out */}
          <button
            className="w-full flex items-center gap-3 transition-colors"
            style={{
              height: '44px',
              padding: '0 16px',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              fontWeight: 400,
              color: '#B71C1C',
            }}
            onClick={handleSignOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFEBEE'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
            }}
          >
            <LogOut
              style={{
                width: '16px',
                height: '16px',
                color: '#B71C1C',
              }}
            />
            <span>Sign out</span>
          </button>
        </div>
      )}
      <SignOutModal
        isOpen={isSignOutModalOpen}
        onCancel={() => setIsSignOutModalOpen(false)}
        onConfirm={() => signOut({ redirectUrl: '/login' })}
      />
    </div>
  )
}
