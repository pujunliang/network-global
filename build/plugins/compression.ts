/*
 * @Author: junliang.pu
 * @Date: 2023-09-13 16:06:28
 * @LastEditors: junliang.pu
 * @LastEditTime: 2023-09-15 16:52:41
 * @Description: vite压缩方案配置
 * @FilePath: \ux-admin-vue3\vite\plugins\compression.ts
 */
import compression from "vite-plugin-compression";
export default function createCompression(env) {
    const { VITE_BUILD_COMPRESS } = env;
    const plugin: Array<any> = [];
    if (VITE_BUILD_COMPRESS) {
        const compressList = VITE_BUILD_COMPRESS.split(",");
        if (compressList.includes("gzip")) {
            plugin.push(
                compression({
                    ext: ".gz",
                    deleteOriginFile: false
                })
            );
        }
        if (compressList.includes("brotli")) {
            plugin.push(
                compression({
                    ext: ".br",
                    algorithm: "brotliCompress",
                    deleteOriginFile: false
                })
            );
        }
    }
    return plugin;
}
