import { useMemo, useState } from "react";
import {
  CalendarDays,
  MapPin,
  MessageCircle,
  Search,
  UserPlus,
  Users,
} from "lucide-react";

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
  | "start_chat"
  | "view_profile"
  | "view_inventory"
  | "view_hosted_events";

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

type Friend = {
  id: string;
  name: string;
  status: "Online" | "Away" | "Offline";
  relationshipState: RelationshipState;
  lastMessage?: string;
  unreadCount?: number;
};

type SocialEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  host: string;
  spotsLeft?: number;
  category?: string;
  description?: string;
  joined?: boolean;
};

// TODO: replace these placeholders with backend data.
//
// State-pattern-oriented relationship APIs derived from the design doc:
// - GET /api/social/friends
// - GET /api/social/relationships/:friendId
// - POST /api/social/relationships/:friendId/send-request
// - POST /api/social/relationships/:friendId/cancel-request
// - POST /api/social/relationships/:friendId/accept-request
// - POST /api/social/relationships/:friendId/block
// - GET /api/social/profiles/:friendId
// - GET /api/social/profiles/:friendId/inventory
// - GET /api/social/profiles/:friendId/hosted-events
// - POST /api/social/chats/:friendId
//
// Social event APIs requested:
// - GET /api/social/events
// - POST /api/social/events
// - GET /api/social/events/:eventId
// - POST /api/social/events/:eventId/join
// - POST /api/social/events/:eventId/leave
const initialFriends: Friend[] = [];
const initialFriendRequests: FriendRequest[] = [];
const initialEvents: SocialEvent[] = [];

function getStatusColor(status: Friend["status"]) {
  switch (status) {
    case "Online":
      return "#2E7D32";
    case "Away":
      return "#C9A96E";
    default:
      return "#9A9A9A";
  }
}

