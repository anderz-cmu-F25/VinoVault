// ChatRoomPage.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router";
import { useUser, useAuth } from "@clerk/clerk-react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

export function ChatRoomPage() {
  const { friendId } = useParams();
  const { user } = useUser();
  const { getToken } = useAuth();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef(null);

  const currentUserId = user?.id;

  useEffect(() => {
    async function loadHistory() {
      if (!friendId || !currentUserId) return;

      try {
        const token = await getToken();

        const response = await fetch(
          `http://localhost:3000/api/social/chats/${friendId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to load messages");
        }

        setMessages(result.data.messages || []);
      } catch (err) {
        setError(err.message);
      }
    }

    loadHistory();
  }, [friendId, currentUserId, getToken]);

  useEffect(() => {
    if (!friendId || !currentUserId) return;

    socket.emit("join_chat", {
      currentUserId,
      friendId,
    });

    socket.on("receive_message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("chat_error", (payload) => {
      setError(payload.message);
    });

    return () => {
      socket.off("receive_message");
      socket.off("chat_error");
    };
  }, [friendId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSendMessage() {
    if (!content.trim() || !friendId || !currentUserId) return;

    socket.emit("send_message", {
      currentUserId,
      friendId,
      content,
    });

    setContent("");
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="rounded-[28px] border border-[#EAEAEA] bg-white p-6 shadow-sm">
        <h1
          className="text-3xl mb-6"
          style={{
            fontFamily: "'Playfair Display', serif",
            color: "#722F37",
          }}
        >
          Chat Room
        </h1>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">
            {error}
          </div>
        )}

        <div className="h-[420px] overflow-y-auto rounded-2xl border border-[#EFEFEF] p-4 bg-[#FCFCFC]">
          <div className="flex flex-col gap-3">
            {messages.map((message) => {
              const isMine = message.senderId === currentUserId;

              return (
                <div
                  key={message._id}
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMine ? "self-end" : "self-start"
                  }`}
                  style={{
                    backgroundColor: isMine ? "#722F37" : "#F3ECE7",
                    color: isMine ? "#FFFFFF" : "#4B3A35",
                  }}
                >
                  <p>{message.content}</p>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-[#DDDDDD] px-5 py-3 outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: "#722F37",
              color: "#FFFFFF",
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  );
}