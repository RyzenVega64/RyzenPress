import { defineConfig } from "vitepress";
import tailwindcss from "@tailwindcss/vite";

// 自定义作品集主题与静态 Markdown 路由。
export default defineConfig({
  lang: "zh-CN",
  title: "RyzenPress",
  titleTemplate: ":title · 张竞舟",
  description: "张竞舟的交互作品集。家谱关系、AI 短剧、工业可视化与创意编程。",
  cleanUrls: true,
  appearance: false,
  scrollOffset: 100,
  head: [
    ["link", { rel: "icon", type: "image/png", href: "/images/logo.png" }],
    ["meta", { name: "theme-color", content: "#080a09" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:site_name", content: "RyzenPress" }],
    ["meta", { name: "color-scheme", content: "dark" }],
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
