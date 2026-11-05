<script setup>
import { ref } from "vue";
import { PhArrowRight, PhArrowUpRight, PhArrowDown } from "@phosphor-icons/vue";
import { projects, experiments } from "../data/projects.js";
import ProjectCard from "./ProjectCard.vue";

// 主视觉保持独立图层，指针运动产生轻微空间视差。
const hero = ref(null);

// 尊重减少动画偏好，避免移动设备产生无意义的视差。
function moveHero(event) {
  if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // 使用容器坐标，避免指针进入子元素时跳动。
  const bounds = hero.value.getBoundingClientRect();

  hero.value.style.setProperty("--pointer-x", `${((event.clientX - bounds.left) / bounds.width - 0.5) * 14}px`);
  hero.value.style.setProperty("--pointer-y", `${((event.clientY - bounds.top) / bounds.height - 0.5) * 10}px`);
}

// 离开主视觉时恢复中心位置。
function resetHero() {
  hero.value.style.setProperty("--pointer-x", "0px");
  hero.value.style.setProperty("--pointer-y", "0px");
}
</script>

<template>
  <section ref="hero" class="hero" @pointermove="moveHero" @pointerleave="resetHero">
    <img class="hero-art" src="/images/hero-tunnel.png" alt="银色工业结构与绿色家谱节点交织成的空间隧道" width="1920" height="1080" fetchpriority="high">
    <div class="hero-inner wrap"><div class="hero-copy reveal"><p class="eyebrow">CREATIVE DEVELOPER / ZHENGZHOU</p><h1>CODE IN /<br><em>MOTION.</em></h1><div class="hero-introduction"><p>张竞舟 / 前端开发工程师</p><h2>让复杂，变得可见。</h2><span>家谱关系 · AI 短剧 · 工业可视化</span></div><div class="hero-actions"><a class="button primary" href="/lab">探索交互空间 <PhArrowRight :size="19"/></a><a class="button secondary" href="/work">查看作品 <PhArrowUpRight :size="19"/></a></div></div><a class="scroll-cue" href="#selected-work"><span>SCROLL TO EXPLORE</span><PhArrowDown :size="21"/></a></div>
    <div class="hero-disciplines wrap"><span>CREATIVE CODING</span><span>AI STORYTELLING</span><span>DIGITAL TWINS</span></div>
  </section>
  <section id="selected-work" class="selected-work wrap section-space">
    <div class="section-rail reveal"><p class="eyebrow">01 — SELECTED EXPLORATIONS</p><h2>Selected<br>explorations /</h2><h3>从真实问题，<br>到交互体验。</h3><span class="accent-rule"></span><p>以代码为媒介，将关系、叙事与空间转化为可感知、可探索的体验。</p><a href="/work" class="text-link">浏览全部作品 <PhArrowUpRight :size="17"/></a></div>
    <div class="project-list"><ProjectCard v-for="project in projects" :key="project.slug" :project="project"/></div>
  </section>
  <section class="lab-preview wrap reveal"><div><p class="eyebrow">02 / PLAYGROUND</p><h2>实验室</h2><p>保持好奇，亲手试试。</p></div><a v-for="experiment in experiments" :key="experiment.id" :href="`/lab?experiment=${experiment.id}`"><span class="eyebrow">{{ experiment.number }} / {{ experiment.label }}</span><h3>{{ experiment.title }} <PhArrowUpRight :size="20"/></h3><p>{{ experiment.description }}</p></a></section>
</template>
