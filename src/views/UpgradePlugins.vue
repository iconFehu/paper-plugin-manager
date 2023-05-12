<script setup lang="ts">
  import { ref, reactive, onMounted, toRaw } from 'vue';
  import { ipcRenderer } from 'electron';
  const state = reactive({
    pluginList: [
      'chunky.81534',
      'minimotd-server-list-motd-plugin-with-rgb-gradients.81254',
      'skinsrestorer.2124',
      'vault.34315',
      'coreprotect.8631',
      'treeassist.67436',
      'auctionhouse.61836',
      'placeholderapi.6245',
      'cmilib.87610',
      'noteblockmusicplayer.37295',
      'plugmanx.88135',
      'noteblockapi.19287 noteblockapi',
      'worldeditsui-visualize-your-selection.60726',
    ],
    pluginListText: '',
    path: 'D:\\PaperMC\\plugins',
    progressList: [] as any,
  });
  onMounted(() => {
    state.pluginListText = state.pluginList.join('\n');
  });
  defineProps<{}>();
  const handleChange = (value: string) => {
    console.log(value);
    state.pluginList = state.pluginListText.split('\n');
  };
  const downloadPlugin = () => {
    console.log(state.path);
    ipcRenderer.send('download-plugin', toRaw(state));
  };

  ipcRenderer.on('progress-status', (event, data: Array<string>) => {
    console.log('event', event);
    console.log('args', data);
    state.progressList = data;
  });
</script>

<template>
  <div>
    <ASpace direction="vertical">
      <AButton @click="downloadPlugin">更新插件</AButton>
      <AInput v-model:value="state.path" placeholder="输入保存插件的文件夹路径" />
      <ATextarea
        v-model:value="state.pluginListText"
        @change="handleChange"
        placeholder="输入更新的插件信息"
        :rows="10"
      />
    </ASpace>
    <ASpace direction="vertical">
      <div v-for="(progress, pluginName) in state.progressList">
        {{ pluginName }}
        <AProgress :percent="progress" />
      </div>
    </ASpace>
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
