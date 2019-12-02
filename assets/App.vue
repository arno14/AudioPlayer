<template>
  <v-app>
    <v-app-bar fixed dark>
      <v-toolbar-title>{{ filename }}</v-toolbar-title>
      <v-btn icon @click="stop()" v-if="isPlaying && filename" title="Play">
        <v-icon>fa fa-stop</v-icon>
      </v-btn>
      <v-btn icon @click="play()" v-if="!isPlaying && filename" title="Stop">
        <v-icon>fa fa-play</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn
          icon
          title="Playlist"
          :to="{ name: 'playlist', query: $route.query }"
        >
          <v-badge>
            <template v-if="playlistCount" v-slot:badge>{{
              playlistCount
            }}</template>
            <v-icon>fa fa-list</v-icon>
          </v-badge>
        </v-btn>
        <v-btn
          icon
          title="Explorer"
          :to="{ name: 'explorer', query: $route.query }"
        >
          <v-icon>fa fa-folder-open</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <!-- <span class="spacer"></span> -->
    <div class="content">
      <router-view
        v-bind:currentDir="currentDir"
        v-bind:playlist="playlist"
        v-bind:isPlaying="isPlaying"
        v-bind:volume="volume"
        v-bind:term="term"
        v-bind:countLoading="countLoading"
        @list="list"
        @play="play"
        @stop="stop"
        @playlistAdd="playlistAdd"
        @playlistRemove="playlistRemove"
        @volumeChange="volumeChange"
        @search="search"
      ></router-view>
    </div>
  </v-app>
</template>

<script>
import io from 'socket.io-client';

const axios = require('axios');

const socket = io({
  transports: ['websocket']
}).connect();
// const socket = io.connect(); // localhost:8015

const playerpath = '/';
export default {
  name: 'App',
  data() {
    return {
      isPlaying: false,
      playlist: null,
      currentDir: {},
      countLoading: 0,
      volume: null,
      term: null
    };
  },
  computed: {
    filename() {
      if (this.playlist && this.playlist.current) {
        return this.playlist.current.name;
      }
      return null;
    },
    playlistCount() {
      if (this.playlist && this.playlist.list) {
        return this.playlist.list.length;
      }
      return 0;
    }
  },
  mounted() {
    this.countLoading += 1;
    axios.get(`${playerpath}app-state`).then(resp => {
      this.applyResponse(resp);
      if (!this.playlistCount && this.$route.name !== 'explorer') {
        //redirect to Explorer if playlist is empty
        this.$router.replace({ name: 'explorer', query: this.$route.query });
      }
    });

    if (this.$route.query.term) {
      this.search(this.$route.query.term);
    } else {
      this.list(this.$route.query.pathname);
    }

    socket.on('connect', () => {
      socket.on('appState', data => {
        this.applyResponse({ data });
      });
    });
  },
  methods: {
    play(i) {
      axios.post(`${playerpath}play`, { item: i }).then(this.applyResponse);
    },
    stop() {
      axios.post(`${playerpath}stop`).then(this.applyResponse);
    },
    volumeChange(volume) {
      axios.post(`${playerpath}volume`, { volume }).then(this.applyResponse);
    },
    // pause() {
    //   axios.post(playerpath + "pause").then(this.applyResponse);
    // },
    playlistAdd(i) {
      axios
        .post(`${playerpath}playlist/add`, { item: i })
        .then(this.applyResponse);
    },
    playlistRemove(i) {
      axios
        .post(`${playerpath}playlist/remove`, { item: i })
        .then(this.applyResponse);
    },
    playlistClear() {
      axios.post(`${playerpath}playlist/clear`).then(this.applyResponse);
    },
    search(term) {
      this.term = term;
      this.countLoading += 1;
      if (this.$route.query.term !== term) {
        // console.log("router replace pathname", pathname);
        this.$router.replace({ query: { term } });
      }
      axios.get(`${playerpath}list`, { params: { term } }).then(resp => {
        // console.log("post list ", i, this.$route.query)
        this.countLoading -= 1;
        this.currentDir = resp.data;
      });
    },
    list(i = null) {
      // console.log("list ", i, this.$route.query);
      let pathname = null;
      if (typeof i === 'string') {
        pathname = i;
      } else if (i) {
        pathname = i.path
          .split('/')
          .concat([i.name])
          .filter(Boolean)
          .join('/');
      }
      if (this.$route.query.pathname !== pathname) {
        // console.log("router replace pathname", pathname);
        this.$router.replace({ query: { pathname } });
      }

      this.countLoading += 1;
      axios.get(`${playerpath}list`, { params: { pathname } }).then(resp => {
        // console.log("post list ", i, this.$route.query)
        this.countLoading -= 1;
        this.currentDir = resp.data;
      });
    },
    applyResponse(resp) {
      this.countLoading -= 1;
      this.isPlaying = resp.data.isPlaying;
      this.playlist = resp.data.playlist;
      this.volume = resp.data.volume;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.v-list-item__action {
  align-self: flex-start !important;
}
.router-link.router-link-active {
  background: red;
}
.active_playing {
  border: 1px dashed black;
}
.content {
  margin-top: 3.5em;
  margin-bottom: 3.5em;
}
</style>
