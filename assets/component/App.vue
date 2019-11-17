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
    <div v-if="currentDir">
        <strong>{{currentDir.directory}}</strong>
        <ul>
          <li v-for="f in currentDir.files" :key="f">{{f}}</li>
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
      currentDir:{}
    };
  },
  mounted() {
    axios.get(playerpath + "current-file").then(this.applyResponse);
    axios.get(playerpath + "files").then((resp)=>{
      this.currentDir = resp.data;
    });
  },
  methods: {
    start() {
      axios.post(playerpath + "start").then(this.applyResponse);
    },
    stop() {
      axios.post(playerpath + "stop").then(this.applyResponse);
    },
    pause() {
      axios.post(playerpath + "pause").then(this.applyResponse);
    },
    applyResponse(resp){
      this.filename=resp.data.filename;
      this.isPlaying=resp.data.isPlaying;
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
