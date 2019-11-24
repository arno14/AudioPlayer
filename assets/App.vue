<template>
  <v-app>
    <v-app-bar fixed>
      <v-toolbar-title>{{filename}}</v-toolbar-title>
      <v-btn icon @click="stop()" v-if="isPlaying && filename" title="Play">
        <v-icon>fa fa-stop</v-icon>
      </v-btn>
      <v-btn icon @click="play()" v-if="!isPlaying && filename" title="Stop">
        <v-icon>fa fa-play</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <!-- <router-link :to="{name: 'playlist', query:$route.query}" replace>GO to Playlist</router-link> -->
        <v-btn icon title="Playlist" :to="{name: 'playlist', query:$route.query}">
          <v-badge>
            <template v-if="playlistCount" v-slot:badge>{{playlistCount}}</template>
            <v-icon>fa fa-list</v-icon>
          </v-badge>
        </v-btn>
        <v-btn icon title="Explorer" :to="{name:'explorer', query: $route.query}">
          <v-icon>fa fa-folder-open</v-icon>
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>
    <!-- <span class="spacer"></span> -->
    <div class="content">
      <div>
        <v-text-field color="success" v-bind:loading="countLoading>0" disabled></v-text-field>
      </div>
      <router-view
        v-bind:currentDir="currentDir"
        v-bind:playlist="playlist"
        v-bind:isPlaying="isPlaying"
        @list="list"
        @play="play"
        @stop="stop"
        @playlistAdd="playlistAdd"
        @playlistRemove="playlistRemove"
      ></router-view>
    </div>
  </v-app>
</template>

<script>
const axios = require("axios");

import io from "socket.io-client";
var socket = io.connect(); //localhost:8015

const playerpath = "/";
export default {
  name: "App",
  data() {
    return {
      isPlaying: false,
      playlist: null,
      currentDir: {},
      countLoading: 0
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
    this.countLoading++;
    axios.get(playerpath + "app-state").then(resp => {
      this.applyResponse(resp);
      if (this.playlistCount) {
        return;
      }
      if (this.$route.name !== "explorer") {
        console.log("redirect to explorer, no playlist");
        this.$router.replace({ name: "explorer", query: this.$route.query });
      }
    });
    this.list(this.$route.query.pathname);
    socket.on("connect", data => {
      // console.log('on connect');
      socket.on("appState", data => {
        // console.log("websocket, appState", data );
        this.applyResponse({ data });
      });
    });
  },
  methods: {
    play(i) {
      axios.post(playerpath + "play", { item: i }).then(this.applyResponse);
    },
    stop() {
      axios.post(playerpath + "stop").then(this.applyResponse);
    },
    // pause() {
    //   axios.post(playerpath + "pause").then(this.applyResponse);
    // },
    playlistAdd(i) {
      axios
        .post(playerpath + "playlist/add", { item: i })
        .then(this.applyResponse);
    },
    playlistRemove(i) {
      axios
        .post(playerpath + "playlist/remove", { item: i })
        .then(this.applyResponse);
    },
    playlistClear() {
      axios.post(playerpath + "playlist/clear").then(this.applyResponse);
    },
    list(i = null) {
      // console.log("list ", i, this.$route.query);
      let pathname = null;
      if (typeof i === "string") {
        pathname = i;
      } else if (i) {
        pathname = i.path;
        pathname += i.path && i.name ? "/" : "";
        pathname += i.name;
      }
      if (this.$route.query.pathname !== pathname) {
        // console.log("router replace pathname", pathname);
        this.$router.replace({ query: { pathname } });
      }

      this.countLoading++;
      axios.get(playerpath + "list", { params: { pathname } }).then(resp => {
        // console.log("post list ", i, this.$route.query)
        this.countLoading--;
        this.currentDir = resp.data;
      });
    },
    applyResponse(resp) {
      this.countLoading--;
      this.isPlaying = resp.data.isPlaying;
      this.playlist = resp.data.playlist;
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
  margin-top: 1.5em;
}
.playlist-counter {
  font-weight: bold;
  background-color: crimson;
  color: black;
  display: inline-block;
  padding: 0.4em;
  border-radius: 50%;
  width: 2em;
  height: 2em;
}
a {
  color: #42b983;
}
</style>
