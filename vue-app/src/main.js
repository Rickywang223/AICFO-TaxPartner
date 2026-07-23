import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import CapabilityCenter from './components/CapabilityCenter.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'

const routes = [
  { path: '/', redirect: '/capabilities' },
  { path: '/capabilities', component: CapabilityCenter },
  { path: '/knowledge', component: KnowledgeBase },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(Antd)
app.use(router)
app.mount('#app')
