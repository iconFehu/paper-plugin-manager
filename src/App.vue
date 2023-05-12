<script setup lang="ts">
  import LocalPlugins from './views/LocalPlugins.vue';
  import { reactive, ref } from 'vue';
  import { PieChartOutlined } from '@ant-design/icons-vue';
  import { Layout, LayoutSider, LayoutContent, Menu, MenuItem } from 'ant-design-vue/es';
  import UpgradePlugins from './views/UpgradePlugins.vue';

  const handleClick = () => {};
  const state = reactive({
    openKeys: [],
    selectedKeys: ['1'],
  });
</script>

<template>
  <Layout>
    <LayoutSider class="bg-white">
      <Menu
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        @click="handleClick"
      >
        <Menu-item key="1">
          <template #icon>
            <PieChartOutlined />
          </template>
          <span>本地插件</span>
        </Menu-item>
        <Menu-item key="2">
          <template #icon>
            <PieChartOutlined />
          </template>
          <span>更新插件</span>
        </Menu-item>
      </Menu>
    </LayoutSider>
    <Layout>
      <LayoutContent class="h-screen overflow-auto p-4">
        <LocalPlugins v-show="state.selectedKeys[0] === '1'" />
        <UpgradePlugins v-show="state.selectedKeys[0] === '2'" />
      </LayoutContent>
    </Layout>
  </Layout>
</template>
