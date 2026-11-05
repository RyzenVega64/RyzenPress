<script setup>
import { PhArrowUpRight } from "@phosphor-icons/vue";

// 首页与作品索引共用的作品封面。
defineProps({ project: { type: Object, required: true } });
</script>

<template>
  <a :href="`/work/${project.slug}`" class="project-card reveal">
    <img :src="project.image" :alt="`${project.category}概念视觉`" loading="lazy" width="1536" height="640">
    <div class="project-card-copy"><span class="eyebrow">EXP.{{ project.number }} <span class="short-rule"></span> {{ project.discipline }}</span><h3>{{ project.title }} <PhArrowUpRight :size="24"/></h3><p class="project-category">{{ project.category }}</p><p class="project-description">{{ project.description }}</p></div>
  </a>
</template>
