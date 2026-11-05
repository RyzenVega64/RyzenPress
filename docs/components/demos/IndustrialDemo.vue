<script setup>
import UiTooltip from "../ui/UiTooltip.vue";
import UiSelect from "../ui/UiSelect.vue";
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PhPause, PhPlay } from "@phosphor-icons/vue";

// 设备与模拟遥测状态。
const host = ref(null);

const selected = ref(0);

const paused = ref(false);

const scenario = ref("normal");

const tick = ref(0);

const error = ref("");

const devices = ["原料输入站", "精密加工站", "装配机械臂", "视觉检测站", "包装工作站", "成品输出站"];

const temperature = computed(() => (38 + selected.value * 2 + Math.sin(tick.value * 0.3) * 2 + (scenario.value === "alert" ? 31 : 0)).toFixed(1));

const load = computed(() => Math.round(60 + Math.sin(tick.value * 0.4 + selected.value) * 16 + (scenario.value === "alert" ? 18 : 0)));

const status = computed(() => scenario.value === "alert" ? "温度告警" : "运行正常");

// 场景资源与生命周期句柄。
let renderer;

let scene;

let camera;

let controls;

let observer;

let interval;

let machineGroups = [];

// 每个设备由机座、主轴与状态灯组成，表达简化的真实空间关系。
function buildMachines() {
  // 公用设备材质。
  const metal = new THREE.MeshStandardMaterial({ color: 0x66716a, metalness: 0.75, roughness: 0.3 });

  const darkMetal = new THREE.MeshStandardMaterial({ color: 0x18201b, metalness: 0.6, roughness: 0.5 });

  const signal = new THREE.MeshStandardMaterial({ color: 0xc8ff5b, emissive: 0x5a8014, emissiveIntensity: 1.5 });

  devices.forEach((name, index) => {
    // 用设备组保存可拾取的设备索引。
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.5, 1.1), darkMetal);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.7), metal);

    const spindle = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.1, 18), metal);

    const light = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 12), signal);

    base.position.y = 0.25;
    body.position.y = 1;
    spindle.position.set(0.5, 1.35, 0);
    spindle.rotation.z = Math.PI / 3;
    light.position.set(-0.25, 1.7, 0.25);
    group.add(base, body, spindle, light);
    group.position.set((index % 3 - 1) * 2.5, 0, Math.floor(index / 3) * 3 - 1.5);
    group.userData.device = index;
    group.userData.light = light;
    scene.add(group);
    machineGroups.push(group);
  });
  // 输送线连接两排设备。
  const belt = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.12, 0.45), metal);

  belt.position.y = 0.5;
  scene.add(belt);
  scene.add(new THREE.GridHelper(14, 28, 0x476522, 0x182319));
}

// 渲染当前设备选择与告警场景。
function renderScene() {
  if (!renderer) return;
  machineGroups.forEach((group, index) => {
    group.scale.setScalar(selected.value === index ? 1.07 : 1);
    group.userData.light.visible = scenario.value !== "alert" || index !== selected.value || tick.value % 2 === 0;
  });
  renderer.render(scene, camera);
}

// 通过射线拾取设备，保持数据与空间联动。
function pickDevice(event) {
  if (!renderer) return;
  // 视口坐标归一化。
  const bounds = renderer.domElement.getBoundingClientRect();

  const pointer = new THREE.Vector2((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);

  const ray = new THREE.Raycaster();

  ray.setFromCamera(pointer, camera);
  // 命中物体向上找到设备组。
  let object = ray.intersectObjects(machineGroups, true)[0]?.object;

  while (object && object.userData.device === undefined) object = object.parent;
  if (object) selected.value = object.userData.device;
  renderScene();
}

watch([selected, scenario, tick], renderScene);

onMounted(() => {
  paused.value = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
  catch { error.value = "此设备无法启动三维场景。仍可通过右侧设备列表查看模拟状态。"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  host.value.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(9, 8, 10);
  controls = new OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", renderScene);
  controls.minDistance = 5;
  controls.maxDistance = 24;
  controls.maxPolarAngle = Math.PI / 2.05;
  scene.add(new THREE.HemisphereLight(0xdaf5d2, 0x17221b, 3));
  // 主光与绿色轮廓光。
  const keyLight = new THREE.DirectionalLight(0xffffff, 5);

  const rimLight = new THREE.PointLight(0xc8ff5b, 35);

  keyLight.position.set(4, 8, 3);
  rimLight.position.set(-3, 5, -2);
  scene.add(keyLight, rimLight);
  buildMachines();
  observer = new ResizeObserver(([entry]) => {
    renderer.setSize(entry.contentRect.width, entry.contentRect.height);
    camera.aspect = entry.contentRect.width / entry.contentRect.height;
    camera.updateProjectionMatrix();
    renderScene();
  });
  observer.observe(host.value);
  interval = setInterval(() => { if (!paused.value && !document.hidden) tick.value++; }, 900);
  renderScene();
});

onUnmounted(() => {
  clearInterval(interval);
  observer?.disconnect();
  controls?.dispose();
  scene?.traverse((object) => { object.geometry?.dispose(); if (object.material) object.material.dispose(); });
  renderer?.dispose();
});
// 运行场景与设备选择项。
const scenarioOptions = [
  { value: "normal", label: "正常运行" },
  { value: "alert", label: "告警场景" },
];

const deviceOptions = devices.map((label, value) => ({ value, label }));

</script>

<template>
  <div class="demo-frame"><div class="demo-toolbar"><span class="eyebrow">DIGITAL TWIN / 模拟产线</span><div class="button-group"><UiSelect v-model="scenario" :options="scenarioOptions" aria-label="运行场景" class="w-36" /><UiTooltip :label="paused ? '继续模拟' : '暂停模拟'"><button class="icon-button" :aria-label="paused ? '继续模拟' : '暂停模拟'" @click="paused = !paused"><PhPlay v-if="paused" :size="20"/><PhPause v-else :size="20"/></button></UiTooltip></div></div><div class="industrial-layout"><div ref="host" class="industrial-scene" @click="pickDevice"><p v-if="error" class="scene-error">{{ error }}</p><span class="scene-hint">拖动旋转 · 滚轮缩放 · 点击设备</span></div><aside class="industrial-panel"><label class="eyebrow" for="device-select">DEVICE SELECTION</label><UiSelect id="device-select" v-model="selected" :options="deviceOptions" class="mt-3" /><p :class="['device-status', { alert: scenario === 'alert' }]">{{ status }}</p><div class="telemetry-value"><span>设备温度</span><strong>{{ temperature }}<small> °C</small></strong></div><div class="telemetry-value"><span>运行负载</span><strong>{{ load }}<small> %</small></strong></div><div class="load-track" role="meter" aria-label="模拟设备负载" :aria-valuenow="load" :aria-valuemin="0" :aria-valuemax="100"><span :style="{ width: `${load}%` }"/></div><p class="content-note">模拟遥测，仅用于交互展示。</p></aside></div></div>
</template>
