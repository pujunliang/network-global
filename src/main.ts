
import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import pinia from "@/stores";

import elementPlus from "element-plus";
import errorHandler from "@/utils/errorHandler";
import * as Icons from "@element-plus/icons-vue"; // element icons
import "remixicon/fonts/remixicon.css";
import "@/styles/index.scss";

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(elementPlus);
// app.config.errorHandler = errorHandler;
// register the element Icons component
Object.keys(Icons).forEach(key => {
    app.component(key, Icons[key as keyof typeof Icons]);
});
app.mount("#app");
