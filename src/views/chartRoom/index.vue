<template>
  <div class="chat-app">
    <!-- 头部 -->
    <header class="app-header">
      <div class="logo">
        <div class="logo-icon">
          <i class="fas fa-comments"></i>
        </div>
        <div class="logo-text">Pusher Chat</div>
      </div>

      <div class="user-info">
        <div class="user-avatar">{{ currentUser.name.charAt(0) }}</div>
        <div>{{ currentUser.name }}</div>
        <div class="status-indicator"></div>
      </div>
    </header>

    <div class="app-content">
      <!-- 侧边栏 - 在线用户 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-title">
            <i class="fas fa-users"></i> 在线用户
            <span class="online-count">{{ onlineUsers.length }}</span>
          </h2>
          <div class="search-box">
            <i class="fas fa-search search-icon"></i>
            <input type="text" placeholder="搜索用户..." v-model="searchQuery" />
          </div>
        </div>

        <div class="users-list">
          <div
            class="user-item"
            v-for="user in filteredUsers"
            :key="user.id"
            :class="{ active: selectedUser && user.id === selectedUser.id }"
          >
            <div class="user-avatar sm">{{ user.name.charAt(0) }}</div>
            <div class="user-details">
              <div class="user-name">{{ user.name }}</div>
              <div class="user-status">
                <div class="status-dot"></div>
                <span>在线</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 聊天区域 -->
      <div class="chat-area">
        <div class="chat-header">
          <div class="chat-user-avatar">{{ selectedUser ? selectedUser.name.charAt(0) : 'G' }}</div>
          <div class="chat-user-info">
            <div class="chat-user-name">{{ selectedUser ? selectedUser.name : '群聊' }}</div>
            <div class="chat-user-status">
              <div class="status-dot"></div>
              <span>在线</span>
            </div>
          </div>
          <div class="chat-actions">
            <div class="action-btn">
              <i class="fas fa-phone"></i>
            </div>
            <div class="action-btn">
              <i class="fas fa-video"></i>
            </div>
            <div class="action-btn">
              <i class="fas fa-ellipsis-v"></i>
            </div>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <!-- 系统通知 -->
          <div class="notification" v-if="userJoinedMessage">
            <span>{{ userJoinedMessage }}</span>
          </div>

          <!-- 消息列表 -->
          <div
            class="message"
            v-for="message in messages"
            :key="message.id"
            :class="message.userId === currentUser.id ? 'sent' : 'received'"
          >
            <div v-if="message.userId !== currentUser.id" class="message-sender">
              {{ message.userName }}
            </div>
            <div class="message-bubble">
              {{ message.text }}
            </div>
            <div class="message-info">
              <span>{{ formatTime(message.timestamp) }}</span>
              <span v-if="message.userId === currentUser.id">
                <i class="fas fa-check" v-if="message.delivered"></i>
              </span>
            </div>
          </div>
        </div>

        <div class="input-area">
          <div class="input-container">
            <div class="input-box">
              <textarea
                v-model="newMessage"
                placeholder="输入消息..."
                @keydown.enter.exact.prevent="sendMessage"
                @input="adjustTextareaHeight"
              ></textarea>
              <div class="input-actions">
                <div class="input-action">
                  <i class="far fa-smile"></i>
                </div>
                <div class="input-action">
                  <i class="fas fa-paperclip"></i>
                </div>
              </div>
            </div>
            <button
              class="send-btn"
              @click="sendMessage"
              :disabled="!newMessage.trim() || !isConnected"
            >
              <i class="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import Pusher from 'pusher-js'

