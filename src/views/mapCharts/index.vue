<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

// 条目数据
const items = ref([
  {
    id: 1,
    name: '目标一',
    content: '完成前端架构设计\n优化性能指标\n编写技术文档',
    isEditing: false,
    originalName: '',
    originalContent: '',
  },
  {
    id: 2,
    name: '目标二',
    content: '对接后端接口',
    isEditing: false,
    originalName: '',
    originalContent: '',
  },
  {
    id: 3,
    name: '目标三',
    content: '',
    isEditing: false,
    originalName: '',
    originalContent: '',
  },
])

const activeItemId = ref(null)
const containerRef = ref(null)
const focusedInput = ref(null) // 'name' | 'content' | null

// 计算多行文本框的行数（用于自适应高度）
const calculateRows = (content) => {
  if (!content) return 1
  const lines = content.split('\n').length
  return Math.min(Math.max(lines, 1), 3)
}

// 进入编辑状态
const enterEdit = async (item, event) => {
  const currentEditing = items.value.find((i) => i.isEditing)
  if (currentEditing && currentEditing.id !== item.id) {
    saveItem(currentEditing)
  }

  item.originalName = item.name
  item.originalContent = item.content
  item.isEditing = true
  activeItemId.value = item.id
  focusedInput.value = null

  await nextTick()
  const target = event?.target
  const itemEl = containerRef.value?.querySelector(`[data-item-id="${item.id}"]`)
  if (!itemEl) return

  const nameInput = itemEl.querySelector('.name-input')
  const contentInput = itemEl.querySelector('.content-input')

  if (target && target.getBoundingClientRect) {
    const rect = itemEl.getBoundingClientRect()
    const clickY = event.clientY - rect.top
    if (clickY > rect.height * 0.4 && contentInput) {
      contentInput.focus()
      focusedInput.value = 'content'
    } else if (nameInput) {
      nameInput.focus()
      focusedInput.value = 'name'
    }
  } else if (nameInput) {
    nameInput.focus()
    focusedInput.value = 'name'
  }
}

// 保存条目
const saveItem = (item) => {
  item.isEditing = false
  activeItemId.value = null
  focusedInput.value = null
  item.originalName = ''
  item.originalContent = ''
}

// 取消编辑
const cancelEdit = (item) => {
  item.name = item.originalName
  item.content = item.originalContent
  item.isEditing = false
  activeItemId.value = null
  focusedInput.value = null
}

// 删除条目
const deleteItem = (itemId) => {
  const idx = items.value.findIndex((i) => i.id === itemId)
  if (idx > -1) {
    items.value.splice(idx, 1)
  }
}

// 添加新条目
const addItem = () => {
  const newId = Math.max(...items.value.map((i) => i.id), 0) + 1
  const newItem = {
    id: newId,
    name: `目标${newId}`,
    content: '',
    isEditing: true,
    originalName: `目标${newId}`,
    originalContent: '',
  }
  items.value.push(newItem)
  activeItemId.value = newId
  focusedInput.value = 'name'

  nextTick(() => {
    const itemEl = containerRef.value?.querySelector(`[data-item-id="${newId}"]`)
    const nameInput = itemEl?.querySelector('.name-input')
    nameInput?.focus()
    nameInput?.select()
  })
}

// 点击外部检测
const handleClickOutside = (event) => {
  const editingItem = items.value.find((i) => i.isEditing)
  if (!editingItem) return

  const itemEl = containerRef.value?.querySelector(`[data-item-id="${editingItem.id}"]`)
  if (!itemEl) return

  if (!itemEl.contains(event.target)) {
    saveItem(editingItem)
  }
}

// 键盘事件
const handleKeydown = (event) => {
  const editingItem = items.value.find((i) => i.isEditing)
  if (!editingItem) return

  if (event.key === 'Escape') {
    cancelEdit(editingItem)
  }
  if (event.key === 'Tab' && event.target.classList.contains('content-input')) {
    event.preventDefault()
    const start = event.target.selectionStart
    const end = event.target.selectionEnd
    editingItem.content =
      editingItem.content.substring(0, start) + '  ' + editingItem.content.substring(end)
    nextTick(() => {
      event.target.selectionStart = event.target.selectionEnd = start + 2
    })
  }
}

// 处理名称输入框聚焦
const handleNameFocus = () => {
  focusedInput.value = 'name'
}

// 处理名称输入框失焦
const handleNameBlur = () => {
  setTimeout(() => {
    if (focusedInput.value === 'name') {
      focusedInput.value = null
    }
  }, 0)
}

// 处理内容输入框聚焦
const handleContentFocus = () => {
  focusedInput.value = 'content'
}

// 处理内容输入框失焦
const handleContentBlur = () => {
  setTimeout(() => {
    if (focusedInput.value === 'content') {
      focusedInput.value = null
    }
  }, 0)
}

