# Dots云端接续与仓库发布

项目是Node.js静态历史资料浏览器。依赖安装：`npm ci`；本地或云端验证：`npm run build`、`npm run check`。不需要数据库。

## 当前状态

471人均有实际势力标签，379人新增逐条复核，72人有汉末官爵及授官者；汉廷在位标记保留至220年。陈寿评曰65卷已分离裴注核对。头像完成状态以data/portrait-plan.json为准，未发布批次以data/portrait-batch-state.json为准。不得重复生成已完成头像。

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

## Dots / Codex Cloud

在Work in → Cloud创建环境，选择sanguo仓库，让Codex安装Node22和npm依赖并运行构建、数据检查。发布环境后由Dots从该环境接续。画像仍使用平台内置imagegen；此功能及授权须在新环境实际验证，不能改用付费API代替。

把用户现有画像要求交给Dots：每批最多8个pending，先读原文辨人、核性别职业及外貌，保存完整提示词，导入120×120WebP、检查后提交推送main，等待仓库构建和正式网址验证。普通批次安静，全部pending完成并上线后停止续作。

本地电脑的地图密钥、GitHub/Cloudflare登录不会随代码自动迁移；在相应云端设置中配置授权和构建secret，不上传登录缓存。根目录生成HTML和dist包含浏览器配置，已排除Git；由云端从源码重建。

用户已要求先停止本地头像定时生成，该续作现已暂停，不要自动恢复。由Dots在云端接续后，按仓库状态处理未发布批次，再继续pending人物，避免两端同时生成同一人物。
