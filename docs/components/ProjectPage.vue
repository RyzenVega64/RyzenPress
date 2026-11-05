<script setup>
import { computed, defineAsyncComponent } from "vue";
import { PhArrowLeft, PhArrowUpRight } from "@phosphor-icons/vue";
import { projects } from "../data/projects.js";

// 项目路由传入固定标识，复杂演示按需加载。
const props = defineProps({ slug: { type: String, required: true } });

const project = computed(() => projects.find((item) => item.slug === props.slug));

const nextProject = computed(() => projects[(projects.findIndex((item) => item.slug === props.slug) + 1) % projects.length]);

const GenealogyDemo = defineAsyncComponent(() => import("./demos/GenealogyDemo.vue"));

const CinemaDemo = defineAsyncComponent(() => import("./demos/CinemaDemo.vue"));

const IndustrialDemo = defineAsyncComponent(() => import("./demos/IndustrialDemo.vue"));
</script>

<template>
  <div class="wrap inner-page project-page"><a class="text-link" href="/work"><PhArrowLeft :size="16"/> 返回作品</a><header class="page-heading reveal"><p class="eyebrow">{{ project.discipline }} / {{ project.number }}</p><h1>{{ project.title }}</h1><p>{{ project.subtitle }}</p><div class="tag-list"><span v-for="tag in project.stack" :key="tag">{{ tag }}</span></div></header><img class="project-banner reveal" :src="project.image" :alt="project.category + '概念视觉'" width="1536" height="640"><section class="project-overview reveal"><div><p class="eyebrow">THE CONTEXT</p><h2>让想法落地。</h2><p>{{ project.overview }}</p></div><dl><div><dt>方向</dt><dd>{{ project.category }}</dd></div><div><dt>作品性质</dt><dd>{{ project.origin }}</dd></div><div><dt>角色</dt><dd>前端开发与交互设计</dd></div></dl></section><section class="demo-section"><div class="section-heading"><div><p class="eyebrow">HANDS ON</p><h2>交互演示</h2></div><span class="muted">亲手操作，探索细节。</span></div><ClientOnly><GenealogyDemo v-if="slug === 'genealogy'"/><CinemaDemo v-else-if="slug === 'ai-cinema'"/><IndustrialDemo v-else/><template #fallback><p class="demo-loading">正在准备交互空间…</p></template></ClientOnly></section><section class="challenge-grid"><article v-for="(challenge, index) in project.challenges" :key="challenge.title" class="reveal"><span class="eyebrow">0{{ index + 1 }} / ENGINEERING NOTES</span><h3>{{ challenge.title }}</h3><p>{{ challenge.text }}</p></article></section><a class="next-project" :href="`/work/${nextProject.slug}`"><div><p class="eyebrow">NEXT EXPLORATION</p><h2>{{ nextProject.title }}</h2></div><PhArrowUpRight :size="40"/></a></div>
</template>
