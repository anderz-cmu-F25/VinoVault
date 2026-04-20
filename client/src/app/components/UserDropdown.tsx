import { useState, useRef, useEffect } from "react";
import { User, Heart, Wine, Bell, Settings, LogOut, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { SignOutModal } from "./SignOutModal";
import { useCurrentUser } from "../hooks/useCurrentUser";

export function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, clerkUser } = useCurrentUser();
  const { signOut } = useClerk();

  const userName = user?.username || clerkUser?.fullName || clerkUser?.firstName || "User";
  const userEmail = user?.email || clerkUser?.primaryEmailAddress?.emailAddress || "";
  const userInitials =
    ((userName[0] ?? "") + (userName[1] ?? "")).toUpperCase() || "U";

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const menuItems = [
    { label: "My Profile", icon: User, path: "/profile" },
    { label: "My Wishlist", icon: Heart, path: "/wishlist" },
    { label: "My Cellar", icon: Wine, path: "/cellar" },
    { label: "Notification Settings", icon: Bell, path: "/settings/notifications" },
    { label: "Account Settings", icon: Settings, path: "/settings/account" },
    { label: "Social", icon: MessageCircle, path: "/social" },
  ];

  const handleMenuItemClick = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleSignOut = () => {
    setIsOpen(false);
    setIsSignOutModalOpen(true);
  };

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
          border: 'none'
        }}
        aria-label="User menu"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <span
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            fontWeight: 500,
            color: '#ffffff'
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
            overflow: 'hidden'
          }}
        >
          {/* User Info Section */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid #E0E0E0'
            }}
          >
            {/* Large Avatar */}
            <div
              className="flex items-center justify-center mx-auto mb-3"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#722F37'
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#ffffff'
                }}
              >
                {userInitials}
              </span>
            </div>

            {/* User Name */}
            <div
              className="text-center mb-1"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 500,
                color: '#2A2A2A'
              }}
            >
              {userName}
            </div>

            {/* User Email */}
            <div
              className="text-center"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#7A7A7A'
              }}
            >
              {userEmail}
            </div>
          </div>

          {/* Menu Items */}
          <div style={{ borderBottom: '1px solid #E0E0E0' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
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
                    color: '#2A2A2A'
                  }}
                  onClick={() => handleMenuItemClick(item.path)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon
                    style={{
                      width: '16px',
                      height: '16px',
                      color: '#7A7A7A'
                    }}
                  />
                  <span>{item.label}</span>
                </button>
              );
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
              color: '#B71C1C'
            }}
            onClick={handleSignOut}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFEBEE';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LogOut
              style={{
                width: '16px',
                height: '16px',
                color: '#B71C1C'
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
  );
}
