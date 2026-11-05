<script setup>
import UiSelect from "../ui/UiSelect.vue";
import { onUnmounted, ref } from "vue";
import { PhPlay, PhStop, PhDownloadSimple } from "@phosphor-icons/vue";

// 分镜工作台输入与输出状态。
const theme = ref("一位修复师，在旧城里找到一段失落的记忆");

const style = ref("悬疑");

const shots = ref([]);

const running = ref(false);

const status = ref("本地概念演示 · 选择主题与风格，生成可编辑的分镜文本");

// 本地镜头模板与叙事节奏。
const templates = [
  { lens: "远景 / 缓慢推进", duration: "5s", text: "黎明前的城市，雾气沿街道散开。", dialogue: "有些故事，从一段沉默开始。" },
  { lens: "中景 / 跟随", duration: "6s", text: "主角停下脚步，一件不起眼的物品打破日常。", dialogue: "这一次，我想知道答案。" },
  { lens: "特写 / 焦点转移", duration: "4s", text: "镜头聚焦手中的细节，记忆与眼前的世界发生重叠。", dialogue: "原来线索一直都在。" },
  { lens: "全景 / 向上拉远", duration: "7s", text: "主角走向光线，新的旅程即将开始。", dialogue: "故事，还没有结束。" },
];

let generationTimer;

// 停止待呈现的镜头，保留已完成结果。
function stopGeneration() {
  clearInterval(generationTimer);
  running.value = false;
  status.value = "已停止，可重新生成或导出当前分镜";
}

// 按镜头逐步呈现本地模板，并将主题融入内容。
function generate() {
  if (!theme.value.trim()) { status.value = "先写下一个故事主题。"; return; }
  clearInterval(generationTimer);
  shots.value = [];
  running.value = true;
  status.value = "正在编排分镜…";
  generationTimer = setInterval(() => {
    // 当前镜头由模板序号决定。
    const index = shots.value.length;

    shots.value.push({ ...templates[index], text: `${style.value}风格。围绕「${theme.value.trim()}」：${templates[index].text}` });
    if (shots.value.length === templates.length) {
      clearInterval(generationTimer);
      running.value = false;
      status.value = "4 个镜头已就绪 · 点击文本可继续编辑";
    }
  }, 650);
}

// 导出已编辑的 Markdown 分镜，不调用外部服务。
function exportStoryboard() {
  // 组合镜头文本并创建下载地址。
  const content = `# ${theme.value}\n\n风格：${style.value}\n\n` + shots.value.map((shot, index) => `## 镜头 ${index + 1}\n\n${shot.lens} · ${shot.duration}\n\n${shot.text}\n\n对白：${shot.dialogue}`).join("\n\n");

  const url = URL.createObjectURL(new Blob([content], { type: "text/markdown;charset=utf-8" }));

  const link = document.createElement("a");

  link.href = url;
  link.download = "ryzenpress-storyboard.md";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

onUnmounted(() => clearInterval(generationTimer));
// 分镜的叙事风格。
const styleOptions = [
  { value: "悬疑", label: "悬疑" },
  { value: "科幻", label: "科幻" },
  { value: "治愈", label: "治愈" },
];

</script>

<template>
  <div class="demo-frame cinema-demo"><div class="cinema-input"><label for="story-theme" class="eyebrow">YOUR STORY STARTS HERE</label><textarea id="story-theme" v-model="theme" maxlength="180" :disabled="running" rows="2"/><div class="demo-toolbar"><div class="inline-control"><label for="story-style">叙事风格</label><UiSelect id="story-style" v-model="style" :options="styleOptions" :disabled="running" class="w-32" /></div><div class="button-group"><button v-if="running" class="button secondary small" @click="stopGeneration"><PhStop :size="16"/>停止</button><button v-else class="button primary small" @click="generate"><PhPlay :size="16"/>{{ shots.length ? '重新编排' : '生成分镜' }}</button><button class="button secondary small" :disabled="!shots.length || running" @click="exportStoryboard"><PhDownloadSimple :size="16"/>导出</button></div></div></div><div v-if="!shots.length" class="story-empty"><img src="/images/ai-cinema.png" alt="AI 短剧分镜概念视觉" loading="lazy"><span>一个主题，四个镜头。让故事开始。</span></div><div v-else class="storyboard"><article v-for="(shot, index) in shots" :key="index"><header><span class="eyebrow">SHOT 0{{ index + 1 }}</span><span>{{ shot.duration }}</span></header><p class="shot-lens">{{ shot.lens }}</p><label :for="`shot-${index}`" class="sr-only">镜头 {{ index + 1 }} 画面描述</label><textarea :id="`shot-${index}`" v-model="shot.text" rows="5"/><p class="shot-dialogue">“{{ shot.dialogue }}”</p></article></div><div class="demo-status" role="status"><span>{{ status }}</span><span>LOCAL DEMO</span></div></div>
</template>
