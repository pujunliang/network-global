import vue from "@vitejs/plugin-vue";
import { PluginOption } from "vite";
import vueJsx from "@vitejs/plugin-vue-jsx";
import createCompression from "./compression";
import { visualizerPlugin, highlightPlugin } from "./otherPlugins";
/**
 * 创建 vite 插件
 * @param viteEnv
 */
export function createVitePlugins(viteEnv: ViteEnv, isBuild: boolean = false): (PluginOption | PluginOption[])[] {
    const vitePlugins: Array<PluginOption> = [];
    vitePlugins.push(vue());
    vitePlugins.push(vueJsx());
    isBuild && vitePlugins.push(...createCompression(viteEnv));

    //visual
    vitePlugins.push(visualizerPlugin());
    // code highlight
    vitePlugins.push(highlightPlugin());
    return vitePlugins;
}
