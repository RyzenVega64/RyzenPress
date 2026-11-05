<script setup>
import { computed } from "vue";
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from "reka-ui";

// 统一滑块参数，外部组件只传入单个数值。
defineProps({ min: { type: Number, default: 0 }, max: { type: Number, default: 100 }, step: { type: Number, default: 1 }, disabled: Boolean, label: { type: String, required: true } });

// 与业务状态双向绑定。
const model = defineModel({ type: Number, default: 0 });

// Reka 使用数组表达多滑块，这里封装成单值接口。
const values = computed({ get: () => [model.value], set: ([value]) => { model.value = value; } });
</script>

<template>
  <SliderRoot v-model="values" :min="min" :max="max" :step="step" :disabled="disabled" class="ui-slider">
    <SliderTrack class="ui-slider-track"><SliderRange class="ui-slider-range" /></SliderTrack>
    <SliderThumb class="ui-slider-thumb" :aria-label="label" />
  </SliderRoot>
</template>
