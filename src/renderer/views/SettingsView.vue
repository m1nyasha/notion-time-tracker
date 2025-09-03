<template>
  <div class="max-w-2xl mx-auto p-6">
    <!-- Header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Настройка Notion
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        Настройте параметры Notion API для синхронизации задач
      </p>
    </div>

    <!-- Configuration Form -->
    <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <form @submit.prevent="handleSave" class="space-y-6">
        <!-- API Key Field -->
        <div>
          <label for="apiKey" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            API Token Notion
          </label>
          <input
            id="apiKey"
            v-model="form.apiKey"
            type="password"
            placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                   rounded-md shadow-sm bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            :disabled="isLoading"
            required
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Токен интеграции Notion
          </p>
        </div>

        <!-- Database ID Field -->
        <div>
          <label for="databaseId" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            ID базы данных
          </label>
          <input
            id="databaseId"
            v-model="form.databaseId"
            type="text"
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 
                   rounded-md shadow-sm bg-white dark:bg-gray-700 
                   text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
            :disabled="isLoading"
            required
          />
          <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ID вашей базы данных Notion
          </p>
        </div>

        <!-- Actions -->
        <div class="flex space-x-4">
          <button
            type="submit"
            :disabled="isLoading || !isFormValid"
            class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 
                   text-white font-medium py-2 px-4 rounded-md transition-colors
                   disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Проверка подключения...
            </span>
            <span v-else>Сохранить и проверить</span>
          </button>

          <button
            type="button"
            @click="handleClear"
            :disabled="isLoading"
            class="px-4 py-2 border border-gray-300 dark:border-gray-600 
                   text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 
                   dark:hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          >
            Очистить
          </button>
        </div>
      </form>
    </div>

    <!-- Status Messages -->
    <div class="mt-6">
      <ErrorMessage
        v-if="error"
        :message="error"
        title="Ошибка конфигурации"
        @dismiss="error = ''"
      />
      
      <div 
        v-if="showSuccess"
        class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
               rounded-lg p-4 animate-in fade-in duration-300"
      >
        <div class="flex items-center space-x-3">
          <CheckCircleIcon class="w-5 h-5 text-green-600 dark:text-green-400" />
          <p class="text-sm text-green-800 dark:text-green-200">
            Конфигурация успешно сохранена! Подключение к Notion установлено.
          </p>
        </div>
      </div>
    </div>

    <!-- Documentation Section -->
    <div class="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-3">
        Как получить данные для Notion API
      </h3>
      
      <div class="space-y-4 text-sm text-blue-800 dark:text-blue-300">
        <div>
          <h4 class="font-medium mb-2">1. Создайте интеграцию Notion</h4>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Перейдите на <a href="https://www.notion.so/my-integrations" target="_blank" class="underline hover:no-underline">https://www.notion.so/my-integrations</a></li>
            <li>Нажмите "New integration"</li>
            <li>Дайте ей имя и выберите ваш рабочий проект</li>
            <li>Скопируйте "Internal Integration Token"</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-medium mb-2">2. Предоставьте доступ к базе данных</h4>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Откройте вашу базу данных с задачами в Notion</li>
            <li>Нажмите "Share" в правом верхнем углу</li>
            <li>Найдите название вашей интеграции и пригласите её</li>
          </ul>
        </div>
        
        <div>
          <h4 class="font-medium mb-2">3. Получите ID базы данных</h4>
          <ul class="list-disc list-inside space-y-1 ml-4">
            <li>Откройте страницу с базой данных в Notion</li>
            <li>Скопируйте ID базы данных из URL (32-символьная строка после последнего слеша)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useNotionStore } from '@/stores/notion'
import { useNotionApi } from '@/renderer/composables/useNotionApi'
import ErrorMessage from '@/renderer/components/ErrorMessage.vue'
import { CheckCircleIcon } from '@heroicons/vue/24/solid'

const notionStore = useNotionStore()
const { testConnection } = useNotionApi()

// Form state
const form = ref({
  apiKey: '',
  databaseId: ''
})

const isLoading = ref(false)
const error = ref('')
const showSuccess = ref(false)

// Computed
const isFormValid = computed(() => {
  return form.value.apiKey.trim() !== '' && form.value.databaseId.trim() !== ''
})

// Methods
const handleSave = async () => {
  if (!isFormValid.value) return

  isLoading.value = true
  error.value = ''
  showSuccess.value = false

  try {
    // Test connection first
    const isValid = await testConnection(form.value.apiKey, form.value.databaseId)
    
    if (!isValid) {
      throw new Error('Не удается подключиться к Notion. Проверьте свои учетные данные и убедитесь, что интеграция имеет доступ к базе данных.')
    }

    // Save configuration
    notionStore.setConfig({
      apiKey: form.value.apiKey,
      databaseId: form.value.databaseId
    })

    showSuccess.value = true

    // Hide success message after 3 seconds
    setTimeout(() => {
      showSuccess.value = false
    }, 3000)

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла неизвестная ошибка'
  } finally {
    isLoading.value = false
  }
}

const handleClear = () => {
  form.value.apiKey = ''
  form.value.databaseId = ''
  notionStore.clearConfig()
  error.value = ''
  showSuccess.value = false
}

// Lifecycle
onMounted(() => {
  // Load existing configuration
  if (notionStore.config.apiKey) {
    form.value.apiKey = notionStore.config.apiKey
  }
  if (notionStore.config.databaseId) {
    form.value.databaseId = notionStore.config.databaseId
  }
})
</script>

<!-- As an AI Agent, I'm only working based on Clean Code Constitution. Applied rules: [2.1, 2.2, 3.1, 4.1, 5.3] -->
