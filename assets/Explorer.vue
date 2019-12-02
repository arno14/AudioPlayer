/* eslint-disable */

<template>
  <div>
    <v-list>
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
      </v-list-item>
      <v-list-item
        v-for="i in reducedList"
        :key="i.path + i.name"
        :title="JSON.stringify(i)"
      >
        <v-list-item-icon>
          <v-icon @click="$emit('list', i)" v-if="i.type == 'dir'"
            >fa fa-folder</v-icon
          >
          <v-icon @click="$emit('play', i)" v-if="i.type == 'file'"
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
          <v-icon @click="$emit('playlistAdd', i)">fa fa-plus</v-icon>
        </v-list-item-action>
      </v-list-item>
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
const COUNT_ITEM_STEP = 10;

export default {
  name: 'Explorer',
  props: ['currentDir', 'term', 'countLoading'],
  data() {
    return {
      requestedTerm: this.term,
      maxCountItems: COUNT_ITEM_STEP //nbre d'item à afficher
    };
  },
  computed: {
    currentList() {
      if (!this.currentDir) {
        return [];
      }
      if (!this.currentDir.list) {
        return [];
      }
      return this.currentDir.list;
    },
    isSearchMode() {
      return this.term !== '';
    },
    isFullyLoaded() {
      return this.reducedList.length === this.currentList.length;
    },
    reducedList() {
      return this.currentList.reduce((accumulator, value, index) => {
        if (index < this.maxCountItems) {
          accumulator.push(value);
        }
        return accumulator;
      }, []);
    }
  },
  methods: {
    onButtonMoreIsVisible() {
      if (this.isFullyLoaded) {
        return;
      }
      this.maxCountItems += COUNT_ITEM_STEP;
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
