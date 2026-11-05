<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";
import * as THREE from "three";

// 粒子场景参数。
const props = defineProps({ count: { type: Number, default: 5000 }, speed: { type: Number, default: 1 }, shape: { type: String, default: "sphere" }, paused: Boolean });

const emit = defineEmits(["stats", "error"]);

const host = ref(null);

const error = ref("");

// Three.js 资源只在客户端创建。
let renderer;

let scene;

let camera;

let material;

let points;

let observer;

let frame;

let elapsed = 0;

let lastTime = 0;

let measuredFrames = 0;

let measuredTime = 0;

// 生成均匀球体分布，GPU 根据形态参数变换位置。
function createParticles() {
  points?.geometry.dispose();
  if (points) scene.remove(points);
  // 每个粒子保留稳定的随机位置。
  const positions = new Float32Array(props.count * 3);

  for (let index = 0; index < props.count; index++) {
    positions[index * 3] = Math.random() * 2 - 1;
    positions[index * 3 + 1] = Math.random() * 2 - 1;
    positions[index * 3 + 2] = Math.random() * 2 - 1;
  }
  // 几何体和材质独立销毁。
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  points = new THREE.Points(geometry, material);
  scene.add(points);
  renderOnce();
}

// 只渲染一帧，暂停状态调整参数时也能更新。
function renderOnce() {
  if (!renderer) return;
  material.uniforms.time.value = elapsed;
  material.uniforms.shape.value = { sphere: 0, ring: 1, wave: 2 }[props.shape];
  renderer.render(scene, camera);
}

// 按实际时间推进动画，同时报告实测帧率。
function animate(time) {
  // 大跨度时间限制，避免后台恢复时跳变。
  const delta = Math.min((time - lastTime) / 1000, 0.05);

  lastTime = time;
  elapsed += delta * props.speed;
  measuredFrames++;
  measuredTime += delta;
  if (measuredTime > 1) {
    emit("stats", Math.round(measuredFrames / measuredTime));
    measuredFrames = 0;
    measuredTime = 0;
  }
  renderOnce();
  frame = requestAnimationFrame(animate);
}

// 隐藏页面或暂停实验时取消动画循环。
function syncAnimation() {
  cancelAnimationFrame(frame);
  renderOnce();
  if (props.paused || document.hidden || !renderer) return;
  lastTime = performance.now();
  frame = requestAnimationFrame(animate);
}

// 指针位置影响粒子场的朝向。
function pointerMove(event) {
  if (!material) return;
  // 将屏幕坐标归一化到画布。
  const bounds = host.value.getBoundingClientRect();

  material.uniforms.pointer.value.set((event.clientX - bounds.left) / bounds.width - 0.5, (event.clientY - bounds.top) / bounds.height - 0.5);
  renderOnce();
}

watch(() => props.count, () => { if (renderer) createParticles(); });

watch(() => props.shape, renderOnce);

watch(() => props.paused, syncAnimation);

onMounted(() => {
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch {
    error.value = "当前设备无法启动 WebGL，请尝试生成式海报或声音实验。";
    emit("error", error.value);
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  host.value.appendChild(renderer.domElement);
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 6;
  material = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, shape: { value: 0 }, pointer: { value: new THREE.Vector2() } },
    vertexShader: `uniform float time; uniform float shape; uniform vec2 pointer; varying float brightness;
      void main() {
        vec3 p = position;
        float angle = p.x * 3.14159 + time * 0.15;
        if (shape < 0.5) { p = normalize(p) * (1.1 + 0.7 * abs(p.z)); }
        else if (shape < 1.5) { float radius = 1.5 + p.z * 0.35; p = vec3(cos(angle) * radius, p.y * 0.25, sin(angle) * radius); }
        else { p = vec3(p.x * 2.5, sin(p.x * 4.0 + time) * cos(p.z * 3.0 + time * 0.7) * 0.5, p.z * 1.8); }
        p.y += sin(time * 0.7 + p.x * 2.0) * 0.09;
        vec2 gravity = vec2(pointer.x * 3.0, -pointer.y * 3.0);
        p.xy += (gravity - p.xy) * exp(-distance(p.xy, gravity) * 1.5) * 0.35;
        float turn = time * 0.08 + pointer.x * 0.8;
        p.xz = mat2(cos(turn), -sin(turn), sin(turn), cos(turn)) * p.xz;
        p.y += pointer.y * p.z * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = clamp(9.0 / -mv.z, 1.0, 4.0);
        brightness = 0.3 + (position.y + 1.0) * 0.3;
      }`,
    fragmentShader: `varying float brightness; void main() { float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard; gl_FragColor = vec4(0.78, 1.0, 0.36, (1.0 - d * 2.0) * brightness); }`,
  });
  createParticles();
  observer = new ResizeObserver(([entry]) => {
    renderer.setSize(entry.contentRect.width, entry.contentRect.height);
    camera.aspect = entry.contentRect.width / entry.contentRect.height;
    camera.updateProjectionMatrix();
    renderOnce();
  });
  observer.observe(host.value);
  document.addEventListener("visibilitychange", syncAnimation);
  syncAnimation();
});

onUnmounted(() => {
  cancelAnimationFrame(frame);
  observer?.disconnect();
  document.removeEventListener("visibilitychange", syncAnimation);
  points?.geometry.dispose();
  material?.dispose();
  renderer?.dispose();
});
</script>

<template><div ref="host" class="particle-scene" role="img" aria-label="可交互三维绿色粒子场，使用右侧控件切换形态与速度" @pointermove="pointerMove"><p v-if="error" class="scene-error" role="status">{{ error }}</p></div></template>
