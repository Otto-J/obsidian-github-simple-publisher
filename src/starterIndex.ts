import {
  ItemView,
  App,
  Menu,
  Notice,
  Plugin,
  Platform,
  PluginSettingTab,
  TFile,
  TFolder,
  stringifyYaml,
  parseYaml,
} from "obsidian";
import {
  createApp,
  type ComponentPublicInstance,
  type App as VueApp,
} from "vue";
import DemoVue from "./ui/test.vue";
import SettingTabPage from "./ui/settingTab.vue";
import {
  handleFile,
  uploadGithub,
  useObsidianFrontmatter,
} from "./handler/file";

const debugFlag = true;
const log = (...arg: any) => {
  if (debugFlag) {
    console.log(...arg);
  }
};

/**
 * 注册一个 ItemView
 */
class MyVueView extends ItemView {
  // type form vue
  view!: ComponentPublicInstance;
  async onOpen(): Promise<void> {
    const app = createApp(DemoVue).mount(this.contentEl);
    this.view = app;
  }

  getViewType() {
    return VIEW_TYPE;
  }
  getDisplayText(): string {
    return "这是打开标签的标题";
  }
}

/**
 * 添加 设置面板
 */
class MySeetingTab extends PluginSettingTab {
  plugin: GitPublisherPlugin;
  _vueApp: VueApp | undefined;
  // plugin: MyPlugin;
  constructor(app: App, plugin: GitPublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    console.log("open设置面板");

    // 挂在 DemoVue
    const _app = createApp(SettingTabPage, {
      msg: "这是传入的参数",
      plugin: this.plugin,
    });
    this._vueApp = _app;
    _app.mount(this.containerEl);
  }
  hide() {
    // 好像不能保留实例
    console.log("close设置面板");
    // this.containerEl
    if (this._vueApp) {
      console.log("un mount");
      this._vueApp.unmount();
    }
    this.containerEl.empty();
  }
}

const loadUserSeeting = async (_this: Plugin) => {
  const userSetting = await _this.loadData();
  console.log(1, "user setting", userSetting);
};
const VIEW_TYPE = "vue-view";

