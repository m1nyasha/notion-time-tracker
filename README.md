# Notion Tasks Timer

Десктопное приложение для трекинга времени задач из Notion Database с продвинутой системой фильтрации и таймерами.

## Основные возможности

**📋 Синхронизация с Notion:**
- Поддержка всех типов свойств (статус, выбор, даты, люди, числа, текст, флажки)
- Автоматическое получение структуры базы данных

**🔍 Система фильтрации:**
- Фильтры по любым свойствам с операторами (содержит, равно, больше/меньше, пустое)
- Быстрые фильтры по статусам с счетчиками задач
- Сортировка по всем свойствам (возрастание/убывание)
- Сохраняемые пресеты фильтров
- Сворачиваемая панель фильтров

**⏱️ Таймеры:**
- Планируемое время выполнения (до 8 часов)
- Запуск/остановка с сохранением между сессиями
- Визуальный прогресс и цветовая индикация (зеленый/синий/красный)
- Статистика по времени работы

**🎯 UX/UI:**
- Drag & drop для изменения порядка (блокируется при активных фильтрах)
- Темная/светлая/системная тема
- Адаптивная верстка с кастомными скроллбарами

## Техническая архитектура

**Stack:** Electron + Vue 3 + TypeScript + TailwindCSS + Pinia

**Архитектура:**
```
src/
├── main.ts, preload.ts           # Electron main/preload (Notion API через IPC)
├── renderer/
│   ├── views/                    # TasksView, SettingsView, TimerStatsView
│   ├── components/               # Декомпозированные UI компоненты
│   └── composables/              # useTimer, useNotionApi
├── stores/                       # filters, tasks, timers, notion, app
└── types/                        # notion, filters, timer, app типы
```

**Компоненты (~50-150 строк каждый):**
- `FilterBar` + `FilterEditor` + `FilterChip` - система фильтрации
- `TaskItem` + `TaskProperties` + `TaskStatus` - отображение задач  
- `TaskTimer` + `TimerControls` + `TimerDisplay` - таймеры
- `TasksList` + `TasksHeader` - управление списком

**Технические решения:**
- **IPC Architecture:** Notion API в main процессе для обхода CORS ограничений
- **Reactive State:** Pinia + computed для реактивности фильтров и таймеров
- **Persistence:** localStorage для порядка задач, таймеров, фильтров, настроек
- **Clean Code:** Декомпозиция на компоненты <150 строк, строгая типизация
- **Performance:** Computed caching, эффективная фильтрация, виртуализация скролла

## Запуск

```bash
npm install
npm run build:electron
npm run dev
```

**Настройка:** Settings → API Token + Database ID из Notion