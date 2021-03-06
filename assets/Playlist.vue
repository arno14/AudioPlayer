<template>
  <div>
    <v-list v-if="hasPlaylist">
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
    <v-app-bar fixed bottom dark v-if="hasPlaylist">
      <v-progress-linear
        @click="onSeek"
        absolute
        top
        height="8"
        :value="positionPercent"
      ></v-progress-linear>
      <v-btn icon>
        <v-icon
          title="Previous"
          :disabled="hasPrevious"
          @click="playPrevious()"
        >
          fa fa-arrow-circle-left
        </v-icon>
      </v-btn>
      <v-container fill-height>
        <v-slider
          @change="$emit('volume', requestedVolume)"
          min="0"
          max="100"
          prepend-icon="fa fa-volume-up"
          v-model="requestedVolume"
        ></v-slider>
      </v-container>
      <v-btn icon>
        <v-icon title="Next" :disabled="hasNext" @click="playNext()">
          fa fa-arrow-circle-right
        </v-icon>
      </v-btn>
    </v-app-bar>
  </div>
</template>

<script>
export default {
  name: 'Playlist',
  props: ['playlist', 'isPlaying', 'volume', 'position'],
  data() {
    return {
      requestedVolume: null
    };
  },
  mounted() {
    this.requestedVolume = this.volume;
  },
  watch: {
    volume(newVol) {
      this.requestedVolume = newVol;
    }
  },
  computed: {
    hasPlaylist() {
      return this.playlist ? this.playlist.list.length > 0 : false;
    },
    hasPrevious() {
      if (!this.hasPlaylist) {
        return false;
      }
      return this.playlist.currentIndex === 0;
    },
    hasNext() {
      if (!this.hasPlaylist) {
        return false;
      }
      return this.playlist.currentIndex === this.playlist.list.length - 1;
    },
    positionPercent() {
      if (this.position) {
        return this.position.percent;
      }
      return 0;
    }
  },
  methods: {
    playPrevious() {
      const item = this.playlist.list[this.playlist.currentIndex - 1];
      this.$emit('play', item);
    },
    playNext() {
      const item = this.playlist.list[this.playlist.currentIndex + 1];
      this.$emit('play', item);
    },
    onSeek(e) {
      const targetPercent = Math.trunc((e.clientX / window.innerWidth) * 100);
      this.$emit('seek', targetPercent);
    }
  }
};
</script>
