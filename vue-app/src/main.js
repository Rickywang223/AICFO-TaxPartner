import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import 'ant-design-vue/dist/reset.css'
import App from './App.vue'
import AgentWorkspace from './components/AgentWorkspace.vue'
import AgentCockpit from './components/AgentCockpit.vue'
import CapabilityCenter from './components/CapabilityCenter.vue'
import KnowledgeBase from './components/KnowledgeBase.vue'

const routes = [
  { path: '/', redirect: '/cockpit' },
  { path: '/cockpit', component: AgentCockpit },
  { path: '/workspace/:agentId', component: AgentWorkspace },
  { path: '/capabilities', component: CapabilityCenter },
  { path: '/knowledge', component: KnowledgeBase },
  { path: '/agent-manage', component: CapabilityCenter },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(Antd)
app.use(router)
app.mount('#app')
