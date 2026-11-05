<script setup>
import { NumberFieldDecrement, NumberFieldIncrement, NumberFieldInput, NumberFieldRoot } from "reka-ui";
import { PhMinus, PhPlus } from "@phosphor-icons/vue";

// 标签和 id 绑定到真正输入框。
defineOptions({ inheritAttrs: false });

defineProps({ min: { type: Number, default: 0 }, max: { type: Number, default: 99999 }, step: { type: Number, default: 1 }, label: { type: String, required: true } });

// 与业务状态双向绑定。
const model = defineModel({ type: Number, default: 0 });
</script>

<template>
  <NumberFieldRoot v-model="model" :min="min" :max="max" :step="step" :format-options="{ useGrouping: false }" class="ui-number">
    <NumberFieldDecrement class="ui-number-step" :aria-label="`减少${label}`"><PhMinus :size="15" /></NumberFieldDecrement>
    <NumberFieldInput v-bind="$attrs" :aria-label="label" class="ui-number-input" />
    <NumberFieldIncrement class="ui-number-step" :aria-label="`增加${label}`"><PhPlus :size="15" /></NumberFieldIncrement>
  </NumberFieldRoot>
</template>
