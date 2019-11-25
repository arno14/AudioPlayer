<template>
  <v-list v-if="hasPlaylist">
    <v-list-item :title="'vol=' + volume">
      <v-slider
        @change="$emit('volumeChange', requestedVolume)"
        min="0"
        max="100"
        prepend-icon="fa fa-volume-up"
        v-model="requestedVolume"
      ></v-slider>
    </v-list-item>
    <v-list-item
      v-for="(f, k) in playlist.list"
      :key="k"
      :class="{ active_playing: k == playlist.currentIndex }"
      :title="JSON.stringify(f)"
    >
      <v-list-item-icon>
        <v-icon
          v-if="k != playlist.currentIndex || !isPlaying"
          @click="$emit('play', f)"
          >fa fa-play</v-icon
        >
        <v-icon
          v-if="k == playlist.currentIndex && isPlaying"
          @click="$emit('stop')"
          >fa fa-stop</v-icon
        >
      </v-list-item-icon>
      <v-list-item-content>
        <v-list-item-subtitle v-text="f.path"></v-list-item-subtitle>
        <v-list-item-title v-text="f.name"></v-list-item-title>
      </v-list-item-content>
      <v-list-item-action>
        <v-icon @click="$emit('playlistRemove', f)">fa fa-minus</v-icon>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'Playlist',
  props: ['playlist', 'isPlaying', 'volume'],
  data() {
    return {
      requestedVolume: null
    };
  },
  watch: {
    volume(newVol) {
      this.requestedVolume = newVol;
    }
  },
  computed: {
    hasPlaylist() {
      return this.playlist ? this.playlist.list.length > 0 : false;
    }
  }
};
</script>
