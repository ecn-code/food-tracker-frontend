import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// Vuetify
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'

loadFonts()

Date.prototype.getYearWeek = function() {
  var onejan = new Date(this.getFullYear(),0,1);
  var today = new Date(this.getFullYear(),this.getMonth(),this.getDate());
  var dayOfYear = ((today - onejan + 86400000)/86400000);
  const year = onejan.getFullYear();
  return `${year}-W${new String(Math.ceil(dayOfYear/7)).padStart(2, '0')}`;
};

createApp(App)
  .use(createPinia())
  .use(router)
  .use(vuetify)
  .mount('#app')
