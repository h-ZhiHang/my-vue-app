import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import * as am5 from '@amcharts/amcharts5'
import * as am5index from '@amcharts/amcharts5/index'
import * as am5xy from '@amcharts/amcharts5/xy'
import * as am5radar from '@amcharts/amcharts5/radar'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import * as am5percent from '@amcharts/amcharts5/percent'
import * as am5map from '@amcharts/amcharts5/map'
import * as am5hierarchy from '@amcharts/amcharts5/hierarchy'
import * as am5flow from '@amcharts/amcharts5/flow'
import router from './router'
import '@/style/index.scss'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
