/* eslint-disable */

<template>
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
      v-for="i in currentDir.list"
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
      <v-list-item-content>{{ i.name }}</v-list-item-content>
      <v-list-item-action>
        <v-icon @click="$emit('playlistAdd', i)">fa fa-plus</v-icon>
      </v-list-item-action>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: 'Explorer',
  props: ['currentDir']
};
</script>
