# Notion Tasks Timer

Десктопное приложение для трекинга времени задач из Notion Database с drag & drop и системой таймеров.

## Что делает

- Синхронизирует задачи из Notion Database
- Позволяет задавать планируемое время (до 8 часов)
- Запуск/остановка таймеров с сохранением между сессиями
- Локальное изменение порядка задач (drag & drop только за handle)
- Визуальный прогресс выполнения с цветовой индикацией
- Темная/светлая/системная тема

## Техническая архитектура

**Stack:** Electron + Vue 3 + TypeScript + TailwindCSS + Pinia

**Структура:**
```
src/
├── main.ts, preload.ts           # Electron main/preload процессы
├── renderer/
│   ├── views/                    # Экраны (Tasks, Settings, Stats)
│   ├── components/               # UI компоненты
│   └── composables/              # Переиспользуемая логика
├── stores/                       # Pinia stores (app, tasks, timers, notion)
└── types/                        # TypeScript типы
```

**Ключевые решения:**
- Notion API вызовы в main процессе через IPC (обход CORS)
- Таймеры работают в фоне с auto-resume после перезапуска
- Локальное сохранение в localStorage (порядок задач, состояние таймеров)
- Строгая типизация + composition API + `<script setup>`

## Запуск

```bash
npm install
npm run build:electron
npm run dev
```

**Настройка:** Settings → API Token + Database ID из Notion