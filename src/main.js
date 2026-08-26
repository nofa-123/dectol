import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from '@/App.vue'
import router from '@/router'
import { vReveal } from '@/composables/useScrollAnimation'
import { vImageFallback } from '@/directives/imageFallback'

import '@/styles/fonts.css'
import '@/styles/tokens.css'
import '@/styles/base.css'
import '@/styles/utilities.css'
import '@/styles/landing.css'
import '@/styles/home-mobile-design.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// `v-reveal` is used by nearly every section, so it is registered globally
// rather than imported into each component.
app.directive('reveal', vReveal)
app.directive('image-fallback', vImageFallback)

app.mount('#app')
