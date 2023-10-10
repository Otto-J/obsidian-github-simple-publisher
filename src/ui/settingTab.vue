<template>
  <h1 class="H1">Setting Tab</h1>
  <button @click="a++">{{ msg }} is {{ a }}</button>
  <div>{{ currentSetting }}</div>
  <button @click="onSubmit">改变配置</button>
</template>
<script lang="ts" setup>
import type { Plugin } from "obsidian";
import { onMounted, ref } from "vue";
const a = ref(1);

const props = withDefaults(
  defineProps<{
    msg: string;
    plugin: Plugin | undefined;
  }>(),
  {
    msg: "hello",
    plugin: undefined,
  }
);

const emits = defineEmits<{
  (event: "updateSetting", ...args: any[]): void;
}>();

const currentSetting = ref<any>({});

const loadUserSeeting = async (_this: Plugin) => {
  const userSetting = await _this.loadData();
  console.log("插件内1", "user setting", userSetting);
  return userSetting;
};
onMounted(async () => {
  console.log("插件内2", props.plugin);
  if (props.plugin) {
    const _currentSetting = await loadUserSeeting(props.plugin);
    console.log("222", _currentSetting);
    currentSetting.value = _currentSetting;
  }
});

const onSubmit = async () => {
  const now = new Date();
  const newSeeting = {
    ...currentSetting.value,
    time: now.getSeconds(),
  };
  currentSetting.value = newSeeting;
  await props.plugin?.saveData(newSeeting);
  console.log("save");
};
</script>

<style></style>
