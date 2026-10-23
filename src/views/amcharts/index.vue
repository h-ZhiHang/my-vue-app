<template>
  <div class="app-container">
    <h2 class="sudoku-title">数独求解器</h2>
    <p class="sudoku-tip">点击格子输入 1-9 作为初始数字（方向键可切换格子），点击开始后自动求解</p>

    <div class="sudoku-grid">
      <template v-for="(row, i) in board" :key="i">
        <input
          v-for="(_, j) in row"
          :key="`${i}-${j}`"
          v-model="board[i][j]"
          class="sudoku-cell"
          :class="{
            'sudoku-bd-r': j === 2 || j === 5,
            'sudoku-bd-b': i === 2 || i === 5,
            'sudoku-cell-given': solved && initialBoard[i][j] !== '',
            'sudoku-cell-solved': solved && initialBoard[i][j] === ''
          }"
          :style="solved && initialBoard[i][j] === '' ? { animationDelay: `${(i * 9 + j) * 6}ms` } : null"
          :readonly="solved"
          :ref="el => setCellRef(el, i, j)"
          maxlength="1"
          inputmode="numeric"
          autocomplete="off"
          @input="onInput(i, j)"
          @focus="$event.target.select()"
          @keydown="onKeydown($event, i, j)"
        />
      </template>
    </div>

    <div class="sudoku-actions">
      <el-button type="primary" size="large" :disabled="solved" @click="startSolve">开始</el-button>
      <el-button size="large" :disabled="!solved" @click="resetBoard">重置</el-button>
      <el-button size="large" @click="loadExample">示例</el-button>
      <el-button size="large" @click="clearBoard">清空</el-button>
    </div>

    <p v-if="status" class="sudoku-status">{{ status }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

function solveSudoku(board) {
  function isValid(row, col, val, board) {
    let len = board.length
    // 行中的数字不能重复
    for (let i = 0; i < len; i++) {
      if (board[row][i] === val) {
        return false
      }
    }
    // 列中的数字不能重复
    for (let i = 0; i < len; i++) {
      if (board[i][col] === val) {
        return false
      }
    }
    let startRow = Math.floor(row / 3) * 3
    let startCol = Math.floor(col / 3) * 3

    //方块中的数字不能重复
    for (let i = startRow; i < startRow + 3; i++) {
      for (let j = startCol; j < startCol + 3; j++) {
        if (board[i][j] === val) {
          return false
        }
      }
    }

    return true
  }

  function backTracking() {
    //回溯函数
    for (let i = 0; i < board.length; i++) {
      for (let j = 0; j < board[0].length; j++) {
        //循环行和列
        if (board[i][j] !== '.') continue
        for (let val = 1; val <= 9; val++) {
          //尝试在当前单元格放置1-9
          if (isValid(i, j, `${val}`, board)) {
            //判断放置数字的合法性
            board[i][j] = `${val}` //放置数字
            if (backTracking()) {
              //合法返回ture
              return true
            }

            board[i][j] = `.` //不合法回溯状态
          }
        }
        return false //1-9的数字都不合法，返回false
      }
    }
    return true //全部可能性都尝试完成 返回true 说明有解
  }
  backTracking()
  return board
}

// 棋盘：9x9 二维数组，界面用 '' 表示空格（求解时再转成 '.'）
const board = ref(createEmptyBoard())
// 点击“开始”时初始数字的快照，用于区分初始数字和求解结果
const initialBoard = ref(createEmptyBoard())
const solved = ref(false)
const status = ref('')

// 经典数独示例，方便快速体验
const EXAMPLE_BOARD = [
  ['5', '3', '', '', '7', '', '', '', ''],
  ['6', '', '', '1', '9', '5', '', '', ''],
  ['', '9', '8', '', '', '', '', '6', ''],
  ['8', '', '', '', '6', '', '', '', '3'],
  ['4', '', '', '8', '', '3', '', '', '1'],
  ['7', '', '', '', '2', '', '', '', '6'],
  ['', '6', '', '', '', '', '2', '8', ''],
  ['', '', '', '4', '1', '9', '', '', '5'],
  ['', '', '', '', '8', '', '', '7', '9']
]

function createEmptyBoard() {
  return Array.from({ length: 9 }, () => Array(9).fill(''))
}

// 收集格子对应的 input 元素，用于方向键切换
const cellRefs = []
function setCellRef(el, i, j) {
  if (!cellRefs[i]) cellRefs[i] = []
  cellRefs[i][j] = el
}

// 只允许输入一位 1-9
function onInput(i, j) {
  const v = String(board.value[i][j] || '').replace(/[^1-9]/g, '')
  board.value[i][j] = v.slice(-1)
}

// 方向键在格子间移动
function onKeydown(e, i, j) {
  const dirs = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }
  const d = dirs[e.key]
  if (!d) return
  e.preventDefault()
  const ni = Math.max(0, Math.min(8, i + d[0]))
  const nj = Math.max(0, Math.min(8, j + d[1]))
  cellRefs[ni]?.[nj]?.focus()
}

