import { App, Notice, TFile, stringifyYaml } from "obsidian";
// import MD from "markdown-it";
import axios from "axios";

const hasFrontMatter = (content: string) => {
  const frontMatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n/;
  const match = frontMatterRegex.test(content);
  return match;
};

const hasImgLink = (content: string) => {
  // 查找是否包含 ![alt](url) 的图片链接 和
  const containRelationImgPath =
    /!\[[^\]]*\]\((?!https?:\/\/)[^\s)]+\.(?:png|jpe?g|gif|webp)\)/gi;

  const isImageLink = containRelationImgPath.test(content);
  // [[.${imgSubfix}]]
  const imgLinkRegex2 = /\[\[.*\.(jpe?g|png|gif|webp)/gi;
  const isImageSubfix = imgLinkRegex2.test(content);

  return isImageLink || isImageSubfix;
};

export const handleFile = (content: string) => {
  // 判断是否为 String
  if (typeof content !== "string") {
    new Notice("文件内容不是字符串");
  }
  // 判断内容是否包含 markdown formatter
  const hasFrontMatterFlag = hasFrontMatter(content);
  // 判断是否包含图片链接
  const hasUnhandledImgFlag = hasImgLink(content);
  console.log("hasFrontMatterFlag", hasFrontMatterFlag);
  console.log("hasUnhandledImgFlag", hasUnhandledImgFlag);
  return {
    hasFrontMatterFlag,
    hasUnhandledImgFlag,
  };
};

export const uploadGithub = async (
  filename: string,
  content: string,
  hash: string,
  settings: Record<string, string>
) => {
  // 读取配置

  const {
    owner,
    repo,
    path,
    branch,
    token,
    enabled,
    commitMessage,
    commitName,
    commitEmail,
  } = settings;

  if (!enabled) {
    new Notice("Github Simple Publisher 未启用，前往设置开启");
    return;
  }

  const http = axios.create({
    baseURL: "https://api.github.com",
    timeout: 10000,
    headers: {
      // Accept: "application/vnd.github+json",
      Authorization: `token ${token}`,
      // "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  const apiUrl = `/repos/${owner}/${repo}/contents/${path}${filename}`;

  const res1 = await http.request({
    method: "get",
    url: apiUrl,
  });

  const sha = res1.data.sha;

  // const encodeContent = btoa(encodeURIComponent(content));
  // @ts-ignore
  const encodeContent = Buffer.from(content).toString("base64");
  const payload = {
    message: commitMessage,
    content: encodeContent,
    branch: branch,
    sha,
    // 更新文件必须的
    // sha: hash,
    committer: {
      name: commitName,
      email: commitEmail,
    },
  };

  //    创建或更新文件
  return http
    .put(apiUrl, payload)
    .then((res) => {
      console.log("44,JSON file published:");

      new Notice("文件上传成功");
      return res.data as { content: any };
    })
    .catch((err) => {
      console.log("文件上传失败", err);
      new Notice("文件上传失败" + err.message);
      return null;
    });
};

export const useObsidianFrontmatter = (file: TFile, app: App) => {
  // 使用更具语义化的函数名
  const doesFileExist = () => !!app.metadataCache.getFileCache(file);

  const currentFrontMatter = () =>
    app.metadataCache.getFileCache(file)?.frontmatter ?? {};
  const addOrUpdateFrontMatter = async (obj: Record<string, string>) => {
    const fileCache = app.metadataCache.getFileCache(file);
    // 如果文件不存在，直接返回
    if (!fileCache) {
      new Notice("文件不存在");
      return;
    }

    const currentFrontMatter = fileCache?.frontmatter ?? {};
    const newFrontMatter = `---\n${stringifyYaml({
      ...currentFrontMatter,
      ...obj,
    })}\n---`;

    const { frontmatterPosition } = fileCache;
    const fileContents = await app.vault.read(file);

    // 如果文件没有 Frontmatter，直接返回
    if (!frontmatterPosition) {
      new Notice("文件匹配 frontMatter 失败");
      return;
    }

    // 这里逻辑比较绕，目的是重写文件内容，后面如果有 api 可能就一行代码解决了，类似 metadataCache.update
    const {
      start: { offset: deleteFrom },
      end: { offset: deleteTo },
    } = frontmatterPosition;

    const newFileContents =
      fileContents.slice(0, deleteFrom) +
      newFrontMatter +
      fileContents.slice(deleteTo);

    await app.vault.modify(file, newFileContents);
  };

  return {
    doesFileExist,
    addOrUpdateFrontMatter,
    currentFrontMatter,
  };
};