export default {
  name: 'PusherChat',
  setup() {
    // 用户信息
    const currentUser = ref({
      id: generateUserId(),
      name: generateRandomName(),
    })

    // 聊天状态
    const messages = ref([])
    const newMessage = ref('')
    const isConnected = ref(false)
    const onlineUsers = ref([])
    const userJoinedMessage = ref('')
    const messagesContainer = ref(null)
    const selectedUser = ref(null)
    const searchQuery = ref('')
    const pusherInstance = ref(null)
    const channel = ref(null)

    // 生成随机用户ID
    function generateUserId() {
      return 'user_' + Math.random().toString(36).substr(2, 9)
    }

    // 生成随机用户名
    function generateRandomName() {
      const names = [
        '神秘熊猫',
        '机智狐狸',
        '勇敢狮子',
        '聪明猫头鹰',
        '快乐海豚',
        '优雅天鹅',
        '敏捷猎豹',
        '智慧老鹰',
      ]
      return names[Math.floor(Math.random() * names.length)]
    }

    // 初始化Pusher
    function initPusher() {
      // 初始化Pusher实例
      pusherInstance.value = new Pusher('a4b3e3d9c5f9a3f6a3f9', {
        cluster: 'ap3',
        authEndpoint: 'https://your-auth-endpoint.com/pusher/auth',
        auth: {
          params: {
            user_id: currentUser.value.id,
            user_name: currentUser.value.name,
          },
        },
      })

      // 连接状态监听
      pusherInstance.value.connection.bind('state_change', (states) => {
        isConnected.value = states.current === 'connected'
      })

      // 创建/加入频道
      channel.value = pusherInstance.value.subscribe('presence-chat-channel')

      // 监听成员加入事件
      channel.value.bind('pusher:member_added', (member) => {
        onlineUsers.value.push({
          id: member.id,
          name: member.info.user_name,
        })
        userJoinedMessage.value = `${member.info.user_name} 加入了聊天`
        setTimeout(() => (userJoinedMessage.value = ''), 3000)
      })

      // 监听成员离开事件
      channel.value.bind('pusher:member_removed', (member) => {
        onlineUsers.value = onlineUsers.value.filter((user) => user.id !== member.id)
        userJoinedMessage.value = `${member.info.user_name} 离开了聊天`
        setTimeout(() => (userJoinedMessage.value = ''), 3000)
      })

      // 监听新消息事件
      channel.value.bind('new-message', (data) => {
        messages.value.push({
          ...data,
          delivered: true,
        })
        scrollToBottom()
      })

      // 初始化在线用户列表
      channel.value.bind('pusher:subscription_succeeded', (members) => {
        onlineUsers.value = Object.values(members.members).map((member) => ({
          id: member.id,
          name: member.info.user_name,
        }))

        // 默认选择第一个用户
        if (onlineUsers.value.length > 0) {
          selectedUser.value = onlineUsers.value[0]
        }
      })
    }

    // 发送消息
    function sendMessage() {
      if (!newMessage.value.trim()) return

      const message = {
        id: Date.now(),
        userId: currentUser.value.id,
        userName: currentUser.value.name,
        text: newMessage.value.trim(),
        timestamp: Date.now(),
        delivered: false,
      }

      // 通过Pusher发送消息
      channel.value.trigger('client-new-message', message)

      // 本地显示消息
      messages.value.push(message)
      newMessage.value = ''
      adjustTextareaHeight()
      scrollToBottom()

      // 模拟消息送达
      setTimeout(() => {
        const index = messages.value.findIndex((m) => m.id === message.id)
        if (index !== -1) {
          messages.value[index].delivered = true
        }
      }, 1000)
    }

    // 调整文本区域高度
    function adjustTextareaHeight() {
      nextTick(() => {
        const textarea = document.querySelector('textarea')
        if (textarea) {
          textarea.style.height = 'auto'
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
        }
      })
    }

    // 滚动到底部
    function scrollToBottom() {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
        }
      })
    }

    // 格式化时间
    function formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

    // 过滤用户
    const filteredUsers = computed(() => {
      if (!searchQuery.value) return onlineUsers.value
      return onlineUsers.value.filter((user) =>
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()),
      )
    })

    // 组件挂载时初始化
    onMounted(() => {
      initPusher()
      scrollToBottom()
    })

    // 组件卸载时清理
    onUnmounted(() => {
      if (pusherInstance.value) {
        pusherInstance.value.disconnect()
      }
    })

    return {
      currentUser,
      messages,
      newMessage,
      isConnected,
      onlineUsers,
      userJoinedMessage,
      messagesContainer,
      selectedUser,
      searchQuery,
      filteredUsers,
      sendMessage,
      formatTime,
      adjustTextareaHeight,
    }
  },
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

:root {
  --primary: #4361ee;
  --primary-dark: #3a56d4;
  --secondary: #7209b7;
  --success: #06d6a0;
  --danger: #ef476f;
  --light: #f8f9fa;
  --dark: #212529;
  --gray: #6c757d;
  --light-gray: #e9ecef;
  --border-radius: 12px;
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  --transition: all 0.3s ease;
}

.chat-app {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7f1 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  color: var(--dark);
}

