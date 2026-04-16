import { Bell, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { NotificationPanel } from "./NotificationPanel";

export function NavigationBar() {
  const navLinks = [
    { name: "Discover", path: "/discover" },
    { name: "Wishlist", path: "/wishlist" },
    { name: "Cellar", path: "/cellar" },
    { name: "Profile", path: "/profile" }
  ];
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const location = useLocation();

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
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm transition-all"
                  style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    color: isActive ? '#722F37' : '#5A5A5A',
                    fontWeight: isActive ? 600 : 400,
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#722F37';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#5A5A5A';
                    }
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Right Section - Bell and Avatar */}
          <div className="flex items-center space-x-5">
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
            
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ backgroundColor: '#722F37', cursor: 'pointer', border: 'none' }}
              aria-label="User profile"
            >
              <User className="w-5 h-5" style={{ color: '#ffffff' }} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}