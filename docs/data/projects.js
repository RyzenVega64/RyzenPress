// 作品既包含真实经验的提炼，也包含明确标注的创作概念。
export const projects = [
  {
    slug: "genealogy",
    number: "01",
    title: "关系的形状",
    subtitle: "让代际关系，成为可探索的风景。",
    category: "家谱可视化",
    discipline: "INTERACTIVE DATA",
    image: "/images/genealogy.png",
    description: "以家谱为切口，探索树形数据的组织、定位与交互，让复杂关系变得清晰可见。",
    origin: "真实项目经验延展",
    stack: ["Vue 3", "Canvas", "Map", "IndexedDB"],
    overview: "这项探索来自都有家谱的开发经历。真实项目涉及千人级家谱树、谱册拖拽编辑和大尺寸图片导出。这里以虚构家族数据重建交互片段，呈现关系的组织方式与浏览体验。",
    challenges: [
      { title: "查找的速度", text: "将节点 ID 与节点数据建立 Map 索引，避免每次查找都遍历整棵树。演示支持搜索定位、节点选择与子树折叠。" },
      { title: "复杂度的节奏", text: "把展开、缩放和定位作为独立交互，让用户决定信息密度。大规模绘制放在 Canvas 中，减少 DOM 数量。" },
      { title: "导出的边界", text: "实际项目按 DOM 尺寸进行分片，以 IndexedDB 暂存切片，配合后端拼接。这里保留思路说明，不模拟不存在的服务。" },
    ],
  },
  {
    slug: "ai-cinema",
    number: "02",
    title: "故事，正在生成",
    subtitle: "从一个灵感，到一段可感知的叙事。",
    category: "AI 短剧创作",
    discipline: "AI STORYTELLING",
    image: "/images/ai-cinema.png",
    description: "将故事梗概转化为分镜与镜头节奏，探索 AI 短剧创作中的信息编排与交互体验。",
    origin: "创作流程概念演示",
    stack: ["Vue 3", "流式交互", "分镜编排", "多模态体验"],
    overview: "结合 AI 产品交互经验，设计一个短剧创作的微型工作台。输入主题、选择叙事风格，体验从梗概到分镜的逐步呈现。此处使用本地规则与预设场景演示交互，不调用生成模型，也不输出真实视频。",
    challenges: [
      { title: "把等待变成反馈", text: "分镜按顺序逐步呈现，提供停止与重新生成，让创作过程保持可理解、可控制。" },
      { title: "保持叙事连贯", text: "用镜头、画面、对白和时长组织分镜。主题影响故事文本，风格影响镜头语言，减少结果阅读负担。" },
      { title: "让结果可带走", text: "可将完成的分镜导出为 Markdown，便于继续编辑。界面保留模型接入扩展点，当前运行无需密钥。" },
    ],
  },
  {
    slug: "industrial",
    number: "03",
    title: "看见工业的脉搏",
    subtitle: "连接空间、设备与运行中的数据。",
    category: "工业可视化",
    discipline: "DIGITAL TWINS",
    image: "/images/industrial.png",
    description: "把设备状态与空间关系连接起来，以可探索的数字场景理解产线的运行与变化。",
    origin: "可视化经验延展 / 模拟遥测",
    stack: ["Vue 3", "Three.js", "设备交互", "实时可视化"],
    overview: "从物联网管理与三维展厅开发经验出发，探索设备状态如何落到具体空间。演示包含可旋转的三维设备布局、设备选择、运行趋势和告警场景切换。所有遥测均为模拟数据。",
    challenges: [
      { title: "空间中的信息", text: "通过三维布局表达设备之间的关系，点击设备即可查看对应指标，避免空间展示与数据面板脱节。" },
      { title: "变化中的状态", text: "支持正常、关注与告警状态切换，趋势数据随模拟场景更新；暂停后画面与数据同步停止。" },
      { title: "资源的生命周期", text: "场景按需加载，在离开页面时释放几何体、材质、控制器和渲染器，并停止动画与定时任务。" },
    ],
  },
];

// 实验地址可独立分享，查询参数决定打开的实验。
export const experiments = [
  { id: "particles", number: "01", title: "粒子引力场", label: "PARTICLE FIELD", description: "在球体、星环与波浪之间，感受数学与交互的形状。" },
  { id: "poster", number: "02", title: "生成式海报", label: "GENERATIVE ART", description: "用文字、种子与规则生成一张可以带走的数字海报。" },
  { id: "audio", number: "03", title: "声音可视化", label: "SOUND IN MOTION", description: "让一段声音，在频率与节奏中获得可见的形态。" },
];
