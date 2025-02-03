import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

Date.prototype.getYearWeek = function() {
  // Create a UTC date to avoid time zone issues
  let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
  // Adjust to the next Thursday (Monday-based week)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const year = d.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  // Calculate days difference and week number
  const diffDays = Math.ceil((d - jan1) / 86400000);
  const week = Math.ceil((diffDays + 1) / 7);
  return `${year}-W${week.toString().padStart(2, '0')}`;
};

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')
