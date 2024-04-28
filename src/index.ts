import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import UIkit from 'uikit'
import Icons from 'uikit/dist/js/uikit-icons'

import 'uikit/dist/css/uikit.min.css'

// SETUP
UIkit.use(Icons)
// UIkit.notification('Hello world.')

const pinia = createPinia()
const app = createApp(App).use(pinia)
app.mount('#app')
