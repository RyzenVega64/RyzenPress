<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import { useData, useRoute, useRouter } from "vitepress";
import { PhArrowUpRight, PhArrowRight, PhMagnifyingGlass, PhList, PhX, PhGithubLogo } from "@phosphor-icons/vue";
import { gsap } from "gsap";
import { projects, experiments } from "../../data/projects.js";

// 当前页面数据与客户端路由。
const { frontmatter, page } = useData();

const route = useRoute();

const router = useRouter();

// 导航与快捷入口。
const navigation = [
  { label: "首页", path: "/" },
  { label: "作品", path: "/work" },
  { label: "实验室", path: "/lab" },
  { label: "关于我", path: "/me/cv" },
];

const commands = [
  ...navigation,
  ...projects.map((project) => ({ label: project.title, path: `/work/${project.slug}` })),
  ...experiments.map((experiment) => ({ label: experiment.title, path: `/lab?experiment=${experiment.id}` })),
];

// 控制菜单、搜索与复制提示。
const menuOpen = ref(false);

const searchDialog = ref(null);

const searchInput = ref(null);

const query = ref("");

const selected = ref(0);

const toast = ref("");

const results = computed(() => commands.filter((item) => item.label.toLowerCase().includes(query.value.toLowerCase().trim())));

const isResume = computed(() => frontmatter.value.kind === "resume");

const headings = computed(() => (page.value.headers || []).filter((heading) => heading.level === 2));

// 动画观察器与提示计时器在页面离开时清理。
let revealObserver;

let toastTimer;

// 当前导航分组。
function isActive(path) {
  return path === "/" ? route.path === "/" : route.path.startsWith(path);
}

// 打开原生对话框，保留焦点约束和 Escape 关闭行为。
function openSearch() {
  menuOpen.value = false;
  query.value = "";
  searchDialog.value.showModal();
  nextTick(() => searchInput.value.focus());
}

// 通过命令导航，并关闭对话框。
function selectCommand(item) {
  searchDialog.value.close();
  router.go(item.path);
}

// 搜索结果支持方向键与回车。
function searchKeydown(event) {
  if (event.key === "ArrowDown") {
    event.preventDefault();
    selected.value = Math.min(selected.value + 1, results.value.length - 1);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    selected.value = Math.max(selected.value - 1, 0);
  }
  if (event.key === "Enter" && results.value[selected.value]) selectCommand(results.value[selected.value]);
}

// 注册全局快捷键。
function keyboardShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchDialog.value.open ? searchDialog.value.close() : openSearch();
  }
  if (event.key === "Escape") menuOpen.value = false;
}

// 复制联系方式，权限不可用时提供清晰提示。
async function copyWechat() {
  try {
    await navigator.clipboard.writeText("Byte529");
    toast.value = "微信号已复制：Byte529";
  } catch {
    toast.value = "微信号：Byte529，请手动复制";
  }
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.value = ""; }, 4000);
}

// 为进入视口的内容添加一次性入场动效。
async function observeReveals() {
  revealObserver?.disconnect();
  await nextTick();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      gsap.fromTo(entry.target, { y: 24, opacity: 0.4 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", clearProps: "all" });
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
}

watch(query, () => { selected.value = 0; });

onMounted(() => {
  window.addEventListener("keydown", keyboardShortcut);
  router.onAfterRouteChange = async () => {
    menuOpen.value = false;
    await observeReveals();
    window.dispatchEvent(new Event("ryzenpress:navigate"));
  };
  observeReveals();
});

onUnmounted(() => {
  window.removeEventListener("keydown", keyboardShortcut);
  router.onAfterRouteChange = undefined;
  revealObserver?.disconnect();
  clearTimeout(toastTimer);
});
</script>

<template>
  <a class="skip-link" href="#main-content">跳到正文</a>
  <header class="site-header">
    <a class="brand" href="/" aria-label="RyzenPress 首页"><img src="/images/logo.png" alt="" width="46" height="46"><span>RYZENPRESS</span></a>
    <nav class="desktop-nav" aria-label="主导航"><a v-for="item in navigation" :key="item.path" :href="item.path" :class="{ active: isActive(item.path) }" :aria-current="isActive(item.path) ? 'page' : undefined">{{ item.label }}</a></nav>
    <div class="header-tools"><button class="search-trigger" aria-label="快捷导航" @click="openSearch"><PhMagnifyingGlass :size="16"/><span>Ctrl <kbd>K</kbd></span></button><button class="icon-button mobile-menu-button" :aria-expanded="menuOpen" aria-controls="mobile-navigation" aria-label="切换导航菜单" @click="menuOpen = !menuOpen"><PhX v-if="menuOpen" :size="24"/><PhList v-else :size="24"/></button></div>
  </header>
  <nav v-if="menuOpen" id="mobile-navigation" class="mobile-nav" aria-label="移动导航"><a v-for="item in navigation" :key="item.path" :href="item.path">{{ item.label }}<PhArrowUpRight :size="22"/></a></nav>
  <main id="main-content" :class="['site-content', { 'resume-layout': isResume }]">
    <template v-if="isResume"><aside class="resume-aside"><span class="eyebrow">ABOUT THE DEVELOPER</span><p>经验，<br>在实践中生长。</p><nav aria-label="简历目录"><a v-for="heading in headings" :key="heading.slug" :href="`#${heading.slug}`">{{ heading.title }}</a></nav><a href="mailto:1753056976@qq.com" class="text-link">与我联系 <PhArrowUpRight :size="16"/></a></aside><article class="markdown-content"><Content/></article></template>
    <Content v-else/>
  </main>
  <footer class="site-footer wrap">
    <div class="footer-main reveal"><div><p class="eyebrow">HAVE AN IDEA? LET’S TALK.</p><h2>LET’S MAKE /<br>IDEAS <em>MOVE.</em></h2></div><a href="mailto:1753056976@qq.com" class="footer-email">1753056976@qq.com <PhArrowUpRight :size="22"/></a></div>
    <div class="footer-bottom"><a class="brand" href="/"><img src="/images/logo.png" alt="" width="32" height="32"><span>RYZENPRESS</span></a><span>张竞舟 · 郑州</span><div class="footer-socials"><button @click="copyWechat">微信</button><a href="https://github.com/RyzenVega64" target="_blank" rel="noreferrer" aria-label="GitHub"><PhGithubLogo :size="20"/></a><a href="/me/cv">简历 <PhArrowUpRight :size="14"/></a></div></div>
  </footer>
  <dialog ref="searchDialog" class="command-dialog" aria-labelledby="command-title" @click="(event) => { if (event.target === searchDialog) searchDialog.close(); }">
    <div class="command-top"><PhMagnifyingGlass :size="20"/><label id="command-title" class="sr-only" for="command-input">搜索页面与实验</label><input id="command-input" ref="searchInput" v-model="query" placeholder="想去哪里？搜索页面、作品或实验…" autocomplete="off" @keydown="searchKeydown"><button class="icon-button" aria-label="关闭快捷导航" @click="searchDialog.close()"><PhX :size="20"/></button></div>
    <div class="command-results"><p class="eyebrow">QUICK NAVIGATION</p><button v-for="(item, index) in results" :key="item.path" :class="{ selected: selected === index }" @click="selectCommand(item)"><span>{{ item.label }}</span><PhArrowRight :size="17"/></button><p v-if="!results.length" class="empty-state">没有找到匹配内容，换个关键词试试。</p></div><div class="command-hint">↑ ↓ 切换 · Enter 前往 · Esc 关闭</div>
  </dialog>
  <div v-if="toast" class="toast" role="status">{{ toast }}</div>
</template>