function getAvailableFriendActions(state: RelationshipState): FriendAction[] {
  switch (state) {
    case "NO_FRIENDSHIP":
      return ["send_request", "block_user", "view_profile"];
    case "REQUEST_SENT":
      return ["cancel_request", "block_user", "view_profile"];
    case "REQUEST_RECEIVED":
      return ["accept_request", "cancel_request", "block_user", "view_profile"];
    case "ACCEPTED_FRIENDSHIP":
      return [
        "start_chat",
        "view_profile",
        "view_inventory",
        "view_hosted_events",
        "block_user",
      ];
    case "BLOCKED_FRIENDSHIP":
      return [];
    default:
      return [];
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

export function SocialPage() {
  const [friendSearch, setFriendSearch] = useState("");
  const [usernameSearch, setUsernameSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<"All" | "Joined" | "Open">("All");
  const [friends] = useState<Friend[]>(initialFriends);
  const [friendRequests] = useState<FriendRequest[]>(initialFriendRequests);
  const [events, setEvents] = useState<SocialEvent[]>(initialEvents);

  const filteredFriends = useMemo(() => {
    const query = friendSearch.trim().toLowerCase();
    if (!query) return friends;

    return friends.filter((friend) => friend.name.toLowerCase().includes(query));
  }, [friendSearch, friends]);

  const searchedUser = useMemo<UserSearchResult | null>(() => {
    const query = usernameSearch.trim();
    if (!query) return null;

    // TODO: replace with backend username search API.
    // Suggested endpoint: GET /api/social/users/search?username=<query>
    return {
      id: "search-result-placeholder",
      username: query,
      relationshipState: "NO_FRIENDSHIP",
      blockedYou: false,
    };
  }, [usernameSearch]);

  const filteredEvents = useMemo(() => {
    if (eventFilter === "Joined") {
      return events.filter((event) => event.joined);
    }

    if (eventFilter === "Open") {
      return events.filter((event) => !event.joined);
    }

    return events;
  }, [eventFilter, events]);

  const handleFriendAction = async (friendId: string, action: FriendAction) => {
    // TODO: wire these actions to the backend State-pattern endpoints.
    // Suggested controller mapping:
    // send_request   -> POST /api/social/relationships/:friendId/send-request
    // cancel_request -> POST /api/social/relationships/:friendId/cancel-request
    // accept_request -> POST /api/social/relationships/:friendId/accept-request
    // block_user     -> POST /api/social/relationships/:friendId/block
    // start_chat     -> POST /api/social/chats/:friendId
    // view_profile   -> GET  /api/social/profiles/:friendId
    // view_inventory -> GET  /api/social/profiles/:friendId/inventory
    // view_hosted_events -> GET /api/social/profiles/:friendId/hosted-events
    console.log("Friend action", { friendId, action });
  };

  const handleAddFriend = () => {
    // TODO: open add-friend flow once backend/search user API is ready.
    console.log("Open add friend flow");
  };

  const handleRespondToFriendRequest = (
    friendId: string,
    action: "accept_request" | "cancel_request"
  ) => {
    // TODO: connect to state transition endpoints.
    // accept_request -> POST /api/social/relationships/:friendId/accept-request
    // cancel_request -> POST /api/social/relationships/:friendId/cancel-request
    console.log("Respond to friend request", { friendId, action });
  };

  const handleSearchUserRequest = (user: UserSearchResult) => {
    if (user.blockedYou) return;

    // TODO: connect to POST /api/social/relationships/:friendId/send-request
    console.log("Send friend request from search result", user.id);
  };

  const handleCreateEvent = () => {
    // TODO: connect to POST /api/social/events.
    console.log("Open create event flow");
  };

  const handleViewEventDetails = (eventId: string) => {
    // TODO: connect to GET /api/social/events/:eventId
    // or navigate to /social/events/:eventId.
    console.log("View event details", eventId);
  };

  const handleToggleJoin = (eventId: string) => {
    // TODO: replace optimistic UI logic with real backend requests:
    // if joined -> POST /api/social/events/:eventId/leave
    // else      -> POST /api/social/events/:eventId/join
    setEvents((current) =>
      current.map((event) => {
        if (event.id !== eventId) return event;

        const joined = !event.joined;
        const currentSpots = event.spotsLeft ?? 0;

        return {
          ...event,
          joined,
          spotsLeft: joined
            ? Math.max(0, currentSpots - 1)
            : currentSpots + 1,
        };
      })
    );
  };

  const friendActionLabels: Record<FriendAction, string> = {
    send_request: "Send Request",
    cancel_request: "Cancel Request",
    accept_request: "Accept Request",
    block_user: "Block",
    start_chat: "Chat",
    view_profile: "View Profile",
    view_inventory: "Wine Inventory",
    view_hosted_events: "Hosted Events",
  };

  return (
    <main className="max-w-7xl mx-auto px-8 py-16">
      <div className="mb-12">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1
              className="text-5xl mb-3"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: "#722F37",
                lineHeight: "1.2",
              }}
            >
              Social
            </h1>
            <p
              className="text-base max-w-2xl"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#7A7A7A",
              }}
            >
              Chat with friends and join wine-related community events.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              className="flex items-center gap-2 px-5 py-3 rounded-full transition-all hover:shadow-md"
              style={{
                backgroundColor: "transparent",
                border: "1px solid #722F37",
                color: "#722F37",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
              }}
              onClick={handleAddFriend}
            >
              <UserPlus className="w-4 h-4" />
              Add Friend
            </button>

            <button
              className="flex items-center gap-2 px-6 py-3 rounded-full transition-all hover:shadow-md"
              style={{
                backgroundColor: "#722F37",
                color: "#ffffff",
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: 500,
                cursor: "pointer",
                border: "none",
              }}
              onClick={handleCreateEvent}
            >
              <CalendarDays className="w-4 h-4" />
              Create Event
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.35fr] gap-8">
        <section
          className="rounded-[24px] p-6"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #EAEAEA",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2
                className="text-2xl mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#722F37",
                }}
              >
                Friends
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#8A8A8A",
                }}
              >
                State-driven relationship actions
              </p>
            </div>

            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: "42px",
                height: "42px",
                backgroundColor: "#FDF6EE",
              }}
            >
              <Users className="w-5 h-5" style={{ color: "#722F37" }} />
            </div>
          </div>

          <div
            className="rounded-[20px] p-5 mb-5"
            style={{
              backgroundColor: "#FCFCFC",
              border: "1px solid #EEEEEE",
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
              <div>
                <h3
                  className="text-lg mb-1"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#722F37",
                  }}
                >
                  Search by Username
                </h3>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#8A8A8A",
                  }}
                >
                  Search a user and send a friend request if allowed
                </p>
              </div>

              <button
                className="flex items-center gap-2 px-5 py-3 rounded-full transition-all hover:shadow-md"
                style={{
                  backgroundColor: "transparent",
                  border: "1px solid #722F37",
                  color: "#722F37",
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={handleAddFriend}
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            </div>

            <div className="relative mb-4">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: "#9A9A9A" }}
              />
              <input
                type="text"
                value={usernameSearch}
                onChange={(e) => setUsernameSearch(e.target.value)}
                placeholder="Search username"
                className="w-full"
                style={{
                  height: "46px",
                  padding: "0 16px 0 42px",
                  borderRadius: "999px",
                  border: "1px solid #DADADA",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#2A2A2A",
                  outline: "none",
                }}
              />
            </div>

            {searchedUser && (
              <div
                className="rounded-[18px] p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #EAEAEA",
                }}
              >
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <p
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: "15px",
                        color: "#2A2A2A",
                        fontWeight: 600,
                      }}
                    >
                      {searchedUser.username}
                    </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className="inline-flex items-center px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: "#FDF6EE",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "12px",
                          color: "#722F37",
                        }}
                      >
                        {getRelationshipBadgeLabel(searchedUser.relationshipState)}
                      </span>

                      {searchedUser.blockedYou && (
                        <span
                          className="inline-flex items-center px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: "#FBEAEA",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "12px",
                            color: "#B71C1C",
                          }}
                        >
                          This user blocked you
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSearchUserRequest(searchedUser)}
                    disabled={
                      searchedUser.blockedYou ||
                      searchedUser.relationshipState !== "NO_FRIENDSHIP"
                    }
                    className="px-4 py-2 rounded-full transition-all"
                    style={{
                      backgroundColor:
                        searchedUser.blockedYou ||
                        searchedUser.relationshipState !== "NO_FRIENDSHIP"
                          ? "#E0E0E0"
                          : "#722F37",
                      color:
                        searchedUser.blockedYou ||
                        searchedUser.relationshipState !== "NO_FRIENDSHIP"
                          ? "#8A8A8A"
                          : "#ffffff",
                      border: "none",
                      cursor:
                        searchedUser.blockedYou ||
                        searchedUser.relationshipState !== "NO_FRIENDSHIP"
                          ? "not-allowed"
                          : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                    }}
                  >
                    Send Friend Request
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
            className="rounded-[20px] p-5 mb-5"
            style={{
              backgroundColor: "#FCFCFC",
              border: "1px solid #EEEEEE",
            }}
          >
            <div className="mb-4">
              <h3
                className="text-lg mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#722F37",
                }}
              >
                New Friend Requests
              </h3>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "13px",
                  color: "#8A8A8A",
                }}
              >
                View and accept or reject incoming requests
              </p>
            </div>

            {friendRequests.length > 0 ? (
              <div className="space-y-3">
                {friendRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-[18px] p-4"
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #EAEAEA",
                    }}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "15px",
                            color: "#2A2A2A",
                            fontWeight: 600,
                          }}
                        >
                          {request.name}
                        </p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "#F8F8F8",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              color: getStatusColor(request.status),
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "999px",
                                backgroundColor: getStatusColor(request.status),
                                display: "inline-block",
                              }}
                            />
                            {request.status}
                          </span>
                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "#FDF6EE",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              color: "#722F37",
                            }}
                          >
                            {getRelationshipBadgeLabel(request.relationshipState)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() =>
                            handleRespondToFriendRequest(request.id, "accept_request")
                          }
                          className="px-4 py-2 rounded-full transition-all"
                          style={{
                            backgroundColor: "#722F37",
                            color: "#ffffff",
                            border: "none",
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          Accept
                        </button>
                        <button
                          onClick={() =>
                            handleRespondToFriendRequest(request.id, "cancel_request")
                          }
                          className="px-4 py-2 rounded-full transition-all"
                          style={{
                            backgroundColor: "transparent",
                            color: "#722F37",
                            border: "1px solid #722F37",
                            cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            fontWeight: 500,
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="rounded-[18px] p-6 text-center"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px dashed #D8D8D8",
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#7A7A7A",
                  }}
                >
                  No new friend requests.
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#9A9A9A",
                  }}
                >
                  TODO: render incoming requests where relationshipState is REQUEST_RECEIVED.
                </p>
              </div>
            )}
          </div>

          <div className="relative mb-5">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "#9A9A9A" }}
            />
            <input
              type="text"
              value={friendSearch}
              onChange={(e) => setFriendSearch(e.target.value)}
              placeholder="Search existing friends"
              className="w-full"
              style={{
                height: "46px",
                padding: "0 16px 0 42px",
                borderRadius: "999px",
                border: "1px solid #DADADA",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: "14px",
                color: "#2A2A2A",
                outline: "none",
              }}
            />
          </div>

          <div className="space-y-3">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="rounded-[20px] p-4 transition-all"
                  style={{
                    backgroundColor: "#FCFCFC",
                    border: "1px solid #EEEEEE",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div
                        className="flex-shrink-0 flex items-center justify-center rounded-full"
                        style={{
                          width: "44px",
                          height: "44px",
                          backgroundColor: "#722F37",
                          color: "#ffffff",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                          fontSize: "14px",
                        }}
                      >
                        {friend.name
                          .split(" ")
                          .slice(0, 2)
                          .map((part) => part[0])
                          .join("")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3
                            className="text-base"
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              color: "#2A2A2A",
                              fontWeight: 600,
                            }}
                          >
                            {friend.name}
                          </h3>

                          <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "#F8F8F8",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              color: getStatusColor(friend.status),
                            }}
                          >
                            <span
                              style={{
                                width: "7px",
                                height: "7px",
                                borderRadius: "999px",
                                backgroundColor: getStatusColor(friend.status),
                                display: "inline-block",
                              }}
                            />
                            {friend.status}
                          </span>

                          <span
                            className="inline-flex items-center px-2 py-1 rounded-full"
                            style={{
                              backgroundColor: "#FDF6EE",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              color: "#722F37",
                            }}
                          >
                            {getRelationshipBadgeLabel(friend.relationshipState)}
                          </span>
                        </div>

                        <p
                          className="mb-2 truncate"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "13px",
                            color: "#6F6F6F",
                          }}
                        >
                          {friend.lastMessage ?? "TODO: load latest chat preview from backend."}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {getAvailableFriendActions(friend.relationshipState).map((action) => {
                        const primary =
                          action === "start_chat" ||
                          action === "send_request" ||
                          action === "accept_request";

                        return (
                          <button
                            key={action}
                            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
                            style={{
                              backgroundColor: primary ? "#722F37" : "transparent",
                              color: primary ? "#ffffff" : "#722F37",
                              border: primary ? "none" : "1px solid #722F37",
                              cursor: "pointer",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              fontWeight: 500,
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => handleFriendAction(friend.id, action)}
                          >
                            {action === "start_chat" && <MessageCircle className="w-4 h-4" />}
                            {friendActionLabels[action]}
                            {action === "start_chat" && (friend.unreadCount ?? 0) > 0 && (
                              <span
                                className="inline-flex items-center justify-center rounded-full"
                                style={{
                                  minWidth: "18px",
                                  height: "18px",
                                  padding: "0 5px",
                                  backgroundColor: "#FDF6EE",
                                  color: "#722F37",
                                  fontSize: "11px",
                                }}
                              >
                                {friend.unreadCount}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="rounded-[20px] p-8 text-center"
                style={{
                  backgroundColor: "#FCFCFC",
                  border: "1px dashed #D8D8D8",
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#7A7A7A",
                  }}
                >
                  No friends to show yet.
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#9A9A9A",
                  }}
                >
                  TODO: render friend list after relationship-state APIs are connected.
                </p>
              </div>
            )}
          </div>
        </section>

        <section
          className="rounded-[24px] p-6"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #EAEAEA",
            boxShadow: "0 6px 24px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h2
                className="text-2xl mb-1"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  color: "#722F37",
                }}
              >
                Social Events
              </h2>
              <p
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: "14px",
                  color: "#8A8A8A",
                }}
              >
                Join, leave, create, and view event details
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {(["All", "Joined", "Open"] as const).map((filter) => {
                const isActive = eventFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => setEventFilter(filter)}
                    className="px-4 py-2 rounded-full transition-all"
                    style={{
                      border: isActive ? "none" : "1px solid #D8D8D8",
                      backgroundColor: isActive ? "#722F37" : "transparent",
                      color: isActive ? "#ffffff" : "#5A5A5A",
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[22px] p-5"
                  style={{
                    backgroundColor: "#FCFCFC",
                    border: event.joined ? "1px solid #E5D3D6" : "1px solid #EEEEEE",
                  }}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {event.category && (
                          <span
                            className="px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: "#FDF6EE",
                              color: "#722F37",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            {event.category}
                          </span>
                        )}

                        {event.joined && (
                          <span
                            className="px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: "#EEF7EF",
                              color: "#2E7D32",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 500,
                            }}
                          >
                            Joined
                          </span>
                        )}
                      </div>

                      <h3
                        className="text-xl mb-2"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          color: "#2A2A2A",
                          lineHeight: "1.3",
                        }}
                      >
                        {event.title}
                      </h3>

                      <p
                        className="mb-4"
                        style={{
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: "14px",
                          color: "#6F6F6F",
                          lineHeight: "1.6",
                        }}
                      >
                        {event.description ?? "TODO: load event description from backend."}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4" style={{ color: "#722F37" }} />
                          <span
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: "#5A5A5A",
                            }}
                          >
                            {event.date} · {event.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" style={{ color: "#722F37" }} />
                          <span
                            style={{
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: "13px",
                              color: "#5A5A5A",
                            }}
                          >
                            {event.location}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className="rounded-[18px] p-4 lg:w-[220px]"
                      style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #EFEFEF",
                      }}
                    >
                      <div className="mb-3">
                        <p
                          className="mb-1"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "12px",
                            color: "#8A8A8A",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Hosted by
                        </p>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            color: "#2A2A2A",
                            fontWeight: 600,
                          }}
                        >
                          {event.host}
                        </p>
                      </div>

                      <div className="mb-4">
                        <p
                          className="mb-1"
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "12px",
                            color: "#8A8A8A",
                            textTransform: "uppercase",
                            letterSpacing: "0.04em",
                          }}
                        >
                          Spots left
                        </p>
                        <p
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "18px",
                            color: (event.spotsLeft ?? 0) <= 3 ? "#B71C1C" : "#722F37",
                            fontWeight: 700,
                          }}
                        >
                          {event.spotsLeft ?? "--"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => handleViewEventDetails(event.id)}
                          className="w-full rounded-full transition-all"
                          style={{
                            height: "42px",
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

                        <button
                          onClick={() => handleToggleJoin(event.id)}
                          className="w-full rounded-full transition-all"
                          style={{
                            height: "42px",
                            backgroundColor: event.joined ? "transparent" : "#722F37",
                            color: event.joined ? "#722F37" : "#ffffff",
                            border: event.joined ? "1px solid #722F37" : "none",
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: "14px",
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          {event.joined ? "Leave Event" : "Join Event"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="rounded-[22px] p-10 text-center"
                style={{
                  backgroundColor: "#FCFCFC",
                  border: "1px dashed #D8D8D8",
                }}
              >
                <p
                  className="mb-2"
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#7A7A7A",
                  }}
                >
                  No social events to show yet.
                </p>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: "13px",
                    color: "#9A9A9A",
                  }}
                >
                  TODO: render event cards after social event APIs are connected.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
