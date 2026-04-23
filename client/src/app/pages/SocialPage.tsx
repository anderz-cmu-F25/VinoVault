import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  CalendarDays,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useCurrentUser } from "../hooks/useCurrentUser";

const API_BASE =
  (import.meta.env.VITE_SERVER_URL || "http://localhost:3000") + "/api/social";

type RelationshipState =
  | "NO_FRIENDSHIP"
  | "REQUEST_SENT"
  | "REQUEST_RECEIVED"
  | "ACCEPTED_FRIENDSHIP"
  | "BLOCKED_FRIENDSHIP";

type FriendAction =
  | "send_request"
  | "cancel_request"
  | "accept_request"
  | "block_user"
  | "unblock_user"
  | "start_chat"
  | "view_profile"
  | "view_inventory"
  | "view_hosted_events";

type Friend = {
  id: string;
  name: string;
  status: "Online" | "Away" | "Offline";
  relationshipState: RelationshipState;
  blockedBy?: string | null;
  lastMessage?: string;
  unreadCount?: number;
};

type FriendRequest = {
  id: string;
  name: string;
  status: "Online" | "Away" | "Offline";
  relationshipState: RelationshipState;
};

type UserSearchResult = {
  id: string;
  username: string;
  relationshipState: RelationshipState;
  blockedYou: boolean;
};

type SocialEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  hostUserId?: string;
  description?: string;
  joined?: boolean;
};

function normalizeRelationshipState(
  raw: any,
  currentUserId?: string | null
): RelationshipState {
  const value = String(raw?.relationshipState || raw?.status || "").toUpperCase();

  if (value.includes("BLOCK")) return "BLOCKED_FRIENDSHIP";
  if (value.includes("ACCEPT")) return "ACCEPTED_FRIENDSHIP";

  if (value.includes("PENDING") || value.includes("REQUEST")) {
    if (
      currentUserId &&
      raw?.requestedBy &&
      String(raw.requestedBy) === String(currentUserId)
    ) {
      return "REQUEST_SENT";
    }
    return "REQUEST_RECEIVED";
  }

  if (value === "NO_FRIENDSHIP") return "NO_FRIENDSHIP";
  return "NO_FRIENDSHIP";
}

function getStatusColor(status: Friend["status"]) {
  switch (status) {
    case "Online":
      return "#4C8C4A";
    case "Away":
      return "#B7965D";
    default:
      return "#A0A0A0";
  }
}

function getRelationshipBadgeLabel(state: RelationshipState) {
  switch (state) {
    case "NO_FRIENDSHIP":
      return "No Friendship";
    case "REQUEST_SENT":
      return "Request Sent";
    case "REQUEST_RECEIVED":
      return "Request Received";
    case "ACCEPTED_FRIENDSHIP":
      return "Friends";
    case "BLOCKED_FRIENDSHIP":
      return "Blocked";
    default:
      return state;
  }
}