#app {
  width: 100%;
  max-width: 1200px;
  height: 90vh;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.app-header {
  background: white;
  padding: 18px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--light-gray);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
  z-index: 10;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.logo-text {
  font-size: 22px;
  font-weight: 700;
  color: var(--primary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--light-gray);
  padding: 8px 16px;
  border-radius: 50px;
  font-size: 14px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--success);
  margin-left: 8px;
}

/* 主内容区样式 */
.app-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧边栏样式 */
.sidebar {
  width: 280px;
  background: white;
  border-right: 1px solid var(--light-gray);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--light-gray);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.online-count {
  background: var(--primary);
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.search-box {
  position: relative;
}

.search-box input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid var(--light-gray);
  border-radius: 8px;
  font-size: 14px;
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray);
}

.users-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
}

.user-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 5px;
}

.user-item:hover {
  background: var(--light-gray);
}

.user-item.active {
  background: rgba(67, 97, 238, 0.1);
}

.user-avatar.sm {
  width: 40px;
  height: 40px;
  font-size: 16px;
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.user-status {
  font-size: 12px;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 5px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
}

.status-dot.idle {
  background: #ffb703;
}

/* 聊天区样式 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fb;
}

.chat-header {
  padding: 16px 24px;
  background: white;
  border-bottom: 1px solid var(--light-gray);
  display: flex;
  align-items: center;
  gap: 12px;
}

.chat-user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--secondary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
}

.chat-user-info {
  flex: 1;
}

.chat-user-name {
  font-weight: 600;
  font-size: 17px;
}

.chat-user-status {
  font-size: 13px;
  color: var(--gray);
  display: flex;
  align-items: center;
  gap: 5px;
}

.chat-actions {
  display: flex;
  gap: 15px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--light-gray);
  color: var(--dark);
  cursor: pointer;
  transition: var(--transition);
}

.action-btn:hover {
  background: var(--primary);
  color: white;
}

.messages-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.3s ease;
}

.message.received {
  align-self: flex-start;
}

.message.sent {
  align-self: flex-end;
}

.message-bubble {
  padding: 14px 18px;
  border-radius: 18px;
  line-height: 1.5;
  position: relative;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.received .message-bubble {
  background: white;
  border-top-left-radius: 5px;
  color: var(--dark);
}

.sent .message-bubble {
  background: var(--primary);
  border-top-right-radius: 5px;
  color: white;
}

.message-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin-top: 6px;
  padding: 0 5px;
}

.received .message-info {
  color: var(--gray);
}

.sent .message-info {
  color: rgba(255, 255, 255, 0.7);
}

.message-sender {
  font-weight: 600;
  margin-bottom: 4px;
}

/* 输入区样式 */
.input-area {
  padding: 20px;
  background: white;
  border-top: 1px solid var(--light-gray);
}

.input-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.input-box {
  flex: 1;
  position: relative;
}

.input-box textarea {
  width: 100%;
  padding: 14px 20px;
  border: 1px solid var(--light-gray);
  border-radius: 30px;
  resize: none;
  font-size: 15px;
  transition: var(--transition);
  height: 50px;
  max-height: 120px;
}

.input-box textarea:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
}

.input-actions {
  display: flex;
  gap: 8px;
  position: absolute;
  right: 15px;
  bottom: 12px;
}

.input-action {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray);
  cursor: pointer;
  transition: var(--transition);
}

.input-action:hover {
  background: var(--light-gray);
  color: var(--primary);
}

.send-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  border: none;
  font-size: 18px;
}

.send-btn:hover {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--light-gray);
  color: var(--gray);
  cursor: not-allowed;
  transform: none;
}

/* 通知样式 */
.notification {
  text-align: center;
  margin: 10px 0;
}

.notification span {
  display: inline-block;
  background: rgba(0, 0, 0, 0.05);
  color: var(--gray);
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 13px;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
  }

  .sidebar-header,
  .user-details,
  .chat-user-info {
    display: none;
  }

  .user-item {
    justify-content: center;
  }

  .message {
    max-width: 85%;
  }
}

@media (max-width: 480px) {
  .app-content {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid var(--light-gray);
  }

  .users-list {
    display: flex;
    overflow-x: auto;
    padding: 10px 5px;
  }

  .user-item {
    flex-direction: column;
    min-width: 60px;
    margin-bottom: 0;
    margin-right: 10px;
  }

  .user-status {
    display: none;
  }
}
</style>
