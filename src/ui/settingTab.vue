<template>
  <h1 class="H1">Github Simple Publisher</h1>
  <h2>这里配置 Github 基本信息</h2>

  <!-- <div>{{ setting }}</div> -->
  <div class="setting-item mod-toggle">
    <div class="setting-item-info">
      <div class="setting-item-name">启用状态</div>
      <div class="setting-item-description">若关闭插件不生效</div>
    </div>
    <div class="setting-item-control">
      <div
        class="checkbox-container"
        :class="setting.enable ? 'is-enabled' : ''"
      >
        <input type="checkbox" v-model="setting.enable" tabindex="0" />
      </div>
    </div>
  </div>
  <!-- username -->
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Github Username</div>
      <div class="setting-item-description">Github 用户名或组织名</div>
    </div>
    <div class="setting-item-control">
      <input v-model="setting.owner" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Github Repo</div>
      <!-- <div class="setting-item-description">Github Repo</div> -->
    </div>
    <div class="setting-item-control">
      <input v-model="setting.repo" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Repo Path</div>
      <!-- <div class="setting-item-description">Github 用户名</div> -->
    </div>
    <div class="setting-item-control">
      <input v-model="setting.path" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Repo Branch</div>
      <div class="setting-item-description">分支</div>
    </div>
    <div class="setting-item-control">
      <input v-model="setting.branch" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">Github Token</div>
      <div class="setting-item-description">Personal Access Token</div>
    </div>
    <div class="setting-item-control">
      <input
        v-model="setting.token"
        placeholder="ghp_开头"
        type="password"
        spellcheck="false"
      />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">提交信息</div>
      <div class="setting-item-description">git commit -m</div>
    </div>
    <div class="setting-item-control">
      <input v-model="setting.commitMessage" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">提交人</div>
      <div class="setting-item-description">user.name</div>
    </div>
    <div class="setting-item-control">
      <input v-model="setting.commitName" type="text" spellcheck="false" />
    </div>
  </div>
  <div class="setting-item">
    <div class="setting-item-info">
      <div class="setting-item-name">提交邮箱</div>
      <div class="setting-item-description">user.email</div>
    </div>
    <div class="setting-item-control">
      <input v-model="setting.commitEmail" type="text" spellcheck="false" />
    </div>
  </div>

  <div class="setting-item-control">
    <button class="mod-cta" @click="save">保存</button>
  </div>
</template>
<script lang="ts" setup>
import { Notice, type Plugin } from "obsidian";
import { onMounted, ref } from "vue";
const setting = ref({
  enable: true,
  owner: "",
  repo: "",
  path: "",
  branch: "",
  token: "",
  commitMessage: "robot: update by obsidian",
  commitName: "",
  commitEmail: "",
});

const props = withDefaults(
  defineProps<{
    plugin: Plugin | undefined;
  }>(),
  {
    plugin: undefined,
  }
);

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
    setting.value = _currentSetting;
  }
});

const save = async () => {
  const newSeeting = {
    // ...currentSetting.value,
    ...setting.value,
  };
  // currentSetting.value = newSeeting;
  await props.plugin?.saveData(newSeeting);
  console.log("save");
  new Notice("保存成功");
};
</script>

<style>
.o {
  outline: 1px solid red;
}
</style>