// 检查初始数字之间是否冲突（行/列/九宫格重复），返回冲突提示，无冲突返回 null
function findConflict(b) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const val = b[i][j]
      if (!val) continue
      for (let k = 0; k < 9; k++) {
        if (k !== j && b[i][k] === val) return `第 ${i + 1} 行存在重复数字 ${val}`
        if (k !== i && b[k][j] === val) return `第 ${j + 1} 列存在重复数字 ${val}`
      }
      const startRow = Math.floor(i / 3) * 3
      const startCol = Math.floor(j / 3) * 3
      for (let r = startRow; r < startRow + 3; r++) {
        for (let c = startCol; c < startCol + 3; c++) {
          if ((r !== i || c !== j) && b[r][c] === val) {
            return `(${i + 1},${j + 1}) 所在九宫格存在重复数字 ${val}`
          }
        }
      }
    }
  }
  return null
}

function startSolve() {
  // 先检查初始数字是否有冲突
  const conflict = findConflict(board.value)
  if (conflict) {
    ElMessage.warning(conflict)
    return
  }

  initialBoard.value = board.value.map(row => [...row])
  // 空格从 '' 转成求解函数需要的 '.'
  const input = board.value.map(row => row.map(c => (c === '' ? '.' : c)))

  const start = performance.now()
  const result = solveSudoku(input)
  const cost = performance.now() - start

  // 结果中还有 '.' 说明无解
  if (result.some(row => row.includes('.'))) {
    ElMessage.error('该数独无解，请检查初始数字')
    return
  }

  board.value = result
  solved.value = true
  status.value = `求解成功，耗时 ${cost.toFixed(1)} ms`
}

// 重置：去掉求解结果，恢复为初始数字，可继续修改
function resetBoard() {
  board.value = initialBoard.value.map(row => [...row])
  solved.value = false
  status.value = ''
}

function loadExample() {
  board.value = EXAMPLE_BOARD.map(row => [...row])
  solved.value = false
  status.value = ''
}

function clearBoard() {
  board.value = createEmptyBoard()
  initialBoard.value = createEmptyBoard()
  solved.value = false
  status.value = ''
}
</script>

<style>
.app-container {
  width: 100%;
  max-width: 1200px;
  text-align: center;
  padding: 20px;
}

.sudoku-title {
  margin: 0 0 8px;
  font-size: 24px;
  color: #303133;
}

.sudoku-tip {
  margin: 0 0 20px;
  font-size: 14px;
  color: #909399;
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  width: min(92vw, 480px);
  margin: 0 auto;
  border: 3px solid #303133;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.sudoku-cell {
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid #dcdfe6;
  text-align: center;
  font-size: 22px;
  line-height: 1;
  color: #606266;
  outline: none;
  background: #fff;
  caret-color: #409eff;
  padding: 0;
}

.sudoku-cell:focus {
  background: #ecf5ff;
  box-shadow: inset 0 0 0 2px #409eff;
  position: relative;
  z-index: 1;
}

/* 3x3 宫的边界加粗 */
.sudoku-bd-r {
  border-right: 2px solid #303133;
}

.sudoku-bd-b {
  border-bottom: 2px solid #303133;
}

/* 用户输入的初始数字 */
.sudoku-cell-given {
  font-weight: 700;
  color: #303133;
  background: #f5f7fa;
}

/* 求解得到的数字 */
.sudoku-cell-solved {
  font-weight: 600;
  color: #409eff;
  animation: sudoku-pop 0.3s ease both;
}

@keyframes sudoku-pop {
  from {
    opacity: 0;
    transform: scale(0.3);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.sudoku-actions {
  margin-top: 20px;
}

.sudoku-status {
  margin: 12px 0 0;
  font-size: 14px;
  color: #67c23a;
}
</style>
