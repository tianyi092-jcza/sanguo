# Dots云端接续与仓库发布

## 云端完成记录（2026-10-05）

指定已发布 Codex Cloud 环境已完成原有121个pending，分16批，每批最多8人。现有290张个性头像及3份匿名轮廓素材，pending=0；原先172个已完成条目与素材均保留。全部新增头像已通过main推送触发既有Cloudflare自动发布，并在 https://sanguo.720108.xyz/ 验证身份映射、120×120尺寸、文件一致性、出处和艺术示意说明。构建与数据检查通过，卫星配置保留。

最后素材提交 `ad962b9a2b0fa9385c5335ea1ec841db5c541a4f`，Cloudflare成功构建 `5e8c5f2b-d61d-474c-b2d9-9ff53dfa1355`；全量新增素材验证证据见 `data/portrait-cloud-completion.json`。元数据提交会再次触发构建，不追赶版本UUID。

按AGENTS.md的pending清零停止条件，云端续作已停止；本地定时任务仍PAUSED。另181人继续保持待逐人画像适用性复核状态，未自动增补pending，也未当作资料不足或全员完成。下方原始交接数量仅为开始时快照，当前状态以画像计划及批次记录为准。

项目是Node.js静态历史资料浏览器。依赖安装：`npm ci`；本地或云端验证：`npm run build`、`npm run check`。不需要数据库。

## 当前状态

471人均有实际势力标签，379人新增逐条复核，72人有汉末官爵及授官者；汉廷在位标记保留至220年。陈寿评曰65卷已分离裴注核对。头像完成状态以data/portrait-plan.json为准，未发布批次以data/portrait-batch-state.json为准。不得重复生成已完成头像。

源码、史料、素材和接续进度已推送 https://github.com/tianyi092-jcza/sanguo 的main分支，GitHub构建及数据检查通过。可以从仓库直接克隆接续；源码包仅为备用。Cloudflare自动生产发布已通过提交0ad5008、构建110a72ff-b504-4da3-a33b-1bb2a09fccc3验证成功，正式网站本批8张画像验证通过，原卫星配置保留。

## Cloudflare仓库连接

继续使用deployment.json和wrangler.jsonc中的账号、Worker与域名。在现有Worker的Settings → Builds中连接GitHub的sanguo仓库：

- 生产分支：main
- 根目录：仓库根目录
- Node版本：22
- 构建命令：npm run build:cloud
- 部署命令：npx wrangler deploy（Cloudflare构建服务内运行）
- 构建secret：GOOGLE_MAPS_API_KEY，使用已有受限制的浏览器端Map Tiles API Key
- 普通构建变量：GOOGLE_MAPS_LANGUAGE=zh-TW、GOOGLE_MAPS_REGION=CN

Cloudflare可为Workers Builds生成托管构建令牌。仓库推送后由Cloudflare执行发布；GitHub Actions只作验证，不再添加第二条重复生产部署链路。先完成真实推送和正式域名验证，再确认自动发布已经接通。

上述连接已经配置并验证，不需重复连接。若某个本地OAuth无法读取Builds管理API，不代表现有仓库构建失效；生产发布以仓库检查与正式网站实证为准。部署版本记录表示最后一次已验证版本，元数据提交会再触发构建，不需为了追赶每个新版本UUID反复提交。

## Dots / Codex Cloud

在Work in → Cloud创建环境，选择sanguo仓库，让Codex安装Node22和npm依赖并运行构建、数据检查。发布环境后由Dots从该环境接续。画像仍使用平台内置imagegen；此功能及授权须在新环境实际验证，不能改用付费API代替。

把用户现有画像要求交给Dots：每批最多8个pending，先读原文辨人、核性别职业及外貌，保存完整提示词，导入120×120WebP、检查后提交推送main，等待仓库构建和正式网址验证。普通批次安静，全部pending完成并上线后停止续作。

本地电脑的地图密钥、GitHub/Cloudflare登录不会随代码自动迁移；在相应云端设置中配置授权和构建secret，不上传登录缓存。根目录生成HTML和dist包含浏览器配置，已排除Git；由云端从源码重建。

用户已要求先停止本地头像定时生成，该续作现已暂停，不要自动恢复。由Dots在云端接续后，按仓库状态处理未发布批次，再继续pending人物，避免两端同时生成同一人物。
