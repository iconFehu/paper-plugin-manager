<script setup lang="ts">
  import { ref, reactive, watch } from 'vue';
  import { ipcRenderer } from 'electron';
  const state = reactive({
    pluginList: [] as any[],
  });
  ipcRenderer.on('plugin-list', (event, data: Array<string>) => {
    console.log('event', event);
    console.log('args', data);
    state.pluginList = data;
  });
  defineProps<{}>();
</script>

<template>
  <div>
    <AList :grid="{ gutter: 16, column: 4 }" :data-source="state.pluginList">
      <template #renderItem="{ item }">
        <AListItem>
          <ACard :title="item"></ACard>
        </AListItem>
      </template>
    </AList>
    <!--    <div v-for="item in state.pluginList">{{ item }}</div>-->
  </div>
</template>

<style scoped>
  a {
    color: #42b983;
  }

  label {
    margin: 0 0.5em;
    font-weight: bold;
  }

  code {
    background-color: #eee;
    padding: 2px 4px;
    border-radius: 4px;
    color: #304455;
  }
</style>