// 多行文本框输入处理（自适应高度）
const handleContentInput = (item, event) => {
  const textarea = event.target
  const rows = calculateRows(item.content)
  textarea.rows = rows
}

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="editable-list-container" ref="containerRef">
    <div class="items-wrapper">
      <div
        v-for="item in items"
        :key="item.id"
        :data-item-id="item.id"
        class="item-card"
        :class="{
          'is-editing': item.isEditing,
          'is-editing-name': item.isEditing && focusedInput === 'name',
          'is-editing-content': item.isEditing && focusedInput === 'content',
          'is-readonly': !item.isEditing,
        }"
        @click="!item.isEditing && enterEdit(item, $event)"
      >
        <!-- 头部区域：名称 + 删除按钮 -->
        <div class="item-header">
          <!-- 名称区域：只读状态 -->
          <div v-show="!item.isEditing" class="name-display">
            {{ item.name }}
          </div>

          <!-- 名称区域：编辑状态（宽度一半） -->
          <div v-show="item.isEditing" class="name-edit-wrapper">
            <input
              v-model="item.name"
              class="name-input"
              type="text"
              placeholder="XXX名称"
              @click.stop
              @focus="handleNameFocus"
              @blur="handleNameBlur"
            />
          </div>

          <!-- 删除按钮（编辑状态时显示在右上角） -->
          <button
            v-show="item.isEditing"
            class="delete-btn"
            @click.stop="deleteItem(item.id)"
            title="删除"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <!-- 内容区域：只读状态 -->
        <div v-show="!item.isEditing" class="content-display">
          <div
            v-for="(line, idx) in item.content.split('\n').filter((l) => l.trim())"
            :key="idx"
            class="content-line"
          >
            {{ line }}
          </div>
          <div v-if="!item.content.trim()" class="content-placeholder">点击添加内容...</div>
        </div>

        <!-- 内容区域：编辑状态 -->
        <div v-show="item.isEditing" class="content-edit-wrapper">
          <textarea
            v-model="item.content"
            class="content-input"
            placeholder="请输入自定义内容"
            :rows="calculateRows(item.content)"
            @click.stop
            @input="handleContentInput(item, $event)"
            @focus="handleContentFocus"
            @blur="handleContentBlur"
          />
        </div>
      </div>
    </div>

    <!-- 添加按钮 -->
    <button class="add-item-btn" @click="addItem">
      <span class="plus-icon">+</span>
      <span>添加主题</span>
    </button>
  </div>
</template>

<style scoped>
.editable-list-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.items-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-card {
  position: relative;
  padding: 16px 20px;
  border-radius: 12px;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: #ffffff;
}

/* 只读状态样式 */
.item-card.is-readonly:hover {
  border-color: #e0e0e0;
}

/* 编辑状态基础样式 - 默认边框 */
.item-card.is-editing {
  cursor: default;
  z-index: 10;
  border-color: #e6e9ed;
  padding-top: 12px; /* 稍微减少顶部padding给删除按钮留空间 */
}

/* 聚焦多行文本时：整个条目边框高亮（无背景高亮） */
.item-card.is-editing-content {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.08);
}

/* 头部区域：flex布局，名称和删除按钮并排 */
.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  position: relative;
}

/* 名称区域 - 只读 */
.name-display {
  color: #10b981;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  flex: 1;
  transition: opacity 0.2s ease;
}

/* 名称编辑区域 - 宽度一半 */
.name-edit-wrapper {
  width: 50%;
  flex-shrink: 0;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

/* 名称输入框 - 默认样式 */
.name-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  color: #10b981;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
  background: #fafafa;
}

/* 名称输入框聚焦时高亮 */
.name-input:focus {
  border-color: #6366f1;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* 删除按钮 */
.delete-btn {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #9ca3af;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}

.delete-btn:active {
  transform: scale(0.95);
}

/* 内容区域 - 只读 */
.content-display {
  transition: opacity 0.2s ease;
  padding-left: 0;
}

.content-line {
  color: #8b5cf6;
  font-size: 14px;
  line-height: 1.6;
  padding: 2px 0;
  position: relative;
  padding-left: 12px;
}

.content-line::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: #c4b5fd;
  border-radius: 50%;
}

.content-placeholder {
  color: #c4b5fd;
  font-size: 14px;
  font-style: italic;
}

/* 内容区域 - 编辑 */
.content-edit-wrapper {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

/* 多行文本框：无边框，透明背景 */
.content-input {
  width: 100%;
  padding: 8px 0;
  border: none;
  border-radius: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
  outline: none;
  resize: none;
  min-height: 22px;
  box-sizing: border-box;
  font-family: inherit;
  background: transparent;
  transition: all 0.2s ease;
}

/* 多行文本框聚焦时无单独样式，依靠父级条目边框高亮 */
.content-input:focus {
  border: none;
  box-shadow: none;
  background: transparent;
}

/* 添加按钮 */
.add-item-btn {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  border: 1px dashed #d1d5db;
  border-radius: 12px;
  background: transparent;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.add-item-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.02);
}

.plus-icon {
  font-size: 18px;
  font-weight: 300;
}

/* v-show 过渡优化 */
[v-show='false'] {
  display: none !important;
}

/* 显隐动画控制 */
.item-card.is-editing .name-display,
.item-card.is-editing .content-display {
  opacity: 0;
  pointer-events: none;
}

.item-card.is-readonly .name-edit-wrapper,
.item-card.is-readonly .content-edit-wrapper,
.item-card.is-readonly .delete-btn {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

/* 高度过渡 */
.item-card {
  max-height: 200px;
  transition:
    max-height 0.3s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.item-card.is-editing {
  max-height: 400px;
}
</style>