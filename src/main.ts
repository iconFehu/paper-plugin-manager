import { createApp } from 'vue'
import App from './App.vue'
// import './samples/node-api'
import 'ant-design-vue/dist/antd.css';
import 'virtual:windi.css';

const app = createApp(App);

app.mount('#app').$nextTick(() => {
    postMessage({ payload: 'removeLoading' }, '*');
});