export default class GitPublisherPlugin extends Plugin {
  async onload() {
    log("0,插件在第三方插件中启用了");
    // 先载入配置，保证用户的设置不丢失。后续可以抽离为方法，为了容易阅读
    // const userSetting = await this.loadData();
    // console.log(1, "user setting", userSetting);

    console.log(1, stringifyYaml({ a: 1, b: 2 }));
    console.log(1, parseYaml(stringifyYaml({ a: 1, b: 2 })));

    loadUserSeeting(this);

    // 保存配置
    {
      /**
      // 默认是空，这里我们放入一部分信息
      await this.saveData({ key: "val222" });
      //const userSetting2 = await this.loadData();
      //console.log(2, "new user setting", userSetting2);
    loadUserSeeting(this);

      // 此时发现 loadData 返回值已经是持久化的了。
      // 后续只要不重置，使用还有，随时可以 setData 进行更新
      // 抽离 loadSetting() saveSetting()
     */
    }

    // 接下来开始各种注册触发方案
    // 左侧 sidebar 具体文件单击右键
    {
      this.registerEvent(
        this.app.workspace.on("file-menu", (menu, file) => {
          if (file instanceof TFolder) {
            // 一定进不来，为了 ts 不报错
            console.log("It's a folder!", file);
            return;
          }

          if (file instanceof TFile) {
            // console.log("It's a file!");

            const isImg = ["png", "jpg", "jpeg", "gif"].includes(
              file.extension
            );

            if (isImg) {
              menu.addItem((item) => {
                item.setTitle("3图片处理").onClick(async () => {
                  console.log("是图片", file);
                  const content = await file.vault.cachedRead(file);
                  console.log(content);
                });
              });
            } else {
              menu.addItem((item) => {
                item.setTitle("4处理非图像内容").onClick(async () => {
                  console.log("2,", menu, file);

                  const {
                    doesFileExist,
                    addOrUpdateFrontMatter,
                    currentFrontMatter,
                  } = useObsidianFrontmatter(file, this.app);

                  // 这样可以获取到文件内容¬
                  const content = await file.vault.cachedRead(file);
                  // console.log(content);

                  // const res = handleFile(content);
                  // if (!res.hasFrontMatterFlag) {
                  //   new Notice("文件不包含 FrontMatter");
                  //   return;
                  // }
                  // if (res.hasUnhandledImgFlag) {
                  //   new Notice("文件包含未处理的图片");
                  //   return;
                  // }

                  // new Notice("右键菜单2");
                  const hash = currentFrontMatter().sha;
                  const remoteRes = await uploadGithub(
                    file.name,
                    content,
                    hash
                  );
                  if (!remoteRes) {
                    return;
                  }
                  const sha = remoteRes.content.sha;
                  console.log("sha", sha);
                  if (doesFileExist()) {
                    await addOrUpdateFrontMatter({
                      sha: sha,
                    });
                  }

                  // 写入 frontMatter 的 sha 里
                });
              });
            }
          }
        })
      );
    }

    // 这是编辑器右键注册
    {
      /** this.registerEvent(
        this.app.workspace.on("editor-menu", (menu, file) => {
          menu.addItem((item) => {
            item.setTitle("333右键菜单").onClick(async () => {
              console.log("2, trigger", menu, file);
              // console.log(34, file.basename, file);
              //  const content = await file.vault.cachedRead(file);
              //  console.log(36, content);
              new Notice("右键菜单3");
            });
          });
        })
      );*/
    }

    // 注册命令面板
    {
      this.addCommand({
        id: "xxx-id",
        // 建议包含英文名，方便快速搜索
        name: "注册命令中文名",
        callback: () => {
          console.log("触发命令面板");
          new Notice("触发命令面板");
        },
      });
    }

    // 注册一个页面，方便后面使用
    {
      this.registerView(VIEW_TYPE, (leaf) => {
        // this.view
        // this.view =
        const _view = new MyVueView(leaf);
        return _view;
      });
    }

    // sidebar 图标注册
    {
      this.addRibbonIcon(
        "lightbulb",
        "悬浮展示1",
        async (event: MouseEvent) => {
          console.log("addRibbonIcon 点击触发", event);
          // 实例化内置 menu
          {
            /*  const menu = new Menu();

          menu.addItem((item) => {
            item
              .setTitle("右键菜单1")
              .setIcon("lightbulb")
              .onClick(() => {
                new Notice("右键菜单1");
              });
          });
          menu.show AtMouseEvent(event);*/
          }
          // this.openMapView();
          // 尝试打开一个页面，需要提前声明 registerView
          // 这里的代码可以封装为 openView，方便任何使用打开页面
          {
            const workspace = this.app.workspace;
            // 先关闭所有的类型页面
            workspace.detachLeavesOfType(VIEW_TYPE);
            // 获取一个窗格对象，只在桌面端有效
            const leaf = workspace.getLeaf(!Platform.isMobile);
            // 打开新的
            await leaf.setViewState({ type: VIEW_TYPE });
            // focus 到 tab 上，默认看不到
            workspace.revealLeaf(leaf);
          }
        }
      );
    }

    // 添加一个设置面板  PluginSettingTab
    {
      const settingTab = new MySeetingTab(this.app, this);
      this.addSettingTab(settingTab);
    }

    // 页面 layout ready 还是没理解要干啥
    {
      this.app.workspace.onLayoutReady(() => {
        console.log("插件说：页面 layout ready");
        // debugger;
        if (this.app.workspace.getLeavesOfType("VIEW_TYPE").length) {
          console.log("插件说， view 已经有了");
          return;
        }
        console.log("插件说， view 还没有");

        this.app.workspace.getRightLeaf(false).setViewState({
          type: VIEW_TYPE,
        });
      });
    }
  }

  onunload(): void {
    log("99,插件在第三方插件中关闭了");
  }
}
