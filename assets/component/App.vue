/* eslint-disable */

<template>
  <div class>
    <span>{{filename}}</span>
    <!-- <br /> -->
    <span v-if="isPlaying">
      <!-- Playing -->
      <button @click="stop()" type="button">Stop</button>
      <!-- <button @click="pause()" type="button">Pause</button> -->
    </span>
    <span v-if="!isPlaying">
      <!-- Paused -->
      <button @click="start()" type="button">Start</button>
    </span>
    <ul v-if="currentDir">
      <li>
        <strong>/{{currentDir.directory}}</strong>
      </li>
      <li v-if="currentDir.directory" @click="displayContent()">..</li>
      <li v-for="f in currentDir.subdirs" :key="f" @click="displayContent(f)">dir:{{f}}</li>
      <li v-for="f in currentDir.files" :key="f" @click="play(f, currentDir.directory)">file:{{f}}</li>
    </ul>
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
      currentDir: {}
    };
  },
  mounted() {
    axios.get(playerpath + "current-file").then(this.applyResponse);
    this.displayContent();
  },
  methods: {
    play(filename, filepath){
      axios.post(playerpath + "play?filename="+filename+'&filepath='+filepath).then(this.applyResponse);
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
    applyResponse(resp) {
      this.filename = resp.data.filename;
      this.isPlaying = resp.data.isPlaying;
    },
    displayContent(path = "") {
      axios.get(playerpath + "list-dir?path=" + path).then(resp => {
        this.currentDir = resp.data;
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
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
}
a {
  color: #42b983;
}
</style>
