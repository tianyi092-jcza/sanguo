# 给Dots的接续任务

请在你的云端电脑继续这个三国历史资料浏览器项目，让开发能在用户电脑关机后继续。目标仓库是 https://github.com/tianyi092-jcza/sanguo ，网站 https://sanguo.720108.xyz/ ，现有Cloudflare Worker为sanguo-chronicle。保留账号和域名，不新建替代网站。

若仓库还只有初始许可证，请使用用户提供的sanguo-cloud-source.zip：先克隆仓库，再把源码包内容解压合入工作目录。读AGENTS.md、CLOUD_HANDOFF.md、README.md、deployment.json、data/portrait-plan.json和data/portrait-batch-state.json，安装Node22和npm依赖，执行npm run build、npm run check。

本地头像定时生成已经按用户要求暂停，不要恢复。现有169张个性头像和3份匿名轮廓素材，121个pending。本批20261005-2007的8张已经生成并通过本地检查，但尚未发布；先把这批通过仓库构建发布并验证，再继续后续人物，不要重复生图。

另有181人未进入早期自动候选名单，头像适用性尚未逐人复核。未列入名单不等于史料不足；根据现有已核原文评估，身份、性别和职业资料充分者可补入pending，确实不足者才记录具体原因，不把原算法漏选当匿名化理由。

开发和画像完成后只提交推送仓库，由Cloudflare Workers Builds从main构建发布，禁止从本地或云端临时工作目录绕过仓库直接部署。Cloudflare构建命令npm run build:cloud、部署命令npx wrangler deploy；已有地图Key通过构建secret GOOGLE_MAPS_API_KEY配置，不提交到GitHub。

当前外部权限待办：GitHub CLI和插件对新仓库写入都返回403，需用户授权该仓库的Contents读写及Workflows写权限；Cloudflare现有登录能管理Worker，但Builds管理接口403，需在Worker的Settings → Builds连接仓库。不要将这些尚未完成的连接说成已接通，也不要要求用户把令牌贴到聊天。

后续画像严格按史书辨人、核性别职业和外貌，每批最多8个pending，内置imagegen逐人原创像素头像，保存完整提示词、导入120×120WebP并检查。没有外貌明载时是普通比例艺术示意；资料确实不足才记录原因并匿名化，不用演义或亲属资料补造。普通批次保持安静，全部pending完成并经正式网站验证后停止云端续作。
