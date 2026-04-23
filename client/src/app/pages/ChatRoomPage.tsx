import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { io, Socket } from 'socket.io-client'

type ChatMessage = {
  _id?: string
  senderId: string
  receiverId?: string
  content: string
  createdAt?: string
}

const API_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const SOCKET_BASE = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export function ChatRoomPage() {
  const { friendId } = useParams()
  const navigate = useNavigate()
  const { user, isLoaded: isUserLoaded } = useUser()
  const { getToken } = useAuth()

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const currentUserId = user?.id

  useEffect(() => {
    async function loadHistory() {
      if (!friendId || !currentUserId) return

      try {
        setError('')
        const token = await getToken()

        const response = await fetch(`${API_BASE}/api/social/chats/${friendId}/messages`, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.message || 'Failed to load messages')
        }

        setMessages(result.data?.messages || [])
      } catch (err: any) {
        setError(err.message || 'Failed to load messages')
      }
    }

    loadHistory()
  }, [friendId, currentUserId, getToken])

  useEffect(() => {
    let mounted = true
    let activeSocket: Socket | null = null

    async function connectSocket() {
      if (!friendId || !currentUserId) return

      try {
        setIsConnecting(true)
        setError('')

        // const token = await getToken();

        if (!mounted) return

        // activeSocket = io(SOCKET_BASE, {
        //   transports: ["websocket"],
        //   auth: {
        //     token: token || "",
        //   },
        // });

        activeSocket = io(SOCKET_BASE, {
          transports: ['websocket'],
        })

        socketRef.current = activeSocket

        activeSocket.on('connect', () => {
          if (!mounted) return

          activeSocket?.emit('join_chat', {
            currentUserId,
            friendId,
          })

          setIsConnecting(false)
        })

        activeSocket.on('receive_message', (message: ChatMessage) => {
          setMessages((prev) => {
            const alreadyExists = prev.some(
              (item) => item._id && message._id && item._id === message._id
            )

            if (alreadyExists) return prev
            return [...prev, message]
          })
        })

        activeSocket.on('chat_error', (payload: { message?: string }) => {
          setError(payload?.message || 'Chat error')
        })

        activeSocket.on('connect_error', (err) => {
          setError(err.message || 'Socket connection failed')
          setIsConnecting(false)
        })
      } catch (err: any) {
        setError(err.message || 'Failed to connect chat')
        setIsConnecting(false)
      }
    }

    connectSocket()

    return () => {
      mounted = false

      if (activeSocket) {
        activeSocket.off('connect')
        activeSocket.off('receive_message')
        activeSocket.off('chat_error')
        activeSocket.off('connect_error')
        activeSocket.disconnect()
      }

      socketRef.current = null
    }
  }, [friendId, currentUserId, getToken])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSendMessage() {
    if (!content.trim() || !friendId || !currentUserId || !socketRef.current) {
      return
    }

    setError('')

    socketRef.current.emit('send_message', {
      currentUserId,
      friendId,
      content: content.trim(),
    })

    setContent('')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  if (!isUserLoaded) {
    return (
      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="rounded-[28px] border border-[#EAEAEA] bg-white p-6 shadow-sm">
          Loading chat...
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-10">
      <div className="rounded-[28px] border border-[#EAEAEA] bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/social')}
              style={{
                height: '38px',
                borderRadius: '999px',
                border: '1px solid #DDD6D0',
                backgroundColor: '#FFFFFF',
                color: '#722F37',
                padding: '0 16px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <h1
              className="text-3xl"
              style={{
                fontFamily: "'Playfair Display', serif",
                color: '#722F37',
              }}
            >
              Chat Room
            </h1>
          </div>

          <span
            className="text-sm"
            style={{
              color: isConnecting ? '#9A9A9A' : '#2E7D32',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {isConnecting ? 'Connecting...' : 'Connected'}
          </span>
        </div>

        {error && <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-red-700">{error}</div>}

        <div className="h-[420px] overflow-y-auto rounded-2xl border border-[#EFEFEF] p-4 bg-[#FCFCFC]">
          <div className="flex flex-col gap-3">
            {messages.map((message, index) => {
              const isMine = message.senderId === currentUserId

              return (
                <div
                  key={message._id || `${message.senderId}-${index}`}
                  className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMine ? 'self-end' : 'self-start'
                  }`}
                  style={{
                    backgroundColor: isMine ? '#722F37' : '#F3ECE7',
                    color: isMine ? '#FFFFFF' : '#4B3A35',
                  }}
                >
                  <p>{message.content}</p>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-[#DDDDDD] px-5 py-3 outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="px-6 py-3 rounded-full"
            style={{
              backgroundColor: '#722F37',
              color: '#FFFFFF',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </main>
  )
}
