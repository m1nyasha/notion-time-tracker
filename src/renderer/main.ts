import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from '@/router'
import App from './App.vue'
import './style.css'

// Создаем приложение Notion Tasks Timer
const app = createApp(App)

// Подключаем Pinia для управления состоянием
const pinia = createPinia()
app.use(pinia)

// Подключаем Vue Router
app.use(router)

// Монтируем приложение
app.mount('#app')

// Development helpers
if (import.meta.env.DEV) {
  ;(window as any).__NOTION_TASKS_APP__ = {
    app,
    pinia,
    router,
    version: '1.0.0'
  }
}
