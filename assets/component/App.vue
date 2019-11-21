/* eslint-disable */

<template>
  <v-app>
    <!-- <v-navigation-drawer permanent app fixed > -->

    <v-app-bar fixed>
      <v-toolbar-title>{{filename}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items>
        <v-btn icon>
        <span v-if="hasPlaylist" class="playlist-counter">{{playlist.list.length}}</span>
        </v-btn>
        <!-- <v-btn icon @click="playlistClear()" v-if="hasPlaylist && !displayExplorer" title="Play">
          <span class="fa fa-trash" />
        </v-btn>-->
        <v-btn icon @click="stop()" v-if="isPlaying && filename" title="Play">
          <span class="fa fa-stop" />
        </v-btn>
        <v-btn icon @click="start()" v-if="!isPlaying && filename" title="Stop">
          <span class="fa fa-play" />
        </v-btn>
        <v-btn
          icon
          @click="displayExplorer=false"
          v-if="hasPlaylist &&  displayExplorer"
          title="Playlist"
        >
          <span class="fa fa-list" />
        </v-btn>
        <v-btn icon @click="displayExplorer=true" v-if="!displayExplorer" title="Explorer">
          <span class="fa fa-folder" />
        </v-btn>
      </v-toolbar-items>
    </v-app-bar>

    <!-- <span class="spacer"></span> -->
    <div class="content">
      <v-list v-if="hasPlaylist && !displayExplorer">
        <v-list-item
          v-for="(f,k) in playlist.list"
          :key="k"
          :class="{active_playing:k==playlist.currentIndex}"
          :title="JSON.stringify(f)"
        >
          <v-list-item-icon>
            <span
              v-if="k!=playlist.currentIndex || !isPlaying"
              class="fa fa-play"
              @click="play(f)"
            />
            <span v-if="k==playlist.currentIndex && isPlaying" class="fa fa-stop" @click="stop()" />
          </v-list-item-icon>
          <v-list-item-content>{{f.path}}/{{f.name}}</v-list-item-content>
          <v-list-item-action>
            <span class="fa fa-minus" @click="playlistRemove(f)" />
          </v-list-item-action>
        </v-list-item>
      </v-list>

      <v-list v-if="displayExplorer">
        <v-list-item v-if="currentDir" :title="JSON.stringify(currentDir)">
          <v-list-item-icon @click="list(currentDir.parent)">
            <span class="fa fa-chevron-left" />
          </v-list-item-icon>
          <strong>{{currentDir.path}}</strong>
        </v-list-item>
        <v-list-item v-for="i in currentDir.list" :key="i.path+i.name" :title="JSON.stringify(i)">
          <v-list-item-icon>
            <span v-if="i.type=='dir'" class="fa fa-folder" @click="list(i)" />
            <span v-if="i.type=='file'" class="fa fa-music" @click="play(i)" />
          </v-list-item-icon>
          <v-list-item-content>{{i.name}}</v-list-item-content>
          <v-list-item-action>
            <span class="fa fa-plus" @click="playlistAdd(i)" />
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </div>

    <!-- </v-navigation-drawer> -->
  </v-app>
</template>

<script>
/* eslint-disable */
const axios = require("axios");

import io from "socket.io-client";
var socket = io.connect(""); //localhost:8015

const playerpath = "/";
export default {
  name: "App",
  data() {
    return {
      isPlaying: false,
      playlist: null,
      currentDir: {},
      displayExplorer: false
    };
  },
  computed: {
    filename() {
      if (
        this.playlist &&
        this.playlist.current &&
        this.playlist.current.name
      ) {
        return this.playlist.current.name;
      }
      return null;
    },
    hasPlaylist() {
      return this.playlist ? this.playlist.list.length > 0 : false;
    }
  },
  mounted() {
    axios.get(playerpath + "current-file").then(resp => {
      this.applyResponse(resp);
      if (!this.hasPlaylist) {
        this.displayExplorer = true;
      }
    });
    this.list();
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
    start() {
      axios.post(playerpath + "start").then(this.applyResponse);
    },
    stop() {
      axios.post(playerpath + "stop").then(this.applyResponse);
    },
    pause() {
      axios.post(playerpath + "pause").then(this.applyResponse);
    },
    list(i = null) {
      let path = null;
      if (i) {
        path = i.path;
        path += i.path && i.name ? "/" : "";
        path += i.name;
      }
      axios.get(playerpath + "list", { params: { path } }).then(resp => {
        this.currentDir = resp.data;
      });
    },
    applyResponse(resp) {
      this.isPlaying = resp.data.isPlaying;
      this.playlist = resp.data.playlist;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.active_playing {
  border: 1px dashed black;
}
.content {
  margin-top: 3.5em;
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
