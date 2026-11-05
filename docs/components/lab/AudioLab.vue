<script setup>
import UiSelect from "../ui/UiSelect.vue";
import UiSlider from "../ui/UiSlider.vue";
import { onBeforeUnmount, onMounted, ref } from "vue";
import { PhUploadSimple, PhWaveform, PhPlay, PhPause, PhSpeakerHigh } from "@phosphor-icons/vue";

// 本地音频与可视化画布。
const audio = ref(null);

const canvas = ref(null);

const input = ref(null);

const filename = ref("");

const status = ref("选择一段本地音频，音频只在你的浏览器中播放。");

const mode = ref("bars");

// Web Audio 与绘图资源。
let audioContext;

let analyser;

let source;

let data;

let frame;

let objectUrl;

// 选择文件后释放前一个媒体地址。
function chooseFile(event) {
  // 浏览器返回的第一个文件。
  const file = event.target.files[0];

  if (!file) return;
  audio.value.pause();
  currentTime.value = 0;
  duration.value = 0;
  audio.value.volume = volume.value;
  if (objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl = URL.createObjectURL(file);
  audio.value.src = objectUrl;
  audio.value.load();
  filename.value = file.name;
  status.value = "已加载，点击播放器的播放按钮开始。";
}

// 用户主动播放时初始化音频分析器。
async function startAudio() {
  playing.value = true;
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source = audioContext.createMediaElementSource(audio.value);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      data = new Uint8Array(analyser.frequencyBinCount);
    }
    await audioContext.resume();
    cancelAnimationFrame(frame);
    status.value = "正在播放 · 画面由当前音频频谱驱动";
    draw();
  } catch {
    status.value = "当前浏览器无法启动音频分析，仍可使用播放器播放。";
  }
}

// 真实频谱映射为柱状或环形画面。
function draw() {
  cancelAnimationFrame(frame);
  // 固定画布坐标不依赖设备像素比。
  const context = canvas.value.getContext("2d");

  context.fillStyle = "#080a09";
  context.fillRect(0, 0, 1000, 600);
  analyser?.getByteFrequencyData(data);
  context.strokeStyle = "#c8ff5b";
  context.fillStyle = "#c8ff5b";
  for (let index = 0; index < 96; index++) {
    // 未播放时显示安静的基线。
    const magnitude = data ? data[index] / 255 : 0;

    if (mode.value === "bars") {
      context.globalAlpha = 0.35 + magnitude * 0.65;
      context.fillRect(70 + index * 9, 440 - magnitude * 320, 4, Math.max(magnitude * 320, 2));
    } else {
      // 频率沿圆周排列，振幅控制辐射长度。
      const angle = index / 96 * Math.PI * 2;

      context.globalAlpha = 0.5 + magnitude * 0.5;
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(500 + Math.cos(angle) * 110, 300 + Math.sin(angle) * 110);
      context.lineTo(500 + Math.cos(angle) * (115 + magnitude * 150), 300 + Math.sin(angle) * (115 + magnitude * 150));
      context.stroke();
    }
  }
  context.globalAlpha = 1;
  if (audio.value && !audio.value.paused && !document.hidden) frame = requestAnimationFrame(draw);
}

// 暂停或结束时停止帧循环。
function pauseAudio() {
  playing.value = false;
  cancelAnimationFrame(frame);
  status.value = "播放已暂停，可继续播放或更换音频。";
}

// 隐藏标签页停止绘图，返回时按实际播放状态恢复。
function visibilityChange() {
  cancelAnimationFrame(frame);
  if (!document.hidden) draw();
}

onMounted(() => { draw(); document.addEventListener("visibilitychange", visibilityChange); });

onBeforeUnmount(() => {
  cancelAnimationFrame(frame);
  document.removeEventListener("visibilitychange", visibilityChange);
  audio.value?.pause();
  source?.disconnect();
  analyser?.disconnect();
  audioContext?.close();
  if (objectUrl) URL.revokeObjectURL(objectUrl);
});
// 声音画面与播放器状态。
const modeOptions = [
  { value: "bars", label: "频谱柱" },
  { value: "circle", label: "声波环" },
];

// 媒体实际播放状态。
const playing = ref(false);

// 当前播放位置，单位为秒。
const currentTime = ref(0);

// 已加载音频的总时长。
const duration = ref(0);

// 播放器音量，范围为0至1。
const volume = ref(0.8);

// 以分秒显示播放进度。
function formatTime(value) {
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

// 播放失败时保留明确反馈。
async function togglePlayback() {
  if (playing.value) { audio.value.pause(); return; }
  try { await audio.value.play(); }
  catch { status.value = "播放失败，请尝试其他音频文件。"; }
}

// 从媒体元素同步真实时长与当前位置。
function updateDuration() {
  duration.value = Number.isFinite(audio.value.duration) ? audio.value.duration : 0;
}

// 播放时同步进度条位置。
function updateTime() {
  currentTime.value = audio.value.currentTime;
}

// 拖动进度时更新媒体播放位置。
function seekAudio(value) {
  audio.value.currentTime = value;
  currentTime.value = value;
}

// 调整真实媒体音量。
function setVolume(value) {
  audio.value.volume = value;
}

</script>

<template>
  <div class="lab-workspace">
    <div class="audio-stage">
      <canvas ref="canvas" width="1000" height="600" aria-label="本地音频的实时频谱可视化" />
      <div v-if="!filename" class="audio-empty"><PhWaveform :size="46" weight="thin" /><p>让一段声音，拥有形状。</p><button class="button primary" @click="input.click()">选择本地音频 <PhUploadSimple :size="18" /></button></div>
      <div class="audio-player">
        <button class="audio-play-button" :disabled="!filename" :aria-label="playing ? '暂停音频' : '播放音频'" @click="togglePlayback"><PhPause v-if="playing" :size="18" weight="fill" /><PhPlay v-else :size="18" weight="fill" /></button>
        <div class="audio-player-timeline"><UiSlider :model-value="currentTime" label="播放进度（秒）" :max="duration || 1" :step="0.1" :disabled="!duration" @update:model-value="seekAudio" /><div class="audio-player-time"><span>{{ formatTime(currentTime) }}</span><span>{{ formatTime(duration) }}</span></div></div>
        <div class="audio-player-volume"><PhSpeakerHigh :size="18" class="shrink-0" /><UiSlider v-model="volume" label="音量" :max="1" :step="0.05" @update:model-value="setVolume" /></div>
      </div>
      <audio ref="audio" hidden preload="metadata" @play="startAudio" @pause="pauseAudio" @ended="pauseAudio" @loadedmetadata="updateDuration" @timeupdate="updateTime" @error="status = '此音频格式无法播放，请尝试 MP3、WAV 或 OGG。'" />
    </div>
    <aside class="lab-controls">
      <p class="eyebrow">LISTEN WITH YOUR EYES</p><h2>声音有形。</h2>
      <input ref="input" type="file" accept="audio/*" class="sr-only" aria-label="选择本地音频" @change="chooseFile">
      <div class="field-stack"><label for="audio-mode">显示形态</label><UiSelect id="audio-mode" v-model="mode" :options="modeOptions" @update:model-value="draw" /></div>
      <button class="button secondary" @click="input.click()"><PhUploadSimple :size="18" />{{ filename ? '更换音频' : '选择音频' }}</button>
      <p v-if="filename" class="audio-filename">{{ filename }}</p><p class="control-note" role="status">{{ status }}</p>
    </aside>
  </div>
</template>
