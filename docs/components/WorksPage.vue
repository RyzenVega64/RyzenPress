<script setup>
import { computed, ref } from "vue";
import { projects } from "../data/projects.js";
import ProjectCard from "./ProjectCard.vue";

// 当前作品筛选分类。
const activeFilter = ref("全部");

const filters = ["全部", ...projects.map((project) => project.category)];

const visibleProjects = computed(() => activeFilter.value === "全部" ? projects : projects.filter((project) => project.category === activeFilter.value));
</script>

<template>
  <div class="wrap inner-page"><header class="page-heading reveal"><p class="eyebrow">SELECTED WORK / 01—03</p><h1>把复杂，<br>做成<span>可感知的体验。</span></h1><p>家谱里的连接，故事里的想象，工业空间里的秩序。<br>三个方向，同一种对交互与工程的好奇。</p></header><div class="filter-bar" aria-label="筛选作品"><button v-for="filter in filters" :key="filter" :aria-pressed="activeFilter === filter" :class="{ active: activeFilter === filter }" @click="activeFilter = filter">{{ filter }}</button></div><div class="works-list"><ProjectCard v-for="project in visibleProjects" :key="project.slug" :project="project"/></div><p class="content-note">项目封面为概念视觉，演示使用虚构或模拟数据。真实经历请参阅关于我。</p></div>
</template>
