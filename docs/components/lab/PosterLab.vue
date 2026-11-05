<script setup>
import UiSelect from "../ui/UiSelect.vue";
import UiNumber from "../ui/UiNumber.vue";
import { onMounted, ref, watch } from "vue";
import { PhDownloadSimple, PhShuffle } from "@phosphor-icons/vue";

// 海报的文本、随机种子与配色。
const canvas = ref(null);

const title = ref("IDEAS MOVE.");

const seed = ref(2026);

const palette = ref("green");

const status = ref("同一个种子，生成同一张海报。");

// 基于种子的伪随机数，让画面可复现。
function randomGenerator(value) {
  // 随机状态仅存在于本次绘制。
  let state = value >>> 0;

  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

// 以参数驱动真实 Canvas 生成艺术。
function drawPoster() {
  if (!canvas.value) return;
  // 绘制上下文与可复现的随机序列。
  const context = canvas.value.getContext("2d");

  const random = randomGenerator(seed.value);

  const accent = palette.value === "green" ? "#c8ff5b" : "#f0eee4";

  context.fillStyle = "#080a09";
  context.fillRect(0, 0, 800, 1100);
  context.save();
  context.translate(400, 530);
  for (let index = 0; index < 95; index++) {
    // 每条曲线有独立角度与半径。
    const radius = 40 + index * 3;

    context.strokeStyle = accent;
    context.globalAlpha = 0.15 + random() * 0.65;
    context.lineWidth = 0.6 + random() * 1.8;
    context.beginPath();
    context.ellipse(Math.sin(index * 0.1 + seed.value) * 50, Math.cos(index * 0.08) * 40, radius, radius * (0.3 + random() * 0.25), index * 0.025, 0, Math.PI * 2);
    context.stroke();
  }
  context.restore();
  context.fillStyle = "#f5f3e9";
  context.font = '500 16px "PingFang SC", "Noto Sans SC", sans-serif';
  context.fillText("RYZENPRESS / GENERATIVE SERIES", 50, 60);
  context.fillStyle = accent;
  context.font = '600 58px "PingFang SC", "Noto Sans SC", sans-serif';
  context.fillText(title.value || "UNTITLED", 50, 925, 700);
  context.strokeStyle = "#41483a";
  context.beginPath();
  context.moveTo(50, 980);
  context.lineTo(750, 980);
  context.stroke();
  context.fillStyle = "#afb5a5";
  context.font = '14px "PingFang SC", "Noto Sans SC", sans-serif';
  context.fillText(`SEED ${seed.value} / CODE AS A MEDIUM`, 50, 1025);
}

// 改变种子以探索新的画面。
function shuffle() {
  seed.value = Math.floor(Math.random() * 99999);
}

// 导出画布原始分辨率 PNG。
function downloadPoster() {
  canvas.value.toBlob((blob) => {
    if (!blob) { status.value = "导出失败，请重新尝试。"; return; }
    // 下载地址在触发保存后释放。
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `ryzenpress-${seed.value}.png`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    status.value = "海报已导出为 800 × 1100 PNG。";
  }, "image/png");
}

watch([title, seed, palette], drawPoster);

onMounted(async () => { await document.fonts.ready; drawPoster(); });
// 海报配色与主题一致。
const paletteOptions = [
  { value: "green", label: "荧光绿 / 黑" },
  { value: "silver", label: "象牙白 / 黑" },
];

</script>

<template>
  <div class="lab-workspace">
    <div class="poster-stage"><canvas ref="canvas" width="800" height="1100" aria-label="由当前文字、随机种子和配色生成的海报" /></div>
    <aside class="lab-controls">
      <p class="eyebrow">MAKE IT YOURS</p>
      <h2>你的海报。</h2>
      <div class="field-stack"><label for="poster-title">标题</label><input id="poster-title" v-model="title" maxlength="24" autocomplete="off"><p class="field-note">最多 24 个字符</p></div>
      <div class="field-stack"><label for="poster-seed">随机种子</label><UiNumber id="poster-seed" v-model="seed" label="随机种子" /></div>
      <div class="field-stack"><label for="poster-palette">配色</label><UiSelect id="poster-palette" v-model="palette" :options="paletteOptions" /></div>
      <div class="grid gap-3"><button class="button secondary" @click="shuffle"><PhShuffle :size="18" />换一种可能</button><button class="button primary" @click="downloadPoster"><PhDownloadSimple :size="18" />保存海报</button></div>
      <p class="control-note" role="status">{{ status }}</p>
    </aside>
  </div>
</template>
