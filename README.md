# RyzenPress

一个基于 VitePress 构建的现代化个人博客网站。

## 项目简介

RyzenPress 是一个使用 VitePress 静态网站生成器搭建的个人博客项目，专注于提供简洁优雅的阅读体验。本项目支持 Markdown 写作，并集成了自动部署流程。

## 特性

- 📝 支持 Markdown 写作
- 🚀 快速的页面加载速度
- 🎨 简洁优雅的主题设计
- 🔍 内置搜索功能
- 📱 响应式布局设计

## 技术栈

- VitePress - 基于 Vue 的静态网站生成器
- Vue.js - 渐进式 JavaScript 框架
- Markdown - 文档编写
- GitHub - 代码托管与版本控制
- Vercel - 自动化部署平台

## 快速开始

bash

安装依赖

```cmd
pnpm install
```

启动开发服务器

```cmd
pnpm run dev
```

构建静态文件

```cmd
pnpm run build
```

## 部署

本项目通过 Vercel 实现自动部署，当 master 分支代码更新时会自动触发部署流程。

## 目录结构

├── docs # 文档目录
│ ├── .vitepress # VitePress 配置
│ │ ├── config.ts # 站点配置文件
│ │ └── theme # 主题相关文件
│ ├── public # 静态资源
│ └── index.md # 首页
├── package.json # 项目配置文件
└── README.md # 项目说明文档
