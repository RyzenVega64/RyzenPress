# RyzenPress

张竞舟的个人交互作品集。以黑色、荧光绿和金属材质建立视觉语言，围绕家谱可视化、AI 短剧创作和工业可视化展开。包含独立作品详情、三个可操作实验、快捷导航和 Markdown 简历。

## 启动

需要 Node.js 22.12.0 或更高版本，以及 pnpm 12.16.1。

```sh
npm install -g pnpm@12.16.1
pnpm install
pnpm dev
```

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务 |
| `pnpm build` | 构建静态站点 |
| `pnpm preview` | 预览已构建的站点 |

构建输出为 `docs/.vitepress/dist`。已执行构建并通过。已启动本地预览，浏览器检查等待本地地址访问授权。

## 页面与功能

| 路径 | 功能 |
| --- | --- |
| `/` | 空间隧道主视觉、指针视差、作品预览、实验入口 |
| `/work` | 分类筛选与作品索引 |
| `/work/genealogy` | 项目说明、31 / 127 / 1023 节点家谱、搜索定位、缩放平移、节点折叠 |
| `/work/ai-cinema` | 故事主题、风格选择、逐镜头呈现、停止、编辑及 Markdown 导出 |
| `/work/industrial` | 可旋转三维产线、设备拾取、模拟温度及负载、告警场景、暂停遥测 |
| `/lab?experiment=particles` | GPU 粒子场、形态、密度、速度、引力交互、暂停与重置 |
| `/lab?experiment=poster` | 种子驱动的生成艺术、标题及配色修改、PNG 导出 |
| `/lab?experiment=audio` | 本地音频频谱分析、柱状与环形可视化、原生播放控件 |
| `/me/cv` | Markdown 简历、页内目录、打印样式 |

全站支持 `Ctrl / ⌘ + K` 快捷导航、键盘操作、移动端菜单与减少动画偏好。

## 内容边界

- 家谱与工业作品依据实际开发经历延展。演示使用虚构家族与模拟遥测，不连接真实业务系统。
- AI 短剧是创作流程概念演示，使用本地模板编排分镜，不调用模型、不生成视频，也不要求 API 密钥。
- 项目封面与主视觉是 AI 生成的概念资产，不作为真实产品截图或业绩证明。
- 简历正文根据用户提供的 PDF 整理，继续以 Markdown 维护，保留原 `/me/cv` 地址。年龄、工作年限和“至今”保留源简历记录，后续人工更新。
- 本地音频通过浏览器 Web Audio 分析，不上传到服务器。部分浏览器或编码格式可能无法播放。

## 技术选择

- **VitePress 1.6.4**：提供静态 Markdown 路由与预渲染。已替换整个默认文档主题，不保留博客、技术笔记和默认搜索。
- **Vue 3.5.44**：页面组件与状态交互，使用普通 JavaScript `<script setup>`。
- **Tailwind CSS / @tailwindcss/vite 4.3.4**：工具类编译；不加载 Preflight。
- **Three.js 0.187.0**：粒子 Shader、工业设备场景与 OrbitControls，按页面分包加载。
- **GSAP 3.15.1**：视口进入动画，遵循系统减少动画偏好。
- **Phosphor Vue 2.2.1**：统一界面图标。

直接依赖采用精确版本，提交 `pnpm-lock.yaml`。Vite 由 VitePress 稳定版管理其兼容版本，当前仍为 Vite 5；没有强制覆盖上游传递依赖。项目不使用 Sass、Element UI 或完整通用组件库。

## 目录

```text
docs/
├── .vitepress/
│   ├── config.mjs              # 构建与站点元信息
│   └── theme/
│       ├── index.js            # 自定义主题入口
│       ├── Layout.vue          # 全站导航、命令面板、简历目录与页尾
│       └── style.css           # 设计变量、响应式与打印样式
├── components/
│   ├── HomePage.vue
│   ├── WorksPage.vue
│   ├── ProjectCard.vue
│   ├── ProjectPage.vue
│   ├── LabPage.vue
│   ├── demos/                  # 家谱、分镜与工业交互
│   └── lab/                    # 粒子、海报与音频实验
├── data/projects.js            # 作品与实验内容
├── public/images/              # 原创概念图与 RP 标识
├── work/                       # 作品详情路由
├── me/cv.md                    # 简历正文
├── work.md                     # 作品索引
├── lab.md                      # 实验室路由
└── index.md                    # 首页路由
```

## 维护约定

组件使用 PascalCase，普通 JS 文件使用小写命名，函数与变量使用 camelCase。声明前添加简短 `//` 注释，声明之间留空行。复用作品内容维护在 `docs/data/projects.js`，简历直接编辑 `docs/me/cv.md`。

图像保存在项目 `docs/public/images`，运行时不依赖 Codex 的生成目录。品牌图标为 `logo.png`，首页和三张作品封面分别为 `hero-tunnel.png`、`genealogy.png`、`ai-cinema.png` 和 `industrial.png`。

## 部署

静态托管平台设置安装命令 `pnpm install --frozen-lockfile`、构建命令 `pnpm build`、输出目录 `docs/.vitepress/dist`，使用满足要求的 Node.js 版本，并支持无 `.html` 后缀的访问。部署分支与自动发布规则在托管平台配置。

## 设计与验收状态

设计目标为已选视觉的合并稿：第二稿的结构与第一稿的黑绿配色，补充家谱、AI 短剧、工业元素。页面和资产已按此方向编写；构建已通过，视觉一致性与浏览器交互检查尚待本地地址访问授权，当前不宣称通过视觉验收。详见 `design-qa.md`。



## 界面规范与基础组件

全站字体顺序为 `"PingFang SC", "Noto Sans SC", sans-serif`。项目通过 `@fontsource/noto-sans-sc` 本地提供400、500、600字重，字体文件根据Unicode分段加载，不依赖外部字体CDN。

`docs/.vitepress/theme/controls.css` 使用 Tailwind CSS 4 的 `@theme` 与 `@apply` 管理控件设计变量。`style.css` 维护页面布局与文字层级。

`docs/components/ui` 中的 Select、Slider、Number 与 Tooltip 基于 Reka UI 封装，统一键盘交互、焦点和浮层样式，保留普通 JavaScript。图标继续使用 Phosphor。所有业务页面复用这些组件，数值选项保留原始类型。

控件高度40px、紧凑版本32px；移动端紧凑控件提升至40px。控件圆角6px、浮层圆角8px。正文15px、控件14px、辅助说明12px。原生音频播放器已替换为统一的播放、进度与音量控件。
