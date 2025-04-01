import { PluginOption } from "vite";
import { visualizer } from "rollup-plugin-visualizer";
import { prismjsPlugin } from "vite-plugin-prismjs";

/**
 * 视图分析插件
 * @param viteEnv
 * @returns rollup插件
 */
export const visualizerPlugin = (): any => {
    const visualizerPluginOption = {
        filename: "stats.html",
        gzipSize: true,
        brotliSize: true
    };

    return visualizer(visualizerPluginOption);
};

/**
 * 代码高亮
 */
export const highlightPlugin = (): PluginOption | PluginOption[] => {
    // 1、line-numbers显示行数
    // 2、show-language显示语言
    // 3、copy-to-clipboard显示语言
    // 4、'inline-color'在代码中显示颜色块
    return prismjsPlugin({
        languages: "all", // 语言
        plugins: ["line-numbers", "show-language", "copy-to-clipboard", "inline-color"],
        theme: "coy", // 主题
        css: true
    });
};
