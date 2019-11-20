/* eslint-disable */

<template>
  <div class>
    <span>{{filename}}</span>
    <!-- <br /> -->
    <button @click="stop()" type="button" v-if="isPlaying">
      <span class="fa fa-stop" />
    </button>
    <button @click="start()" type="button" v-if="!isPlaying">
      <span class="fa fa-play" />
    </button>
    <button @click="playlistClear()" type="button" v-if="hasPlaylist">
      <span class="fa fa-trash" />
    </button>
    <div>
      Playlist:
      <ul v-if="playlist">
        <li
          v-for="(f,k) in playlist.list"
          :key="k"
          :class="{active:k==playlist.currentIndex}"
          :title="JSON.stringify(f)"
        >
          {{f.path}}/{{f.name}}
          <span class="fa fa-play" @click="play(f)" />
        </li>
      </ul>
    </div>
    <div>
      Explore:
      <ul v-if="currentDir">
        <li>
          <span
            class="fa fa-chevron-left"
            v-if="currentDir.parent"
            @click="list(currentDir.parent)"
            :title="JSON.stringify(currentDir.parent)"
          />
          <strong>{{currentDir.path}}</strong>
          <span class="fa fa-plus" @click="playlistAdd(currentDir)" />
        </li>
        <li v-for="i in currentDir.list" :key="i.path+i.name" :title="JSON.stringify(i)">
          <div v-if="i.type=='dir'">
            <span class="fa fa-folder" @click="list(i)" />
            {{i.name}}
            <span class="fa fa-eye" @click="list(i)" />
            <span class="fa fa-plus" @click="playlistAdd(i)" />
          </div>
          <div v-if="i.type=='file'">
            <span class="fa fa-music" />
            {{i.name}}
            <span class="fa fa-play" @click="play(i)" />
            <span class="fa fa-plus" @click="playlistAdd(i)" />
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
const axios = require("axios");

const playerpath = "/";
export default {
  name: "App",
  data() {
    return {
      isPlaying: false,
      filename: null,
      playlist: null,
      currentDir: {}
    };
  },
  computed: {
    hasPlaylist() {
      return this.playlist ? this.playlist.list.length > 0 : false;
    }
  },
  mounted() {
    axios.get(playerpath + "current-file").then(this.applyResponse);
    this.list();
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
      this.filename = resp.data.filename;
      this.isPlaying = resp.data.isPlaying;
      this.playlist = resp.data.playlist;
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
li.active {
  border: 1px dashed black;
}
/* h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
} */
a {
  color: #42b983;
}
</style>
