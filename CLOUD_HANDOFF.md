# Cloudflare 仓库发布交接

## 当前配置

生产站点通过 GitHub 仓库连接的 Cloudflare Workers Builds 发布。现有资源继续使用：

| 项目 | 当前值 |
| --- | --- |
| GitHub 仓库 | https://github.com/tianyi092-jcza/sanguo |
| 生产分支 | `main` |
| Worker | `sanguo-chronicle` |
| 自定义域名 | https://sanguo.720108.xyz/ |
| 构建命令 | `npm run build:cloud` |
| 部署命令 | `npx wrangler deploy`，只在 Cloudflare 构建环境执行 |

Worker、账号、域名和当前验证版本记录在 [deployment.json](deployment.json) 与 [wrangler.jsonc](wrangler.jsonc)。构建参数必须匹配这两个文件中的既有配置，不要创建替代 Worker 或域名。

## 发布工作流

1. 修改源码和数据，在本地运行 `npm run build` 与 `npm run check`。
2. 核对 `git diff` 和待提交文件，排除密钥、本地凭据及忽略的构建产物。
3. 用户要求推送后，提交并推送 `main`。推送会触发 Cloudflare 生产发布。
4. 等待 Cloudflare Workers Builds 成功，再检查正式域名上的实际改动。
5. 只有生产验证成功后才更新 `deployment.json` 的验证版本和状态。

推送 `main` 是生产发布动作；不得为了绕过仓库构建而在开发机上执行 `wrangler deploy`。GitHub Actions 的 `.github/workflows/verify.yml` 只运行构建和数据验证，不是另一条部署链。

## 构建设置与地图

Workers Builds 使用 Node.js 22、仓库根目录。构建命令为 `npm run build:cloud`；该命令先检查 Worker、账号、域名和地图密钥配置，再执行 `npm run build` 与 `npm run check`。

Cloudflare 构建环境必须保留 secret `GOOGLE_MAPS_API_KEY`。语言和区域变量为 `GOOGLE_MAPS_LANGUAGE=zh-TW` 与 `GOOGLE_MAPS_REGION=CN`。地图密钥不得写入仓库、源码、聊天或普通日志，也不要删除现有 secret；缺少密钥时构建会停止，以免破坏已验证的卫星地图。

本地浏览器配置文件 `maps.config.local.json` 已加入 `.gitignore`。若本地预览需要地图密钥，只在该忽略文件或进程环境中配置，不覆盖已有密钥。应用使用 Map Tiles API 卫星图块；不要加入道路、现代地名或其他图层。

## 验证记录

`deployment.json` 记录的当前已验证仓库部署版本是 `49a2f915-e169-47b7-a8da-a64bf59d2650`，验证提交为 `92749334312cfd294f4eab6fce42494971aee76e`，Cloudflare 构建 ID 为 `1dbb0f9f-f4a1-4bef-9a24-2db8c107484f`。后续源代码推送会产生新构建；这些历史值仅代表上一轮成功验收，不能代替新版本的正式网址验证。

源码压缩包仅作备用。完整史料语料已缓存并由 `data/source-corpus-manifest.json` 校验；克隆仓库后应运行 `npm ci`，不要重复下载或覆盖已经缓存的底本。

## 当前续作状态

截至 2026-10-06，Dots/Codex Cloud 头像续作已停止，头像自动任务处于暂停状态，待生成数量为零。人物资料二次复核是另一项本地任务：张邈已完成，曹操仍为 pilot；用户也已暂停该复核定时任务。不要从旧的云端接续说明自动恢复或另建定时任务。
