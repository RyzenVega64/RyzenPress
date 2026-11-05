<script setup>
import UiTooltip from "../ui/UiTooltip.vue";
import UiSelect from "../ui/UiSelect.vue";
import { computed, onMounted, onUnmounted, ref } from "vue";
import { PhMagnifyingGlass, PhPlus, PhMinus, PhArrowCounterClockwise } from "@phosphor-icons/vue";

// 画布与检索状态。
const canvas = ref(null);

const query = ref("");

const generation = ref(7);

const selectedNode = ref(null);

const message = ref("虚构家族数据 · 拖动平移，滚轮缩放，点击节点折叠或展开");

const nodeCount = computed(() => 2 ** generation.value - 1);

// 节点索引、画布上下文与视图坐标。
let nodes = [];

let context;

let observer;

let view = { x: 0, y: 0, zoom: 1, width: 1, height: 480 };

let drag;

let collapsed = new Set();

// 根据代数建立虚构家族节点索引。
function buildTree() {
  nodes = Array.from({ length: nodeCount.value }, (_, index) => {
    // 二叉树的层级与层内位置。
    const depth = Math.floor(Math.log2(index + 1));

    const offset = index - (2 ** depth - 1);

    return { id: index, label: `成员${String(index + 1).padStart(3, "0")}`, depth, x: ((offset + 0.5) / 2 ** depth) * Math.max(view.width, 2 ** (generation.value - 1) * 44), y: depth * 85 + 40 };
  });
  collapsed = new Set();
  selectedNode.value = null;
  resetView();
}

// 判断祖先是否被折叠。
function isVisible(node) {
  // 沿索引向上查找父节点。
  let parent = node.id;

  while (parent > 0) {
    parent = Math.floor((parent - 1) / 2);
    if (collapsed.has(parent)) return false;
  }
  return true;
}

// 绘制当前可见的连接与节点。
function draw() {
  if (!context) return;
  context.clearRect(0, 0, view.width, view.height);
  context.save();
  context.translate(view.x, view.y);
  context.scale(view.zoom, view.zoom);
  nodes.filter(isVisible).forEach((node) => {
    if (node.id > 0) {
      // 索引直接得到父节点。
      const parent = nodes[Math.floor((node.id - 1) / 2)];

      context.strokeStyle = "#49612c";
      context.lineWidth = 1 / view.zoom;
      context.beginPath();
      context.moveTo(parent.x, parent.y);
      context.bezierCurveTo(parent.x, parent.y + 45, node.x, node.y - 45, node.x, node.y);
      context.stroke();
    }
    context.fillStyle = selectedNode.value?.id === node.id ? "#fffbe9" : "#c8ff5b";
    context.beginPath();
    context.arc(node.x, node.y, collapsed.has(node.id) ? 8 : 4, 0, Math.PI * 2);
    context.fill();
    if (view.zoom > 0.35 || selectedNode.value?.id === node.id) {
      context.font = '12px "PingFang SC", "Noto Sans SC", sans-serif';
      context.textAlign = "center";
      context.fillStyle = "#b8c2ad";
      context.fillText(node.label, node.x, node.y + 22);
    }
  });
  context.restore();
}

// 把整棵树缩放到当前画布。
function resetView() {
  // 世界坐标根据叶节点数量展开。
  const worldWidth = Math.max(view.width, 2 ** (generation.value - 1) * 44);

  view.zoom = Math.min(view.width / (worldWidth + 60), (view.height - 70) / (generation.value * 85), 1);
  view.x = (view.width - worldWidth * view.zoom) / 2;
  view.y = 30;
  draw();
}

// 以画布中心进行缩放。
function zoomBy(factor) {
  // 限制缩放范围，保留中心位置。
  const zoom = Math.min(Math.max(view.zoom * factor, 0.02), 3);

  view.x = view.width / 2 - (view.width / 2 - view.x) * zoom / view.zoom;
  view.y = view.height / 2 - (view.height / 2 - view.y) * zoom / view.zoom;
  view.zoom = zoom;
  draw();
}

