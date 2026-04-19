import { useState } from "react";
import type { ApiNotification } from "./NavigationBar";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ApiNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function NotificationPanel({
  isOpen,
  onClose,
  notifications,
  onMarkRead,
  onMarkAllRead,
}: NotificationPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!isOpen) return null;

  const unread = notifications.filter((n) => !n.isRead);
  const read   = notifications.filter((n) => n.isRead);

  const getDotColor = (n: ApiNotification) => {
    if (n.isRead) return "#9A9A9A";
    return n.currentPrice <= n.targetPrice ? "#2E7D32" : "#C9A96E";
  };

  const renderItem = (n: ApiNotification) => {
    const targetMet = n.currentPrice <= n.targetPrice;
    const description = n.previousPrice != null
      ? `Price dropped from $${n.previousPrice.toFixed(2)} to $${n.currentPrice.toFixed(2)}`
      : `Now at $${n.currentPrice.toFixed(2)}`;
    const statusText = targetMet
      ? `Your target: $${n.targetPrice.toFixed(2)} — Target met!`
      : `Your target: $${n.targetPrice.toFixed(2)} — Still watching`;
    const statusColor = targetMet ? "#2E7D32" : "#9A9A9A";

    return (
      <div
        key={n._id}
        className="px-5 py-4 transition-all cursor-pointer relative"
        style={{
          backgroundColor: hoveredId === n._id
            ? (n.isRead ? '#F9F9F9' : '#F0F9F1')
            : (n.isRead ? '#ffffff' : '#F5FBF5'),
        }}
        onClick={() => onMarkRead(n._id)}
        onMouseEnter={() => setHoveredId(n._id)}
        onMouseLeave={() => setHoveredId(null)}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 pt-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getDotColor(n) }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '13px',
                  fontWeight: n.isRead ? 400 : 700,
                  color: '#2A2A2A',
                  lineHeight: '1.4',
                }}
              >
                {n.wineName}
              </h4>
              {hoveredId === n._id && (
                <span
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '12px',
                    color: '#722F37',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  View wine ›
                </span>
              )}
            </div>
            <p className="mb-1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#5A5A5A', lineHeight: '1.4' }}>
              {description}
            </p>
            <p className="mb-1.5" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: statusColor, lineHeight: '1.4' }}>
              {statusText}
            </p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#9A9A9A' }}>
              {timeAgo(n.createdAt)}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0" style={{ zIndex: 999 }} onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute right-0 top-full mt-2 bg-white flex flex-col"
        style={{
          width: '360px',
          maxHeight: '420px',
          borderRadius: '12px',
          zIndex: 1000,
          boxShadow: '0 10px 40px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
          style={{ borderColor: '#F0F0F0' }}
        >
          <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#2A2A2A', fontSize: '15px' }}>
            Notifications
          </h3>
          <div className="flex items-center gap-2.5">
            {unread.length > 0 && (
              <button
                onClick={onMarkAllRead}
                className="transition-opacity"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#757575', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.6'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              >
                Mark all read
              </button>
            )}
            {unread.length > 0 && (
              <div
                className="px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: '11px' }}
              >
                {unread.length} new
              </div>
            )}
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1" style={{ maxHeight: '340px' }}>
          {notifications.length === 0 ? (
            <div
              className="px-5 py-10 text-center"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#9A9A9A' }}
            >
              No notifications yet.<br />
              <span style={{ fontSize: '12px' }}>You'll hear from us when a price drops.</span>
            </div>
          ) : (
            <>
              {unread.length > 0 && (
                <>
                  <div className="px-5 py-2" style={{ backgroundColor: '#FAFAFA' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, color: '#9A9A9A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      New
                    </span>
                  </div>
                  {unread.map(renderItem)}
                </>
              )}
              {read.length > 0 && (
                <>
                  <div className="px-5 py-2" style={{ backgroundColor: '#FAFAFA' }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '10px', fontWeight: 600, color: '#9A9A9A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                      Earlier
                    </span>
                  </div>
                  {read.map(renderItem)}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-5 py-3 border-t text-center flex-shrink-0 bg-white"
          style={{ borderColor: '#F0F0F0', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}
        >
          <span
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#C0C0C0', fontWeight: 500 }}
          >
            Prices checked daily at 08:00 UTC
          </span>
        </div>
      </div>
    </>
  );
}
