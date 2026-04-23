import { Bell } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { NotificationPanel } from "./NotificationPanel";
import { UserDropdown } from "./UserDropdown";

export interface ApiNotification {
  _id: string;
  wineId: string;
  wineName: string;
  wineUrl?: string;
  previousPrice: number | null;
  currentPrice: number;
  targetPrice: number;
  isRead: boolean;
  createdAt: string;
}

export function NavigationBar() {
  const navLinks = [
    { name: "Discover", path: "/discover" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Cellar", path: "/cellar" },
    { name: "Review", path: "/reviews" },
    { name: "Profile", path: "/profile" },
    { name: "Social", path: "/social" },
  ];

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<ApiNotification[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      const res = await fetch("/api/notifications", {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data ?? []);
    } catch {
      // Non-critical — badge simply won't show
    }
  }, [isSignedIn, getToken]);

  // Fetch on sign-in
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Re-fetch when wishlist triggers a potential new notification
  useEffect(() => {
    const handler = () => fetchNotifications();
    window.addEventListener("vinovault:notifications-refresh", handler);
    return () => window.removeEventListener("vinovault:notifications-refresh", handler);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
    try {
      const token = await getToken();
      await fetch(`/api/notifications?id=${id}`, {
        method: "PATCH",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
    } catch {
      // Revert on failure
      await fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const token = await getToken();
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
    } catch {
      await fetchNotifications();
    }
  };

  const handleClearAll = async () => {
    setNotifications([]);
    try {
      const token = await getToken();
      await fetch("/api/notifications", {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
    } catch {
      await fetchNotifications();
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-8 py-5">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/wishlist" style={{ textDecoration: 'none' }}>
              <h1
                className="text-2xl font-serif"
                style={{ fontFamily: "'Playfair Display', serif", color: '#722F37' }}
              >
                VinoVault
              </h1>
            </Link>
          </div>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const isGrayedOut =
                !isSignedIn &&
                (link.name === "Discover" || link.name === "Cellar" || link.name === "Profile" || link.name === "Review");

              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm transition-all"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: isGrayedOut ? '#C0C0C0' : isActive ? '#722F37' : '#5A5A5A',
                    fontWeight: isActive ? 600 : 400,
                    cursor: isGrayedOut ? 'default' : 'pointer',
                    textDecoration: 'none',
                    pointerEvents: isGrayedOut ? 'none' : 'auto',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive && !isGrayedOut) e.currentTarget.style.color = '#722F37';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive && !isGrayedOut) e.currentTarget.style.color = '#5A5A5A';
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

                    {/* Badge — only shown when there are unread notifications */}
                    {unreadCount > 0 && (
                      <div
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                        style={{
                          backgroundColor: '#722F37',
                          color: '#ffffff',
                          fontSize: '9px',
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </div>
                    )}
                  </button>

                  <NotificationPanel
                    isOpen={isNotificationOpen}
                    onClose={() => setIsNotificationOpen(false)}
                    notifications={notifications}
                    onMarkRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                    onClearAll={handleClearAll}
                  />
                </div>

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
                  padding: 0,
                }}
                onClick={() => navigate('/login')}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.7'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
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
