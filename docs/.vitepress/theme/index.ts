// .vitepress/theme/index.js
import './custom.css'
import 'uno.css'
import Theme from 'vitepress/theme'
import Layout from './Layout.vue'

import Tab from '../components/Tab.vue'
import Tabs from '../components/Tabs.vue'

export default {
  ...Theme,
  Layout,
  enhanceApp({ app }) {
    // Globally register components so they don't have to be imported in the template.
    app.component('Tabs', Tabs)
    app.component('Tab', Tab)
  }
}
