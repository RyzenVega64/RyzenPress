<script setup>
import UiSlider from "./ui/UiSlider.vue";
import { computed, defineAsyncComponent, nextTick, onMounted, onUnmounted, ref } from "vue";
import { PhPause, PhPlay, PhArrowCounterClockwise, PhLink } from "@phosphor-icons/vue";
import { experiments } from "../data/projects.js";

// 实验通过独立分包按需加载。
const ParticleScene = defineAsyncComponent(() => import("./lab/ParticleScene.vue"));

const PosterLab = defineAsyncComponent(() => import("./lab/PosterLab.vue"));

const AudioLab = defineAsyncComponent(() => import("./lab/AudioLab.vue"));

// 当前实验与粒子参数。
const active = ref("particles");

const shape = ref("sphere");

const count = ref(5000);

const speed = ref(1);

const paused = ref(false);

const fps = ref(null);

const sceneKey = ref(0);

const message = ref("");

const experiment = computed(() => experiments.find((item) => item.id === active.value));

const shapes = [{ id: "sphere", label: "球体" }, { id: "ring", label: "星环" }, { id: "wave", label: "波浪" }];

// 从地址中恢复实验，支持直接分享与前进后退。
function readLocation() {
  // 缺省或未知参数返回粒子实验。
  const id = new URLSearchParams(window.location.search).get("experiment");

  active.value = experiments.some((item) => item.id === id) ? id : "particles";
}

// 更新实验与地址，不制造额外页面请求。
function selectExperiment(id) {
  active.value = id;
  history.replaceState(history.state, "", `/lab?experiment=${id}`);
  message.value = "";
}

// 标签支持左右方向键与首尾跳转。
function tabKeydown(event, index) {
  if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
  event.preventDefault();
  // 从当前标签推算下一个位置。
  const next = event.key === "Home" ? 0 : event.key === "End" ? experiments.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + experiments.length) % experiments.length;

  selectExperiment(experiments[next].id);
  nextTick(() => document.getElementById(`tab-${experiments[next].id}`).focus());
}

// 复制当前实验的完整地址。
async function shareExperiment() {
  try { await navigator.clipboard.writeText(`${location.origin}/lab?experiment=${active.value}`); message.value = "实验链接已复制。"; }
  catch { message.value = `分享地址：${location.origin}/lab?experiment=${active.value}`; }
}

// 恢复默认参数并重新创建粒子位置。
function resetParticles() {
  shape.value = "sphere";
  count.value = window.innerWidth < 768 ? 2500 : 5000;
  speed.value = 1;
  paused.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  fps.value = null;
  sceneKey.value++;
}

onMounted(() => {
  readLocation();
  resetParticles();
  window.addEventListener("popstate", readLocation);
  window.addEventListener("ryzenpress:navigate", readLocation);
});

onUnmounted(() => {
  window.removeEventListener("popstate", readLocation);
  window.removeEventListener("ryzenpress:navigate", readLocation);
});
</script>

<template><div class="wrap inner-page lab-page"><header class="page-heading"><p class="eyebrow">PLAYGROUND / {{ experiment.number }}</p><h1>{{ experiment.title }}</h1><p>{{ experiment.description }}</p></header><div class="lab-tabs" role="tablist" aria-label="选择实验"><button v-for="(item, index) in experiments" :id="`tab-${item.id}`" :key="item.id" role="tab" :tabindex="active === item.id ? 0 : -1" @keydown="tabKeydown($event, index)" :aria-selected="active === item.id" aria-controls="experiment-panel" :class="{ active: active === item.id }" @click="selectExperiment(item.id)">{{ item.title }}</button><button class="share-button" aria-label="复制实验链接" @click="shareExperiment"><PhLink :size="20"/></button></div><div id="experiment-panel" role="tabpanel" :aria-labelledby="`tab-${active}`"><ClientOnly><div v-if="active === 'particles'" class="lab-workspace"><div class="particle-stage"><span class="stage-label">LIVE EXPERIMENT</span><ParticleScene :key="sceneKey" :count="count" :speed="speed" :shape="shape" :paused="paused" @stats="fps = $event" @error="message = $event"/><div class="stage-bottom"><span>移动指针探索形态 · 可暂停动画</span><span>{{ paused ? 'PAUSED' : fps ? `${fps} FPS` : 'LIVE' }}</span></div></div><aside class="lab-controls"><p class="eyebrow">CONTROL ROOM</p><h2>控制台</h2><div><p class="control-label">形态</p><div class="segmented"><button v-for="item in shapes" :key="item.id" :class="{ active: shape === item.id }" :aria-pressed="shape === item.id" @click="shape = item.id">{{ item.label }}</button></div></div><div class="field-stack"><div class="flex items-center justify-between"><span id="density-label" class="field-label">粒子密度</span><output class="parameter-value">{{ count.toLocaleString() }}</output></div><UiSlider v-model="count" label="粒子密度" :min="1000" :max="15000" :step="500" /></div><div class="field-stack"><div class="flex items-center justify-between"><span class="field-label">运动速度</span><output class="parameter-value">{{ speed.toFixed(1) }}×</output></div><UiSlider v-model="speed" label="运动速度" :min="0.2" :max="2" :step="0.1" /></div><div class="button-group"><button class="button secondary small" @click="paused = !paused"><PhPlay v-if="paused" :size="18"/><PhPause v-else :size="18"/>{{ paused ? '继续' : '暂停' }}</button><button class="text-link" @click="resetParticles"><PhArrowCounterClockwise :size="18"/>重置</button></div><p class="control-note">帧率来自当前设备实际渲染。降低粒子密度，可减少图形负载。</p></aside></div><PosterLab v-else-if="active === 'poster'"/><AudioLab v-else/><template #fallback><div class="demo-loading">正在准备实验…</div></template></ClientOnly></div><p class="content-note" role="status">{{ message || '每一个实验，都从一次好奇开始。' }}</p></div></template>
