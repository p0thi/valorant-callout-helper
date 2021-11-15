import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

import "iron-grid-system/dist/style.css";

import "@/styles/dark-theme/dark.css"
const app = createApp(App);

app.use(ElementPlus);

app.use(store).use(router).mount("#app");
