<template>
  <div class="book-container">
    <div class="book" :style="{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }">
      <!-- 封面 -->
      <div class="cover">
        <div class="cover-content">
          <h2>{{ bookTitle }}</h2>
          <p>{{ bookSubtitle }}</p>
        </div>
      </div>

      <!-- 页面 -->
      <div
        v-for="(page, index) in pages"
        :key="index"
        class="page"
        :class="{ active: index === currentPage }"
        :style="{
          transform: getPageTransform(index),
          zIndex: getPageZIndex(index),
          'background-image': `url(${pageBackground})`,
        }"
        @click="nextPage"
      >
        <div class="page-content">
          <h3>{{ page.title }}</h3>
          <p>{{ page.content }}</p>
        </div>
      </div>

      <!-- 封底 -->
      <div class="back-cover">
        <div class="cover-content">
          <h2>阅读结束</h2>
          <p>感谢您的阅读</p>
        </div>
      </div>
    </div>

    <div class="controls">
      <button class="btn prev" @click="prevPage" :disabled="currentPage === 0">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
          />
        </svg>
        上一页
      </button>

      <div class="page-indicator">{{ currentPage + 1 }} / {{ pages.length + 1 }}</div>

      <button class="btn next" @click="nextPage" :disabled="currentPage === pages.length">
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
          <path
            d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
          />
        </svg>
        下一页
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  props: {
    bookTitle: {
      type: String,
      default: 'Vue3 魔法书',
    },
    bookSubtitle: {
      type: String,
      default: '探索现代前端框架的奥秘',
    },
    pages: {
      type: Array,
      default: () => [
        {
          title: '第一章：Vue3 介绍',
          content:
            'Vue.js 3 是一个用于构建用户界面的渐进式框架。它完全重写了 Vue 2 的核心，提供了更好的性能、更小的包大小、改进的 TypeScript 支持以及新的 Composition API。',
        },
        {
          title: '第二章：组合式 API',
          content:
            '组合式 API 是 Vue 3 的主要新特性之一，它允许开发者更灵活地组织和复用代码逻辑。通过 setup() 函数和响应式 API（如 ref 和 reactive），开发者可以更清晰地管理组件状态和逻辑。',
        },
        {
          title: '第三章：响应式系统',
          content:
            'Vue 3 使用 Proxy 重写了响应式系统，取代了 Vue 2 的 Object.defineProperty。这一改变带来了更好的性能、更完整的功能支持（如数组和对象属性的检测）以及更高效的内存使用。',
        },
        {
          title: '第四章：性能优化',
          content:
            'Vue 3 在性能方面做了大量优化：更快的虚拟 DOM、更小的包大小、改进的编译策略等。这些改进使得 Vue 3 在大多数场景下比 Vue 2 快 2 倍以上，同时包大小减少了 41%。',
        },
      ],
    },
  },
  setup(props) {
    const currentPage = ref(0)
    const rotateX = ref(10)
    const rotateY = ref(-10)
    const pageBackground = computed(() => {
      return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%23f9f6f0'/><path d='M0 0 L100 100 M100 0 L0 100' stroke='%23e0d6c3' stroke-width='0.5' opacity='0.1'/></svg>`
    })

    const getPageTransform = (index) => {
      if (index < currentPage.value) {
        return 'rotateY(-180deg)'
      } else if (index === currentPage.value) {
        return 'rotateY(-180deg)'
      }
      return 'rotateY(0deg)'
    }

    const getPageZIndex = (index) => {
      // 确保当前页面和即将翻动的页面在顶部
      if (index === currentPage.value) {
        return props.pages.length - index + 10
      }
      return props.pages.length - index
    }

    const nextPage = () => {
      if (currentPage.value < props.pages.length) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 0) {
        currentPage.value--
      }
    }

    return {
      currentPage,
      rotateX,
      rotateY,
      pageBackground,
      getPageTransform,
      getPageZIndex,
      nextPage,
      prevPage,
    }
  },
}
</script>

<style scoped>
.book-container {
  perspective: 2000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px 0;
}

.book {
  position: relative;
  width: 400px;
  height: 550px;
  transform-style: preserve-3d;
  transform: rotateX(10deg) rotateY(-10deg);
  transition: transform 0.5s ease;
  margin-bottom: 40px;
}

.book:hover {
  transform: rotateX(10deg) rotateY(-5deg);
}

.cover,
.back-cover {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(45deg, #2c3e50, #4a6491);
  border-radius: 0 8px 8px 0;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.3);
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 30px;
}

.cover {
  transform: translateZ(20px);
  border-left: 4px solid #ffd700;
}

.cover-content h2 {
  font-size: 2.2rem;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.cover-content p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.back-cover {
  transform: rotateY(180deg) translateZ(20px);
  background: linear-gradient(45deg, #1a2a6c, #3a5a9c);
}

.page {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 0 8px 8px 0;
  transform-origin: left center;
  transition: transform 0.8s cubic-bezier(0.645, 0.045, 0.355, 1);
  box-shadow:
    inset 0 0 10px rgba(0, 0, 0, 0.05),
    5px 0 15px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #333;
  font-size: 1.1rem;
  line-height: 1.6;
  text-align: left;
  overflow: hidden;
  cursor: pointer;
}

.page-content {
  max-width: 320px;
}

.page h3 {
  font-size: 1.6rem;
  margin-bottom: 20px;
  color: #2c3e50;
  text-align: center;
}

.page p {
  margin-bottom: 15px;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.btn {
  background: linear-gradient(to right, #3498db, #2c3e50);
  color: white;
  border: none;
  padding: 12px 30px;
  font-size: 1.1rem;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

.btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  opacity: 0.7;
}

.page-indicator {
  background: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 50px;
  font-weight: bold;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  min-width: 100px;
  text-align: center;
}

@media (max-width: 768px) {
  .book {
    width: 300px;
    height: 450px;
  }

  .cover-content h2 {
    font-size: 1.8rem;
  }

  .page-content {
    padding: 20px;
  }

  .page h3 {
    font-size: 1.4rem;
  }

  .page p {
    font-size: 1rem;
  }

  .btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>
