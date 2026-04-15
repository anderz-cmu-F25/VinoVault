export function registerSocketServer(io) {
  io.on('connection', (socket) => {
    socket.on('social:joinConversation', (conversationId) => {
      socket.join(conversationId)
    })

    socket.on('social:sendMessage', (payload) => {
      const { conversationId, content, senderId } = payload
      io.to(conversationId).emit('social:messageReceived', {
        conversationId,
        content,
        senderId,
        sentAt: new Date().toISOString(),
      })
    })
  })
}
