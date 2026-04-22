import { useEffect, useState } from "react";
import { User, Bell } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

export function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [allowNotifications, setAllowNotifications] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function fetchPreference() {
      if (!isLoaded) return;

      if (!user) {
        setError("You need to sign in to view profile settings.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const token = await getToken();

        const token = await getToken();
        const response = await fetch(
          `${SERVER_URL}/api/social/notification-preference`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) {
          throw new Error("Failed to load notification preference.");
        }

        const result = await response.json();
        setAllowNotifications(result.data.allowNotifications);
      } catch (err) {
        console.error(err);
        setError("Could not load notification preference.");
      } finally {
        setLoading(false);
      }
    }

    fetchPreference();
  }, [getToken, isLoaded, user]);

  async function handleTogglePreference() {
    if (!user || saving) return;

    const nextValue = !allowNotifications;

    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      const token = await getToken();

      const token = await getToken();
      const response = await fetch(
        `${SERVER_URL}/api/social/notification-preference`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ allowNotifications: nextValue }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update notification preference.");
      }

      const result = await response.json();
      setAllowNotifications(result.data.allowNotifications);
      setSuccessMessage("Notification preference updated.");
    } catch (err) {
      console.error(err);
      setError("Could not update notification preference.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-8 py-16">
      <div className="max-w-3xl mx-auto">
        <div
          className="rounded-[28px] p-8"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #EAEAEA",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center rounded-full"
                style={{
                  width: "72px",
                  height: "72px",
                  backgroundColor: "#FDF6EE",
                }}
              >
                <User
                  className="w-9 h-9"
                  style={{
                    color: "#722F37",
                    strokeWidth: 1.5,
                  }}
                />
              </div>

              <div>
                <h1
                  className="text-4xl mb-2"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#722F37",
                    lineHeight: "1.2",
                  }}
                >
                  Your Profile
                </h1>
                <p
                  className="text-base"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#7A7A7A",
                  }}
                >
                  Manage your social notification settings.
                </p>
              </div>
            </div>
          </div>

          <div
            className="rounded-[22px] p-6"
            style={{
              backgroundColor: "#FCFCFC",
              border: "1px solid #EEEEEE",
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-4">
                <div
                  className="flex items-center justify-center rounded-full"
                  style={{
                    width: "48px",
                    height: "48px",
                    backgroundColor: "#FDF6EE",
                  }}
                >
                  <Bell className="w-5 h-5" style={{ color: "#722F37" }} />
                </div>

                <div>
                  <h2
                    className="text-2xl mb-2"
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      color: "#722F37",
                    }}
                  >
                    Social Notifications
                  </h2>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "14px",
                      color: "#7A7A7A",
                      lineHeight: "1.6",
                    }}
                  >
                    Choose whether you want to receive social notifications.
                    New users default to allow.
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start md:items-end gap-3">
                <button
                  onClick={handleTogglePreference}
                  disabled={loading || saving || !user}
                  className="px-6 py-3 rounded-full transition-all"
                  style={{
                    backgroundColor: allowNotifications ? "#722F37" : "#E0E0E0",
                    color: allowNotifications ? "#ffffff" : "#5A5A5A",
                    border: "none",
                    cursor: loading || saving || !user ? "not-allowed" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                    fontWeight: 500,
                    minWidth: "180px",
                    opacity: loading || saving || !user ? 0.7 : 1,
                  }}
                >
                  {loading
                    ? "Loading..."
                    : saving
                    ? "Saving..."
                    : allowNotifications
                    ? "Allowed"
                    : "Disallowed"}
                </button>

                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#8A8A8A",
                  }}
                >
                  Click the button to toggle your preference.
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div
              className="mt-6 rounded-[16px] px-4 py-3"
              style={{
                backgroundColor: "#FBEAEA",
                color: "#B71C1C",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              }}
            >
              {error}
            </div>
          )}

          {successMessage && (
            <div
              className="mt-6 rounded-[16px] px-4 py-3"
              style={{
                backgroundColor: "#EEF7EF",
                color: "#2E7D32",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
              }}
            >
              {successMessage}
            </div>
          )}

          {user && (
            <div
              className="mt-6 rounded-[16px] px-4 py-3"
              style={{
                backgroundColor: "#F8F8F8",
                color: "#7A7A7A",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "13px",
              }}
            >
              Current DB user id: <strong>{user.clerkId}</strong>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
