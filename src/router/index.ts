import { createRouter, createWebHashHistory } from 'vue-router'
import TasksView from '@/renderer/views/TasksView.vue'
import SettingsView from '@/renderer/views/SettingsView.vue'
import TimerStatsView from '@/renderer/views/TimerStatsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/tasks'
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: TasksView,
    meta: {
      title: 'Tasks'
    }
  },
  {
    path: '/settings', 
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Settings'
    }
  },
  {
    path: '/stats',
    name: 'stats', 
    component: TimerStatsView,
    meta: {
      title: 'Timer Stats'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router

// As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [1.1, 3.1, 5.3]
