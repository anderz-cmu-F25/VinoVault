import { Bell } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { NotificationPanel } from "./NotificationPanel";
import { UserDropdown } from "./UserDropdown";

export function NavigationBar() {
  const navLinks = [
    { name: "Discover", path: "/discover" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Cellar", path: "/cellar" },
    { name: "Profile", path: "/profile" }
  ];
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/wishlist" style={{ textDecoration: 'none' }}>
              <h1 className="text-2xl font-serif" style={{ fontFamily: "'Playfair Display', serif", color: '#722F37' }}>
                VinoVault
              </h1>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isGrayedOut = !isSignedIn && (link.name === "Discover" || link.name === "Cellar" || link.name === "Profile");

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isGrayedOut ? '#C0C0C0' : (isActive ? '#722F37' : '#5A5A5A'),
                    fontWeight: isActive ? 600 : 400,
                    cursor: isGrayedOut ? 'default' : 'pointer',
                    textDecoration: 'none',
                    pointerEvents: isGrayedOut ? 'none' : 'auto'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isGrayedOut) {
                      e.currentTarget.style.color = '#722F37';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isGrayedOut) {
                      e.currentTarget.style.color = '#5A5A5A';
                    }
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-5">
            {isSignedIn ? (
              <>
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors relative"
                    aria-label="Notifications"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Bell className="w-5 h-5" style={{ color: '#5A5A5A' }} />
                    {/* Notification Badge */}
                    <div
                      className="absolute top-1 right-1 w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#722F37' }}
                    />
                  </button>

                  {/* Notification Panel */}
                  <NotificationPanel
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                  />
                </div>

                {/* User Dropdown */}
                <UserDropdown />
              </>
            ) : (
              <button
                className="transition-opacity"
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#722F37',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: 0
                }}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.7';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
