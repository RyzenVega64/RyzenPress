<script setup>
import { TooltipContent, TooltipPortal, TooltipProvider, TooltipRoot, TooltipTrigger } from "reka-ui";

// 图标按钮复用同一份可访问名称与视觉提示。
defineProps({ label: { type: String, required: true } });
</script>

<template>
  <TooltipProvider :delay-duration="400" :skip-delay-duration="100">
    <TooltipRoot>
      <TooltipTrigger as-child><slot /></TooltipTrigger>
      <TooltipPortal><TooltipContent class="ui-tooltip" :side-offset="8" :collision-padding="12">{{ label }}</TooltipContent></TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