function formatEventDateTime(input?: string | Date) {
  if (!input) return { date: "TBD", time: "" };

  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    return { date: String(input), time: "" };
  }

  return {
    date: parsed.toLocaleDateString(),
    time: parsed.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function SocialPage() {
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuth();
  const { user: currentUser } = useCurrentUser();

  const currentUserId = currentUser?.clerkId || "";
  const currentUsername = currentUser?.username || "";

  const [friendSearch, setFriendSearch] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"All" | "Joined" | "Open">(
    "All"
  );

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [searchedUser, setSearchedUser] = useState<UserSearchResult | null>(null);

  const [isLoadingFriends, setIsLoadingFriends] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmittingCreateEvent, setIsSubmittingCreateEvent] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<SocialEvent | null>(null);

  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [createEventForm, setCreateEventForm] = useState({
    title: "",
    location: "",
    date: "",
    details: "",
  });

  async function authFetch(url: string, options: RequestInit = {}) {
    const token = await getToken();

    return fetch(url, {
      ...options,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        ...(options.headers || {}),
      },
    });
  }

  async function authJsonFetch(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    const response = await authFetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!contentType.includes("application/json")) {
      if (response.status === 404) {
        throw new Error("NOT_FOUND");
      }
      throw new Error(
        `Backend did not return JSON. Check API path/server. Response starts with: ${text.slice(
          0,
          100
        )}`
      );
    }

    const result = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(result.message || "Request failed.");
    }

    return result;
  }

  async function tryJsonEndpoints(urls: string[]) {
    for (const url of urls) {
      try {
        const result = await authJsonFetch(url);
        return result;
      } catch (error: any) {
        if (error?.message === "NOT_FOUND") continue;
        throw error;
      }
    }
    return null;
  }

  function normalizeFriend(item: any): Friend | null {
    const relationshipState = normalizeRelationshipState(item, currentUserId);

    const nestedUser =
      item.friend ||
      item.otherUser ||
      item.user ||
      item.friendUser ||
      item.targetUser ||
      item.profile ||
      null;

    const userAId = item.userAId || item.userA?.clerkId || item.userA?.id;
    const userBId = item.userBId || item.userB?.clerkId || item.userB?.id;

    let otherUserId =
      nestedUser?.clerkId ||
      nestedUser?.userId ||
      nestedUser?.id ||
      item.friendId ||
      item.otherUserId ||
      item.userId ||
      item.id ||
      "";

    if (!otherUserId && currentUserId) {
      if (String(userAId) === String(currentUserId)) {
        otherUserId = String(userBId || "");
      } else if (String(userBId) === String(currentUserId)) {
        otherUserId = String(userAId || "");
      }
    }

    if (!otherUserId) return null;

    let fallbackName = "Unknown User";
    if (currentUserId && userAId && userBId) {
      if (String(userAId) === String(currentUserId)) {
        fallbackName = String(item.userBUsername || "Unknown User");
      } else {
        fallbackName = String(item.userAUsername || "Unknown User");
      }
    }

    return {
      id: otherUserId,
      name:
        nestedUser?.username ||
        nestedUser?.name ||
        item.username ||
        item.name ||
        fallbackName,
      status: nestedUser?.onlineStatus || item.onlineStatus || "Offline",
      relationshipState,
      blockedBy: item.blockedBy || null,
      lastMessage: item.lastMessage,
      unreadCount: item.unreadCount || 0,
    };
  }

  const filteredFriends = useMemo(() => {
    if (!friendSearch.trim()) return friends;
    return friends.filter((friend) =>
      friend.name.toLowerCase().includes(friendSearch.toLowerCase())
    );
  }, [friendSearch, friends]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === "Joined") {
      return events.filter(
        (event) => event.joined || isCurrentUsersEvent(event)
      );
    }

    if (eventFilter === "Open") {
      return events.filter(
        (event) => !event.joined && !isCurrentUsersEvent(event)
      );
    }

    return events;
  }, [eventFilter, events, currentUserId, currentUsername]);

  function isCurrentUsersEvent(event: SocialEvent) {
    return (
      String(event.hostUserId || "") === String(currentUserId) ||
      String(event.host || "").toLowerCase() === String(currentUsername || "").toLowerCase()
    );
  }

  async function loadFriends() {
    try {
      setIsLoadingFriends(true);
      setErrorMessage("");

      const result = await tryJsonEndpoints([
        `${API_BASE}/friends`,
        `${API_BASE}/friendships`,
        `${API_BASE}/relationships`,
      ]);

      if (!result) {
        setFriends([]);
        return;
      }

      const rawFriends = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.friends)
        ? result.friends
        : Array.isArray(result?.data?.friends)
        ? result.data.friends
        : Array.isArray(result?.data?.relationships)
        ? result.data.relationships
        : Array.isArray(result?.relationships)
        ? result.relationships
        : [];

      const mappedFriends = rawFriends
        .map((item: any) => normalizeFriend(item))
        .filter(Boolean)
        .filter((friend: Friend | null) => {
          if (!friend) return false;
          return (
            friend.relationshipState === "ACCEPTED_FRIENDSHIP" ||
            friend.relationshipState === "BLOCKED_FRIENDSHIP"
          );
        }) as Friend[];

      setFriends(mappedFriends);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load friends.");
    } finally {
      setIsLoadingFriends(false);
    }
  }

  async function loadFriendRequests() {
    try {
      const result = await tryJsonEndpoints([
        `${API_BASE}/friend-requests`,
        `${API_BASE}/friends`,
      ]);

      if (!result) {
        setFriendRequests([]);
        return;
      }

      const rawRequests = Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.requests)
        ? result.requests
        : Array.isArray(result?.data?.requests)
        ? result.data.requests
        : Array.isArray(result?.data?.relationships)
        ? result.data.relationships
        : Array.isArray(result?.relationships)
        ? result.relationships
        : [];

      const mappedRequests: FriendRequest[] = rawRequests
        .map((item: any) => {
          const normalized = normalizeFriend(item);
          if (!normalized) return null;

          if (normalized.relationshipState !== "REQUEST_RECEIVED") return null;

          return {
            id: normalized.id,
            name: normalized.name,
            status: normalized.status,
            relationshipState: normalized.relationshipState,
          };
        })
        .filter(Boolean) as FriendRequest[];

      setFriendRequests(mappedRequests);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load friend requests.");
    }
  }

  async function loadEvents() {
    try {
      setIsLoadingEvents(true);
      setErrorMessage("");

      const result = await authJsonFetch(`${API_BASE}/events`);
      const rawEvents = Array.isArray(result.data)
        ? result.data
        : result.data?.events || [];

      const mappedEvents: SocialEvent[] = rawEvents.map((event: any) => {
        const { date, time } = formatEventDateTime(
          event.eventDate || event.date || event.createdAt
        );

        return {
          id: event._id || event.id,
          title: event.name || event.title,
          date,
          time,
          location: event.location || "TBD",
          host:
            event.hostUsername ||
            event.hostName ||
            event.host ||
            event.hostUserId ||
            "Unknown Host",
          hostUserId:
            event.hostUserId || event.hostId || event.createdBy || event.userId,
          description: event.details || event.description,
          joined: Boolean(event.joined ?? event.isJoined ?? false),
        };
      });

      setEvents(mappedEvents);
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load events.");
    } finally {
      setIsLoadingEvents(false);
    }
  }

  useEffect(() => {
    if (!isLoaded) return;
    loadFriends();
    loadFriendRequests();
    loadEvents();
  }, [isLoaded, currentUserId]);

  async function postRelationshipAction(
    friendId: string,
    action: "send-request" | "cancel-request" | "accept-request" | "block" | "unblock"
  ) {
    await authJsonFetch(`${API_BASE}/relationships/${friendId}/${action}`, {
      method: "POST",
    });

    await Promise.all([loadFriends(), loadFriendRequests()]);
  }

  async function handleFriendAction(friend: Friend, action: FriendAction) {
    try {
      setErrorMessage("");

      if (action === "start_chat") {
        navigate(`/social/chat/${friend.id}`);
        return;
      }

      if (action === "view_profile") {
        navigate(`/profile`);
        return;
      }

      if (action === "view_inventory") {
        navigate(`/cellar`);
        return;
      }

      if (action === "view_hosted_events") {
        setEventFilter("Joined");
        return;
      }

      if (action === "send_request") {
        await postRelationshipAction(friend.id, "send-request");
        return;
      }

      if (action === "cancel_request") {
        await postRelationshipAction(friend.id, "cancel-request");
        return;
      }

      if (action === "accept_request") {
        await postRelationshipAction(friend.id, "accept-request");
        return;
      }

      if (action === "block_user") {
        await postRelationshipAction(friend.id, "block");
        return;
      }

      if (action === "unblock_user") {
        await postRelationshipAction(friend.id, "unblock");
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to process friendship action.");
    }
  }

  async function handleSearchUserByUsername() {
    try {
      setErrorMessage("");
      setSearchedUser(null);

      if (!usernameSearch.trim()) return;

      const result = await tryJsonEndpoints([
        `${API_BASE}/users/search?username=${encodeURIComponent(usernameSearch.trim())}`,
      ]);

      if (!result) {
        setErrorMessage("User search endpoint is not available on the backend yet.");
        return;
      }

      const userResult = result.data?.user || result.data;

      if (!userResult) {
        setSearchedUser(null);
        return;
      }

      setSearchedUser({
        id: userResult.clerkId || userResult.userId || userResult.id,
        username: userResult.username || "Unknown User",
        relationshipState:
          normalizeRelationshipState(userResult, currentUserId) || "NO_FRIENDSHIP",
        blockedYou: Boolean(userResult.blockedYou),
      });
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to search user.");
    }
  }

  async function handleSendFriendRequestFromSearch() {
    if (!searchedUser) return;

    try {
      setErrorMessage("");
      await postRelationshipAction(searchedUser.id, "send-request");

      setSearchedUser((prev) =>
        prev
          ? {
              ...prev,
              relationshipState: "REQUEST_SENT",
            }
          : null
      );
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to send request.");
    }
  }

  async function submitCreateEvent() {
    try {
      if (
        !createEventForm.title.trim() ||
        !createEventForm.location.trim() ||
        !createEventForm.date.trim()
      ) {
        setErrorMessage("Please fill in title, location, and date.");
        return;
      }

      setIsSubmittingCreateEvent(true);
      setErrorMessage("");

      await authJsonFetch(`${API_BASE}/events`, {
        method: "POST",
        body: JSON.stringify({
          name: createEventForm.title,
          location: createEventForm.location,
          date: createEventForm.date,
          details: createEventForm.details,
        }),
      });

      setShowCreateEventModal(false);
      setCreateEventForm({
        title: "",
        location: "",
        date: "",
        details: "",
      });

      await loadEvents();
      setEventFilter("Joined");
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create event.");
    } finally {
      setIsSubmittingCreateEvent(false);
    }
  }

  async function handleViewEventDetails(eventId: string) {
    try {
      setErrorMessage("");
      const result = await authJsonFetch(`${API_BASE}/events/${eventId}`);
      const event = result.data?.event || result.data;

      const { date, time } = formatEventDateTime(
        event.eventDate || event.date || event.createdAt
      );

      setSelectedEvent({
        id: event._id || event.id,
        title: event.name || event.title,
        date,
        time,
        location: event.location || "TBD",
        host:
          event.hostUsername ||
          event.hostName ||
          event.host ||
          event.hostUserId ||
          "Unknown Host",
        hostUserId: event.hostUserId || event.hostId || event.createdBy || event.userId,
        description: event.details || event.description,
        joined: Boolean(event.joined ?? event.isJoined ?? false),
      });
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to load event details.");
    }
  }

  async function handleToggleJoin(eventId: string) {
    try {
      setErrorMessage("");

      const targetEvent = events.find((event) => event.id === eventId);
      if (!targetEvent) return;
      if (isCurrentUsersEvent(targetEvent)) return;

      const endpoint = targetEvent.joined ? "leave" : "join";

      await authJsonFetch(`${API_BASE}/events/${eventId}/${endpoint}`, {
        method: "POST",
      });

      await loadEvents();

      if (selectedEvent?.id === eventId) {
        setSelectedEvent(null);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update event participation.");
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#FDF6EE",
        padding: "32px 24px 48px",
      }}
    >
      <div style={{ maxWidth: "1220px", margin: "0 auto" }}>
        <section
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "24px",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: "64px",
                lineHeight: 1,
                color: "#722F37",
                fontWeight: 700,
              }}
            >
              Social
            </h1>
            <p
              style={{
                marginTop: "18px",
                marginBottom: 0,
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "16px",
                color: "#707070",
              }}
            >
              Chat with friends and join wine-related community events.
            </p>
          </div>

          <button
            onClick={() => setShowCreateEventModal(true)}
            style={{
              border: "none",
              borderRadius: "999px",
              backgroundColor: "#7B3139",
              color: "#FFFFFF",
              padding: "0 22px",
              height: "54px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "16px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <CalendarDays size={18} />
            Create Event
          </button>
        </section>

        {errorMessage && (
          <div
            style={{
              marginBottom: "24px",
              borderRadius: "20px",
              border: "1px solid #E7B9B9",
              backgroundColor: "#FBEAEA",
              color: "#B23B3B",
              padding: "16px 18px",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "14px",
            }}
          >
            {errorMessage}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "0.95fr 1.35fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9E3DD",
              borderRadius: "28px",
              padding: "26px 24px 28px",
              boxShadow: "0 10px 28px rgba(114, 47, 55, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    color: "#722F37",
                  }}
                >
                  Friends
                </h2>
                <p
                  style={{
                    marginTop: "6px",
                    marginBottom: 0,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "#7F7F7F",
                  }}
                >
                  State-driven relationship actions
                </p>
              </div>

              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "50%",
                  backgroundColor: "#F7EFE8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#7B3139",
                }}
              >
                <Users size={20} />
              </div>
            </div>

            <div
              style={{
                border: "1px solid #ECE6DF",
                borderRadius: "24px",
                padding: "22px",
                marginBottom: "22px",
                backgroundColor: "#FFFDFC",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  color: "#722F37",
                }}
              >
                Search by Username
              </h3>
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: "16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#8A8A8A",
                }}
              >
                Search a user and send a friend request if allowed
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "44px",
                    borderRadius: "999px",
                    border: "1px solid #DDD6D0",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <Search size={18} color="#A6A6A6" />
                  <input
                    value={usernameSearch}
                    onChange={(e) => setUsernameSearch(e.target.value)}
                    placeholder="Search username"
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      backgroundColor: "transparent",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "15px",
                      color: "#444444",
                    }}
                  />
                </div>

                <button
                  onClick={handleSearchUserByUsername}
                  style={{
                    height: "44px",
                    borderRadius: "999px",
                    border: "1px solid #7B3139",
                    backgroundColor: "#FFFFFF",
                    color: "#7B3139",
                    padding: "0 18px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Search
                </button>
              </div>

              {searchedUser && (
                <div
                  style={{
                    border: "1px solid #EEE7E0",
                    borderRadius: "18px",
                    padding: "16px",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "16px",
                          fontWeight: 700,
                          color: "#4D2F2F",
                        }}
                      >
                        {searchedUser.username}
                      </div>
                      <div
                        style={{
                          marginTop: "6px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "13px",
                          color: searchedUser.blockedYou ? "#B23B3B" : "#8A8A8A",
                        }}
                      >
                        {searchedUser.blockedYou
                          ? "This user has blocked you."
                          : getRelationshipBadgeLabel(searchedUser.relationshipState)}
                      </div>
                    </div>

                    <button
                      onClick={handleSendFriendRequestFromSearch}
                      disabled={
                        searchedUser.blockedYou ||
                        searchedUser.relationshipState !== "NO_FRIENDSHIP"
                      }
                      style={{
                        height: "42px",
                        borderRadius: "999px",
                        border:
                          searchedUser.blockedYou ||
                          searchedUser.relationshipState !== "NO_FRIENDSHIP"
                            ? "1px solid #DDD6D0"
                            : "none",
                        backgroundColor:
                          searchedUser.blockedYou ||
                          searchedUser.relationshipState !== "NO_FRIENDSHIP"
                            ? "#F4F1EE"
                            : "#7B3139",
                        color:
                          searchedUser.blockedYou ||
                          searchedUser.relationshipState !== "NO_FRIENDSHIP"
                            ? "#A4A4A4"
                            : "#FFFFFF",
                        padding: "0 18px",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "14px",
                        fontWeight: 600,
                        cursor:
                          searchedUser.blockedYou ||
                          searchedUser.relationshipState !== "NO_FRIENDSHIP"
                            ? "not-allowed"
                            : "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <UserPlus size={16} />
                      Add Friend
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                border: "1px solid #ECE6DF",
                borderRadius: "24px",
                padding: "22px",
                marginBottom: "20px",
                backgroundColor: "#FFFDFC",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "20px",
                  color: "#722F37",
                }}
              >
                New Friend Requests
              </h3>
              <p
                style={{
                  marginTop: "8px",
                  marginBottom: "18px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#8A8A8A",
                }}
              >
                View and accept or reject incoming requests
              </p>

              {friendRequests.length === 0 ? (
                <div
                  style={{
                    border: "1px dashed #DED6CF",
                    borderRadius: "20px",
                    padding: "28px 20px",
                    textAlign: "center",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "16px",
                    color: "#7F7F7F",
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  No new friend requests.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        border: "1px solid #EEE7E0",
                        borderRadius: "20px",
                        padding: "16px",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "16px",
                              fontWeight: 700,
                              color: "#4D2F2F",
                            }}
                          >
                            {request.name}
                          </div>
                          <div
                            style={{
                              marginTop: "6px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: getStatusColor(request.status),
                            }}
                          >
                            {request.status}
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() =>
                              handleFriendAction(
                                {
                                  ...request,
                                  blockedBy: null,
                                } as Friend,
                                "accept_request"
                              )
                            }
                            style={{
                              height: "38px",
                              borderRadius: "999px",
                              border: "none",
                              backgroundColor: "#7B3139",
                              color: "#FFFFFF",
                              padding: "0 16px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              handleFriendAction(
                                {
                                  ...request,
                                  blockedBy: null,
                                } as Friend,
                                "cancel_request"
                              )
                            }
                            style={{
                              height: "38px",
                              borderRadius: "999px",
                              border: "1px solid #D7CFC8",
                              backgroundColor: "#FFFFFF",
                              color: "#6A6A6A",
                              padding: "0 16px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px",
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div
              style={{
                height: "46px",
                borderRadius: "999px",
                border: "1px solid #DDD6D0",
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                backgroundColor: "#FFFFFF",
                marginBottom: "18px",
              }}
            >
              <Search size={18} color="#A6A6A6" />
              <input
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search existing friends"
                style={{
                  border: "none",
                  outline: "none",
                  width: "100%",
                  backgroundColor: "transparent",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  color: "#444444",
                }}
              />
            </div>

            {isLoadingFriends ? (
              <div
                style={{
                  border: "1px dashed #DED6CF",
                  borderRadius: "20px",
                  padding: "30px 20px",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "16px",
                  color: "#7F7F7F",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Loading friends...
              </div>
            ) : filteredFriends.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #DED6CF",
                  borderRadius: "20px",
                  padding: "30px 20px",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "16px",
                  color: "#7F7F7F",
                  backgroundColor: "#FFFFFF",
                }}
              >
                No friends to show yet.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {filteredFriends.map((friend) => {
                  const isBlocked = friend.relationshipState === "BLOCKED_FRIENDSHIP";
                  const blockedByMe =
                    !!friend.blockedBy &&
                    String(friend.blockedBy) === String(currentUserId);

                  return (
                    <div
                      key={friend.id}
                      style={{
                        border: "1px solid #EEE7E0",
                        borderRadius: "22px",
                        padding: "18px",
                        backgroundColor: "#FFFFFF",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "16px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "17px",
                              fontWeight: 700,
                              color: "#4D2F2F",
                            }}
                          >
                            {friend.name}
                          </div>

                          <div
                            style={{
                              marginTop: "6px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: getStatusColor(friend.status),
                            }}
                          >
                            {friend.status}
                          </div>

                          <div
                            style={{
                              marginTop: "8px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: isBlocked ? "#B23B3B" : "#8A8A8A",
                            }}
                          >
                            {isBlocked
                              ? blockedByMe
                                ? "Blocked by you"
                                : "This friendship is blocked"
                              : getRelationshipBadgeLabel(friend.relationshipState)}
                          </div>

                          {friend.lastMessage && (
                            <div
                              style={{
                                marginTop: "10px",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "13px",
                                color: "#8A8A8A",
                              }}
                            >
                              Last message: {friend.lastMessage}
                            </div>
                          )}
                        </div>

                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                          {!isBlocked && (
                            <button
                              onClick={() => handleFriendAction(friend, "start_chat")}
                              style={{
                                height: "40px",
                                borderRadius: "999px",
                                border: "none",
                                backgroundColor: "#7B3139",
                                color: "#FFFFFF",
                                padding: "0 16px",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <MessageCircle size={16} />
                              Chat
                            </button>
                          )}

                          {isBlocked && blockedByMe ? (
                            <button
                              onClick={() => handleFriendAction(friend, "unblock_user")}
                              style={{
                                height: "40px",
                                borderRadius: "999px",
                                border: "1px solid #7B3139",
                                backgroundColor: "#FFFFFF",
                                color: "#7B3139",
                                padding: "0 16px",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <ShieldCheck size={16} />
                              Unblock
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFriendAction(friend, "block_user")}
                              style={{
                                height: "40px",
                                borderRadius: "999px",
                                border: "1px solid #E5C8C8",
                                backgroundColor: "#FFF5F5",
                                color: "#B23B3B",
                                padding: "0 16px",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <Ban size={16} />
                              Block
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E9E3DD",
              borderRadius: "28px",
              padding: "26px 24px 28px",
              boxShadow: "0 10px 28px rgba(114, 47, 55, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "28px",
                    color: "#722F37",
                  }}
                >
                  Social Events
                </h2>
                <p
                  style={{
                    marginTop: "6px",
                    marginBottom: 0,
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    color: "#7F7F7F",
                  }}
                >
                  Join, leave, create, and view event details
                </p>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {(["All", "Joined", "Open"] as const).map((label) => (
                  <button
                    key={label}
                    onClick={() => setEventFilter(label)}
                    style={{
                      height: "38px",
                      minWidth: "64px",
                      padding: "0 18px",
                      borderRadius: "999px",
                      border: eventFilter === label ? "none" : "1px solid #D9D1CB",
                      backgroundColor: eventFilter === label ? "#7B3139" : "#FFFFFF",
                      color: eventFilter === label ? "#FFFFFF" : "#6B6B6B",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isLoadingEvents ? (
              <div
                style={{
                  border: "1px dashed #DED6CF",
                  borderRadius: "20px",
                  padding: "30px 20px",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "16px",
                  color: "#7F7F7F",
                  backgroundColor: "#FFFFFF",
                }}
              >
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div
                style={{
                  border: "1px dashed #DED6CF",
                  borderRadius: "20px",
                  padding: "30px 20px",
                  textAlign: "center",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "16px",
                  color: "#7F7F7F",
                  backgroundColor: "#FFFFFF",
                }}
              >
                No events found for this view.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {filteredEvents.map((event) => {
                  const isHost = isCurrentUsersEvent(event);

                  return (
                    <div
                      key={event.id}
                      style={{
                        border: "1px solid #ECE6DF",
                        borderRadius: "26px",
                        padding: "22px",
                        backgroundColor: "#FFFFFF",
                        display: "grid",
                        gridTemplateColumns: "1fr 220px",
                        gap: "20px",
                        alignItems: "stretch",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontSize: "22px",
                            color: "#382525",
                          }}
                        >
                          {event.title}
                        </h3>

                        {event.description && (
                          <p
                            style={{
                              marginTop: "10px",
                              marginBottom: "18px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px",
                              color: "#6F6F6F",
                              maxWidth: "90%",
                              lineHeight: 1.5,
                            }}
                          >
                            {event.description}
                          </p>
                        )}

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "26px",
                            alignItems: "center",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            color: "#6B5A5A",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <CalendarDays size={16} color="#7B3139" />
                            {event.date}
                            {event.time ? ` · ${event.time}` : ""}
                          </span>

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            <MapPin size={16} color="#7B3139" />
                            {event.location}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          border: "1px solid #ECE6DF",
                          borderRadius: "22px",
                          padding: "18px",
                          backgroundColor: "#FFFDFC",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "14px",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              letterSpacing: "0.04em",
                              color: "#9B928C",
                              textTransform: "uppercase",
                            }}
                          >
                            Hosted By
                          </div>
                          <div
                            style={{
                              marginTop: "8px",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px",
                              fontWeight: 700,
                              color: "#3E2B2B",
                              wordBreak: "break-word",
                            }}
                          >
                            {event.host}
                          </div>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <button
                            onClick={() => handleViewEventDetails(event.id)}
                            style={{
                              width: "100%",
                              height: "42px",
                              borderRadius: "999px",
                              backgroundColor: "transparent",
                              color: "#722F37",
                              border: "1px solid #722F37",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "14px",
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            View Details
                          </button>

                          {!isHost && (
                            <button
                              onClick={() => handleToggleJoin(event.id)}
                              style={{
                                width: "100%",
                                height: "42px",
                                borderRadius: "999px",
                                backgroundColor: event.joined ? "transparent" : "#722F37",
                                color: event.joined ? "#722F37" : "#FFFFFF",
                                border: event.joined ? "1px solid #722F37" : "none",
                                fontFamily: "'DM Sans', sans-serif",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              {event.joined ? "Leave Event" : "Join Event"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {showCreateEventModal && (
        <div
          onClick={() => setShowCreateEventModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(31, 17, 17, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 40,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "560px",
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              padding: "28px",
              boxShadow: "0 28px 60px rgba(0,0,0,0.12)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: "32px",
                color: "#722F37",
              }}
            >
              Create Event
            </h2>

            <div
              style={{
                marginTop: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <input
                value={createEventForm.title}
                onChange={(e) =>
                  setCreateEventForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Event name"
                style={{
                  height: "50px",
                  borderRadius: "16px",
                  border: "1px solid #DDD6D0",
                  padding: "0 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <input
                value={createEventForm.location}
                onChange={(e) =>
                  setCreateEventForm((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                placeholder="Location"
                style={{
                  height: "50px",
                  borderRadius: "16px",
                  border: "1px solid #DDD6D0",
                  padding: "0 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <input
                type="datetime-local"
                value={createEventForm.date}
                onChange={(e) =>
                  setCreateEventForm((prev) => ({ ...prev, date: e.target.value }))
                }
                style={{
                  height: "50px",
                  borderRadius: "16px",
                  border: "1px solid #DDD6D0",
                  padding: "0 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  outline: "none",
                }}
              />

              <textarea
                value={createEventForm.details}
                onChange={(e) =>
                  setCreateEventForm((prev) => ({
                    ...prev,
                    details: e.target.value,
                  }))
                }
                placeholder="Event details"
                rows={5}
                style={{
                  borderRadius: "16px",
                  border: "1px solid #DDD6D0",
                  padding: "14px 16px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "15px",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              <button
                onClick={() => setShowCreateEventModal(false)}
                style={{
                  height: "46px",
                  borderRadius: "999px",
                  border: "1px solid #DDD6D0",
                  backgroundColor: "#FFFFFF",
                  color: "#666666",
                  padding: "0 18px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={submitCreateEvent}
                disabled={isSubmittingCreateEvent}
                style={{
                  height: "46px",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor: "#7B3139",
                  color: "#FFFFFF",
                  padding: "0 20px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: isSubmittingCreateEvent ? "not-allowed" : "pointer",
                  opacity: isSubmittingCreateEvent ? 0.7 : 1,
                }}
              >
                {isSubmittingCreateEvent ? "Creating..." : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(31, 17, 17, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            zIndex: 45,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "620px",
              backgroundColor: "#FFFFFF",
              borderRadius: "28px",
              padding: "28px",
              boxShadow: "0 28px 60px rgba(0,0,0,0.12)",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "'Playfair Display', serif",
                fontSize: "30px",
                color: "#722F37",
              }}
            >
              {selectedEvent.title}
            </h2>

            <div
              style={{
                marginTop: "18px",
                display: "grid",
                gap: "14px",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "15px",
                color: "#5F5252",
              }}
            >
              <div>
                <strong>Date:</strong> {selectedEvent.date}
                {selectedEvent.time ? ` · ${selectedEvent.time}` : ""}
              </div>
              <div>
                <strong>Location:</strong> {selectedEvent.location}
              </div>
              <div>
                <strong>Hosted By:</strong> {selectedEvent.host}
              </div>
              <div>
                <strong>Details:</strong>{" "}
                {selectedEvent.description || "No additional details provided."}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "26px",
              }}
            >
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  height: "46px",
                  borderRadius: "999px",
                  border: "1px solid #DDD6D0",
                  backgroundColor: "#FFFFFF",
                  color: "#666666",
                  padding: "0 18px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>

              {!isCurrentUsersEvent(selectedEvent) && (
                <button
                  onClick={() => handleToggleJoin(selectedEvent.id)}
                  style={{
                    height: "46px",
                    borderRadius: "999px",
                    border: selectedEvent.joined ? "1px solid #722F37" : "none",
                    backgroundColor: selectedEvent.joined ? "#FFFFFF" : "#7B3139",
                    color: selectedEvent.joined ? "#722F37" : "#FFFFFF",
                    padding: "0 18px",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {selectedEvent.joined ? "Leave Event" : "Join Event"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
