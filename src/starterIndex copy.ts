import {
  App,
  ItemView,
  Menu,
  Notice,
  Platform,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
} from "obsidian";
import { createApp, type ComponentPublicInstance } from "vue";

import DemoVue from "./ui/test.vue";

const VIEW_TYPE = "vue-view";

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: "这是默认值",
};

class MyVueView extends ItemView {
  view!: ComponentPublicInstance;

  getViewType(): string {
    return VIEW_TYPE;
  }

  getDisplayText(): string {
    return "Dice Roller";
  }

  getIcon(): string {
    return "dice";
  }

  async onOpen(): Promise<void> {
    const app = createApp(DemoVue).mount(this.contentEl);
    this.view = app;
  }
}

// 核心
export default class MyPlugin extends Plugin {
  private view: MyVueView | null = null;

  settings!: MyPluginSettings;

  async onload() {}

  onunload() {
    this.view = null;
  }
}