// 搜索并居中定位节点。
function searchNode() {
  // 在虚构数据中按名称查询。
  const node = nodes.find((item) => item.label.includes(query.value.trim()));

  if (!query.value.trim() || !node) { message.value = "请输入有效成员名称，例如 成员015"; return; }
  collapsed.clear();
  selectedNode.value = node;
  view.zoom = 1;
  view.x = view.width / 2 - node.x;
  view.y = view.height / 2 - node.y;
  message.value = `${node.label} · 第 ${node.depth + 1} 代，已定位`;
  draw();
}

// 记录拖动起点并捕获指针。
function startDrag(event) {
  drag = { x: event.offsetX, y: event.offsetY, originX: view.x, originY: view.y, moved: false };
  canvas.value.setPointerCapture(event.pointerId);
}

// 拖动画布，避免节点意外点击。
function moveDrag(event) {
  if (!drag) return;
  if (Math.abs(event.offsetX - drag.x) + Math.abs(event.offsetY - drag.y) > 5) drag.moved = true;
  view.x = drag.originX + event.offsetX - drag.x;
  view.y = drag.originY + event.offsetY - drag.y;
  draw();
}

// 点击节点切换子树可见性。
function endDrag(event) {
  if (!drag) return;
  if (!drag.moved) {
    // 屏幕坐标转换为树形世界坐标。
    const x = (event.offsetX - view.x) / view.zoom;

    const y = (event.offsetY - view.y) / view.zoom;

    const node = nodes.find((item) => isVisible(item) && Math.hypot(item.x - x, item.y - y) < Math.max(10, 10 / view.zoom));

    if (node) {
      selectedNode.value = node;
      collapsed.has(node.id) ? collapsed.delete(node.id) : collapsed.add(node.id);
      message.value = `${node.label} · 第 ${node.depth + 1} 代`;
    }
  }
  drag = null;
  draw();
}

onMounted(() => {
  context = canvas.value.getContext("2d");
  observer = new ResizeObserver(([entry]) => {
    view.width = entry.contentRect.width;
    canvas.value.width = view.width * Math.min(window.devicePixelRatio, 2);
    canvas.value.height = view.height * Math.min(window.devicePixelRatio, 2);
    context.setTransform(Math.min(window.devicePixelRatio, 2), 0, 0, Math.min(window.devicePixelRatio, 2), 0, 0);
    buildTree();
  });
  observer.observe(canvas.value);
  document.fonts.ready.then(draw);
});

onUnmounted(() => observer?.disconnect());
// 家谱数据规模选项保留数值类型。
const generationOptions = [
  { value: 5, label: "31 个节点" },
  { value: 7, label: "127 个节点" },
  { value: 10, label: "1023 个节点" },
];

</script>

<template>
  <div class="demo-frame"><div class="demo-toolbar"><form class="search-field" @submit.prevent="searchNode"><PhMagnifyingGlass :size="18"/><input v-model="query" aria-label="搜索家谱成员" placeholder="搜索成员，如 成员015"><button type="submit">定位</button></form><div class="inline-control"><label for="tree-size">数据规模</label><UiSelect id="tree-size" v-model="generation" :options="generationOptions" size="compact" class="w-36" @update:model-value="buildTree" /></div></div><div class="tree-canvas-wrap"><canvas ref="canvas" class="tree-canvas" aria-label="可交互虚构家谱，通过上方搜索定位成员，使用下方按钮缩放" @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="endDrag" @pointercancel="drag = null" @wheel.prevent="zoomBy($event.deltaY < 0 ? 1.12 : 0.89)"></canvas><div class="canvas-tools"><UiTooltip label="放大家谱"><button class="icon-button" aria-label="放大家谱" @click="zoomBy(1.3)"><PhPlus :size="20"/></button></UiTooltip><UiTooltip label="缩小家谱"><button class="icon-button" aria-label="缩小家谱" @click="zoomBy(0.77)"><PhMinus :size="20"/></button></UiTooltip><UiTooltip label="重置视图"><button class="icon-button" aria-label="重置视图" @click="resetView"><PhArrowCounterClockwise :size="20"/></button></UiTooltip></div></div><div class="demo-status" role="status"><span>{{ message }}</span><span>{{ nodeCount }} NODES</span></div></div>
</template>
