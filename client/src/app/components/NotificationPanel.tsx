import { useState } from "react";

interface Notification {
  id: number;
  wineName: string;
  description: string;
  statusText: string;
  statusColor: string;
  timestamp: string;
  isRead: boolean;
  targetMet: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: Notification[] = [
  {
    id: 1,
    wineName: "Château Margaux 2018",
    description: "Price dropped from $95 to $72",
    statusText: "Your target: $75 — Target met!",
    statusColor: "#2E7D32",
    timestamp: "2 min ago",
    isRead: false,
    targetMet: true
  },
  {
    id: 2,
    wineName: "Barolo Riserva 2016",
    description: "Price dropped from $85 to $68",
    statusText: "Your target: $75 — Target met!",
    statusColor: "#2E7D32",
    timestamp: "1 hour ago",
    isRead: false,
    targetMet: true
  },
  {
    id: 3,
    wineName: "Dom Pérignon 2012",
    description: "Price dropped from $295 to $285",
    statusText: "Your target: $250 — Still watching",
    statusColor: "#9A9A9A",
    timestamp: "3 hours ago",
    isRead: true,
    targetMet: false
  }
];

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const readNotifications = notifications.filter(n => n.isRead);
  const newCount = unreadNotifications.length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

  const handleNotificationClick = (id: number) => {
    // Mark as read
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
    // In a real app, this would scroll to the wine card
    console.log("Navigate to wine card:", id);
  };

  const getDotColor = (notification: Notification) => {
    if (notification.isRead) return "#9A9A9A"; // Gray for read
    if (notification.targetMet) return "#2E7D32"; // Green for unread + target met
    return "#C9A96E"; // Amber/gold for unread + target not met
  };

  return (
    <>
      {/* Invisible overlay to close dropdown when clicking outside */}
      <div 
        className="fixed inset-0"
        style={{ zIndex: 999 }}
        onClick={onClose}
      />
      
      {/* Notification Panel */}
      <div 
        className="absolute right-0 top-full mt-2 bg-white flex flex-col"
        style={{ 
          width: '360px',
          maxHeight: '420px',
          borderRadius: '12px',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        {/* Header - Fixed */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: '#F0F0F0' }}
        >
          <h3 
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontWeight: 600,
              color: '#2A2A2A',
              fontSize: '15px'
            }}
          >
            Notifications
          </h3>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleMarkAllRead}
              className="transition-opacity"
              style={{ 
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: '#757575',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Mark all read
            </button>
            {newCount > 0 && (
              <div 
                className="px-2 py-0.5 rounded-full"
                style={{ 
                  backgroundColor: '#E8F5E9',
                  color: '#2E7D32',
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  fontSize: '11px'
                }}
              >
                {newCount} new
              </div>
            )}
          </div>
        </div>

        {/* Notification List - Scrollable */}
        <div 
          className="overflow-y-auto flex-1"
          style={{ 
            maxHeight: '340px'
          }}
        >
          {/* New Section */}
          {unreadNotifications.length > 0 && (
            <>
              <div 
                className="px-5 py-2"
                style={{ 
                  backgroundColor: '#FAFAFA'
                }}
              >
                <span 
                  style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#9A9A9A',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  New
                </span>
              </div>
              {unreadNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="px-5 py-4 transition-all cursor-pointer relative"
                  style={{ 
                    backgroundColor: hoveredId === notification.id 
                      ? '#F0F9F1' 
                      : '#F5FBF5'
                  }}
                  onClick={() => handleNotificationClick(notification.id)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex gap-3">
                    {/* Status Dot */}
                    <div className="flex-shrink-0 pt-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: getDotColor(notification)
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          style={{ 
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: 700,
                            color: '#2A2A2A',
                            lineHeight: '1.4'
                          }}
                        >
                          {notification.wineName}
                        </h4>
                        {hoveredId === notification.id && (
                          <span 
                            style={{ 
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#722F37',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View wine ›
                          </span>
                        )}
                      </div>
                      <p 
                        className="mb-1"
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: '#5A5A5A',
                          lineHeight: '1.4'
                        }}
                      >
                        {notification.description}
                      </p>
                      <p 
                        className="mb-1.5"
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: notification.statusColor,
                          lineHeight: '1.4'
                        }}
                      >
                        {notification.statusText}
                      </p>
                      <p 
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '11px',
                          color: '#9A9A9A'
                        }}
                      >
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Earlier Section */}
          {readNotifications.length > 0 && (
            <>
              <div 
                className="px-5 py-2"
                style={{ 
                  backgroundColor: '#FAFAFA'
                }}
              >
                <span 
                  style={{ 
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '10px',
                    fontWeight: 600,
                    color: '#9A9A9A',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}
                >
                  Earlier
                </span>
              </div>
              {readNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="px-5 py-4 transition-all cursor-pointer relative"
                  style={{ 
                    backgroundColor: hoveredId === notification.id 
                      ? '#F9F9F9' 
                      : '#ffffff'
                  }}
                  onClick={() => handleNotificationClick(notification.id)}
                  onMouseEnter={() => setHoveredId(notification.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex gap-3">
                    {/* Status Dot */}
                    <div className="flex-shrink-0 pt-1">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ 
                          backgroundColor: getDotColor(notification)
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          style={{ 
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: '13px',
                            fontWeight: 400,
                            color: '#2A2A2A',
                            lineHeight: '1.4'
                          }}
                        >
                          {notification.wineName}
                        </h4>
                        {hoveredId === notification.id && (
                          <span 
                            style={{ 
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: '12px',
                              color: '#722F37',
                              fontWeight: 500,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            View wine ›
                          </span>
                        )}
                      </div>
                      <p 
                        className="mb-1"
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: '#5A5A5A',
                          lineHeight: '1.4'
                        }}
                      >
                        {notification.description}
                      </p>
                      <p 
                        className="mb-1.5"
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '12px',
                          color: notification.statusColor,
                          lineHeight: '1.4'
                        }}
                      >
                        {notification.statusText}
                      </p>
                      <p 
                        style={{ 
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: '11px',
                          color: '#9A9A9A'
                        }}
                      >
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer - Fixed */}
        <div 
          className="px-5 py-3 border-t text-center flex-shrink-0 bg-white"
          style={{ 
            borderColor: '#F0F0F0',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px'
          }}
        >
          <a 
            href="#all-notifications"
            className="transition-opacity inline-block"
            style={{ 
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: '#722F37',
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            View all notifications
          </a>
        </div>
      </div>
    </>
  );
}
