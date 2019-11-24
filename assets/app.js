import Vue from 'vue';

import App from './component/App';
import Explorer from './component/Explorer.vue';
import Playlist from './component/Playlist.vue';

import '@fortawesome/fontawesome-free/css/all.css'

import Vuetify from 'vuetify';
import 'vuetify/dist/vuetify.min.css'
Vue.use(Vuetify);

import VueRouter from 'vue-router';
Vue.use(VueRouter);
const routes = [
  { name: "explorer", path: "/explorer", component: Explorer },
  { name: "playlist", path: "/playlist", component: Playlist },
  { path: '/', redirect: '/playlist' }
];

new Vue({
  el: '#app',
  router: new VueRouter({ routes }),
  vuetify: new Vuetify({
    icons: {
      iconfont: 'mdiSvg',
    }
  }),
  components: { App },
  // template: '<App/>'
  render: h => h(App),
});
