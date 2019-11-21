import Vue from 'vue';
import App from './component/App';

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify);

// Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  vuetify : new Vuetify(),
  components:{App},
  template: '<App/>'
  // render: h => h(App),
});
