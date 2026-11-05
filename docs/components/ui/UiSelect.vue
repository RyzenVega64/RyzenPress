<script setup>
import { SelectContent, SelectIcon, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from "reka-ui";
import { PhCheck, PhCaretDown } from "@phosphor-icons/vue";

// 附加属性交给触发器，保证外部标签和无障碍名称有效。
defineOptions({ inheritAttrs: false });

// 选项保留原始数值类型，避免业务层反复转换。
defineProps({ options: { type: Array, required: true }, placeholder: { type: String, default: "请选择" }, disabled: Boolean, size: { type: String, default: "default" } });

// 与业务状态双向绑定。
const model = defineModel({ type: [String, Number] });
</script>

<template>
  <SelectRoot v-model="model" :disabled="disabled">
    <SelectTrigger v-bind="$attrs" :class="['ui-select-trigger', { 'ui-select-compact': size === 'compact' }]">
      <SelectValue :placeholder="placeholder" />
      <SelectIcon as-child><PhCaretDown class="ui-select-caret" :size="16" /></SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent class="ui-select-content" position="popper" :side-offset="6" :collision-padding="12" :body-lock="false">
        <SelectViewport class="ui-select-viewport">
          <SelectItem v-for="option in options" :key="option.value" :value="option.value" :disabled="option.disabled" class="ui-select-item">
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="ui-select-check"><PhCheck :size="16" weight="bold" /></SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
