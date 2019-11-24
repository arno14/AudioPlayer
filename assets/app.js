import Vue from 'vue';

import '@fortawesome/fontawesome-free/css/all.css';
import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css';

import VueRouter from 'vue-router';


import App from './App.vue';
import Explorer from './Explorer.vue';
import Playlist from './Playlist.vue';

Vue.use(Vuetify);
Vue.use(VueRouter);
const routes = [
  { name: 'explorer', path: '/explorer', component: Explorer },
  { name: 'playlist', path: '/playlist', component: Playlist },
  { path: '/', redirect: '/playlist' },
];

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  router: new VueRouter({ routes }),
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdiSvg',
    },
  }),
  components: { App },
  // template: '<App/>'
  render: (h) => h(App),
});
