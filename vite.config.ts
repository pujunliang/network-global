import { defineConfig, loadEnv } from "vite";
import { resolve } from "path";
import { wrapperEnv } from "./build/getEnv";
import getAppInfo from "./build/app-info";
import { createProxy } from "./build/proxy";
import { createVitePlugins } from "./build/plugins/index";
import pkg from "./package.json";
import type { UserConfig, ConfigEnv } from "vite";

const __APP_INFO__ = getAppInfo(pkg);
// https://vite.dev/config/
export default defineConfig(({ mode, command }: ConfigEnv): UserConfig => {
    const root = process.cwd();
    const env = loadEnv(mode, process.cwd());
    const viteEnv = wrapperEnv(env);
    return {
        base: viteEnv.VITE_PUBLIC_PATH,
        root,
        define: {
            __APP_INFO__
        },
        plugins: createVitePlugins(viteEnv, command === "build"),
        resolve: {
            alias: {
                "~": resolve(__dirname, "./"), // 配置路径
                "@": resolve(__dirname, "src") // 配置别名；将 @ 指向'src'目录
            },
            extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue", ".png"]
        },
        server: {
            host: "0.0.0.0",
            port: viteEnv.VITE_PORT,
            open: viteEnv.VITE_OPEN,
            cors: true,
            // Load proxy configuration from .env.development
            proxy: createProxy(viteEnv.VITE_PROXY)
        },
        // css: {
        //     preprocessorOptions: {
        //         scss: {
        //             additionalData: `@use "@/styles/element/var.scss" as *;`
        //         }
        //     }
        // },
        esbuild: {
            pure: viteEnv.VITE_DROP_CONSOLE ? ["console.log", "debugger"] : []
        },

        build: {
            outDir: "dist",
            minify: "esbuild",
            sourcemap: false,
            // 禁用 gzip 压缩大小报告，可略微减少打包时间
            reportCompressedSize: false,
            // 规定触发警告的 chunk 大小
            chunkSizeWarningLimit: 2000,
            assetsInlineLimit: 0,
            cssCodeSplit: true, // 将css文件输出到单独的文件中
            rollupOptions: {
                output: {
                    // Static resource classification and packaging
                    chunkFileNames: "assets/js/[name]-[hash].js",
                    entryFileNames: "assets/js/[name]-[hash].js",
                    assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
                }
            }
        }
    };
});
