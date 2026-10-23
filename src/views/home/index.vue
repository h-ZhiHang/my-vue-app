<script setup>
// 导入依赖
import router from '@/router'
import { ref, onMounted } from 'vue'
// props

// 状态声明
const obj = {
  name: '1',
  age: 2,
}
const obj1 = ref()
const obj2 = ref()
// watch
onMounted(() => {
  obj1.value = obj
  obj2.value = obj
})
// 接口请求
function jump() {
  router.push('/talk')
}
function jumpMap() {
  router.push('/map')
}
function jumpBook() {
  router.push('/book')
}

function change() {
  obj1.value = {
    name: '11',
    age: 22,
  }
  console.log('obj1=====>', obj1.value, 'obj2=====>', obj2.value)
}

function change2() {
  obj1.value = obj2.value
  console.log('obj1=====>', obj1.value, 'obj2=====>', obj2.value)
}

function change3(){
router.push('/upload')
}
// 函数逻辑
</script>

<template>
  <div class="main">
    <div class="a">欢迎来到聊天者联盟</div>
    <el-button type="success" class="btn" round @click="jump">点我去聊天</el-button>
    <el-button type="success" class="btn" round @click="jumpMap">点我去地图</el-button>
    <el-button type="success" class="btn" round @click="jumpBook">点我去看书</el-button>
    <el-button type="success" class="btn" round @click="change">修改数据</el-button>
    <el-button type="success" class="btn" round @click="change2">恢复数据</el-button>
    <el-button type="success" class="btn" round @click="change3">上传excel表格解析</el-button>
    <!-- <img
      class="bg"
      src="https://s1.aigei.com/prevfiles/5d6f8364a4f34744a13a7296ee33187b.gif?e=2051020800&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:LF73HwqEgNzvaHsUhvfZkLgzAAg="
    /> -->
  </div>
</template>

<style lang="scss" scoped>
.main {
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.a {
  width: 100%;
  height: 100%;
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  color: skyblue;
}
.btn {
  margin-top: 50px;
  width: 150px;
}
.bg {
  width: 800px;
  margin: 50px auto 0;
}
</style>
