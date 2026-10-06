# 三国项目执行约定

本项目以《三国志》及裴松之注为中心，保留可追溯原文。入手先读 README.md、DEVELOPMENT.md、deployment.json、data/portrait-plan.json、data/portrait-batch-state.json 和本项涉及的 data/sources 原文。人物逐人复核另遵循 PERSON_SECOND_REVIEW.md。

## 史料和画像

- 不将演义、未经复核的原表概述、亲属或同名人物资料当作本人史实。
- 统属、汉末官爵与授官者分列；缺少生卒和任职起讫不抹去已核归属。
- 每批只处理 pending，最多8人。只用内置 imagegen，逐人生成，不替换已完成条目，不用另行付费 API。
- 参考 assets/references/portrait-style-1.png 和 portrait-style-2.png 的复古像素风格。五官未载时采用普通比例艺术示意，说明图片下显示，图片内无文字或水印。
- 保存完整最终提示词，用 scripts/import-portraits.mjs --file <JSON文件> 导入实际120×120 WebP。资料确实不足才标 insufficient 并记录具体原因，不能将资料丰富者匿名化省事。
- 执行 npm run build、npm run check，并核对本批身份、尺寸、加载、出处和说明。不反复重测未变化功能。

## Git与发布

- 用户要求改由 GitHub 仓库推送触发云端构建发布，禁止从本地项目直接执行 wrangler deploy。
- 保留现有 sanguo-chronicle Worker、Cloudflare账号和 sanguo.720108.xyz 域名。
- Cloudflare Workers Builds连接main分支；构建命令npm run build:cloud；部署命令npx wrangler deploy只在Cloudflare构建环境运行。
- 密钥和本地登录凭据不提交。地图密钥通过云端构建secret GOOGLE_MAPS_API_KEY配置，不能在接续时清空已经启用的卫星功能。
- 提交代码和素材后推送main，等待云端构建成功，验证正式网址上的新画像后再将发布状态记为verified。
- 上一批已经生成而尚未验证发布时，先完成该批发布，不再开启新批或重复生图。
- 截至2026-10-06，原有121张头像已完成并验证上线，Dots云端续作已停止；头像计划无pending，本地头像自动任务为PAUSED。181名旧候选名单外人物另有逐人适用性复核，不应因旧名单遗漏直接补头像。二次资料复核是独立工作，张邈complete、曹操pilot、469人未开始；用户已要求暂停其定时任务。状态见data/portrait-batch-state.json、data/portrait-plan.json及data/person-second-review.json。不要自动恢复任一暂停任务。
- 向GitHub main推送会触发生产发布。只有用户明确要求推送时才提交推送；推送前先检查变更和测试结果。当前已有的发布授权只适用于当前请求明确包含的文件。
- 普通自动批次保持安静；仅在全部完成、失败或需要用户操作时报告。全部pending处理并验证上线后停止“补齐三国人物头像”续作。

## 开发文档

- README.md：项目概览、快速开始和当前状态。
- DEVELOPMENT.md：应用结构、数据文件、构建检查、史料语料和工作流。
- PERSON_SECOND_REVIEW.md：逐人史料复核方法。
- CLOUD_HANDOFF.md：现有Cloudflare Workers Builds生产发布约定。
- DOTS_START.md：已归档的历史云端交接记录，不作为当前运行指令。

## 索引

如果环境提供CodeGraph，结构问题优先使用codegraph_context、codegraph_trace和codegraph_explore；字面史文仍直接读取已定位文件。留意索引过期提示，不重复验证新鲜AST结果。
