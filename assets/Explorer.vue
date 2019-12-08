<template>
  <div>
    <v-list>
      <!-- current directory -->
      <v-list-item v-if="currentDir.parent" :title="JSON.stringify(currentDir)">
        <v-list-item-icon>
          <v-icon
            v-if="currentDir.parent"
            @click="$emit('list', currentDir.parent)"
            >fa fa-chevron-left</v-icon
          >
        </v-list-item-icon>
        <v-list-item-content>
          <strong>{{ currentDir.path }}</strong>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon @click="$emit('playlistAdd', currentDir)">fa fa-plus</v-icon>
        </v-list-item-action>
      </v-list-item>
      <!-- list of items -->
      <v-list-item
        v-for="i in reducedList"
        :key="i.path + i.name"
        :title="JSON.stringify(i)"
      >
        <v-list-item-icon>
          <v-icon @click="$emit('list', i)" v-if="i.type == 'dir'"
            >fa fa-folder</v-icon
          >
          <v-icon
            @click="$emit('play', i)"
            :disabled="isPlaying(i)"
            v-if="i.type == 'file'"
            >fa fa-music</v-icon
          >
        </v-list-item-icon>
        <v-list-item-content v-if="!isSearchMode">{{
          i.name
        }}</v-list-item-content>
        <v-list-item-content v-if="isSearchMode">
          <v-list-item-subtitle v-text="i.path"></v-list-item-subtitle>
          <v-list-item-title v-text="i.name"></v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon v-if="!isInPlaylist(i)" @click="$emit('playlistAdd', i)"
            >fa fa-plus</v-icon
          >
          <v-icon v-if="isInPlaylist(i)" @click="$emit('playlistRemove', i)"
            >fa fa-minus</v-icon
          >
        </v-list-item-action>
      </v-list-item>
      <!-- button "More" -->
      <v-list-item v-if="!isFullyLoaded" @click="onButtonMoreIsVisible()">
        <v-list-item-icon> </v-list-item-icon>
        <v-list-item-content v-intersect="onButtonMoreIsVisible">
          {{ reducedList.length }}/{{ currentList.length }}
          <span> More </span>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-app-bar fixed bottom dark>
      <v-container fill-height>
        <v-text-field
          :title="'Search for=' + term"
          prepend-icon="fa fa-search"
          placeholder="Search..."
          @change="$emit('search', requestedTerm)"
          v-model="requestedTerm"
          v-bind:loading="countLoading > 0"
        ></v-text-field>
      </v-container>
    </v-app-bar>
  </div>
</template>

<script>
const COUNT_ITEM_STEP = 20;

export default {
  name: 'Explorer',
  props: ['currentDir', 'term', 'countLoading', 'playlist'],
  data() {
    return {
      requestedTerm: this.term,
      maxCountItems: COUNT_ITEM_STEP // count item to be displayed
    };
  },
  computed: {
    currentList() {
      if (this.currentDir && this.currentDir.list) {
        return this.currentDir.list;
      }
      return [];
    },
    currentItemFullPath() {
      return this.getItemFullPath(this.playlist ? this.playlist.current : null);
    },
    isSearchMode() {
      return this.term !== '';
    },
    isFullyLoaded() {
      return this.reducedList.length === this.currentList.length;
    },
    reducedList() {
      // reduce the number of items to display, in order to  make UX more reactive (less html tag)
      return this.currentList.slice(0, this.maxCountItems);
    }
  },
  methods: {
    onButtonMoreIsVisible() {
      if (this.isFullyLoaded) {
        return;
      }
      this.maxCountItems += COUNT_ITEM_STEP;
    },
    isInPlaylist(item) {
      if (item.type === 'dir') {
        return false;
      }
      if (!this.playlist) {
        return false;
      }
      if (!this.playlist.list) {
        return false;
      }
      return this.playlist.list.find(
        i => this.getItemFullPath(i) === this.getItemFullPath(item)
      );
    },
    isPlaying(item) {
      return this.getItemFullPath(item) === this.currentItemFullPath;
    }
  },
  watch: {
    currentDir() {
      this.maxCountItems = COUNT_ITEM_STEP;
    },
    term() {
      this.requestedTerm = this.term;
    }
  }
};
</script>
