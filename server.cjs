require('dotenv').config()
const express = require('express')
const cors = require('cors')
const Pusher = require('pusher')

const app = express()
const port = process.env.PORT || 3000

// 配置Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
})

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Pusher认证端点
app.post('/pusher/auth', (req, res) => {
  const socketId = req.body.socket_id
  const channel = req.body.channel_name

  // 这里可以添加用户认证逻辑
  const authResponse = pusher.authenticate(socketId, channel)
  res.send(authResponse)
})

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
