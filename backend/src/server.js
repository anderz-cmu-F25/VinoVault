import http from 'http'
import { Server } from 'socket.io'
import { createApp } from './app/createApp.js'
import { connectMongo } from './common/db/mongoose.js'
import { env } from './config/env.js'
import { registerSocketServer } from './socket/registerSocketServer.js'

const app = createApp()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: env.clientOrigin,
    credentials: true,
  },
})

registerSocketServer(io)

async function start() {
  await connectMongo()

  server.listen(env.port, () => {
    console.log(`VinoVault backend listening on http://localhost:${env.port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start server', error)
  process.exit(1)
})
