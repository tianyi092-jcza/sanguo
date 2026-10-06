# 开发与维护手册

本手册说明项目的结构、数据来源、验证方式和发布路径。面向后续维护者；页面内容的史料规则见 [README.md](README.md)，逐人复核流程见 [PERSON_SECOND_REVIEW.md](PERSON_SECOND_REVIEW.md)。

## 项目概览

这是一个以《三国志》及裴松之注为中心的静态历史资料浏览器。运行时使用预生成的 JSON、HTML、JavaScript、CSS 和 WebP 素材，没有应用服务器或数据库。用户在地图、人物流年和郡县表之间浏览；生卒、任职、战事、地理和评语分别保留来源与可信等级。

Node.js 项目使用 ES modules。生产站点由 Cloudflare Workers Builds 从 GitHub 的 `main` 分支构建。代码中保留现有 Worker、域名和卫星地图配置；发布约定见 [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md)。

## 快速开始

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run check
```

构建本地预览：

```sh
npx wrangler dev
```

预览仅用于本机检查。生产发布必须由仓库连接的 Cloudflare Workers Builds 执行；不要在本地运行 `wrangler deploy`。

| 命令 | 用途 |
| --- | --- |
| `npm run build` | 生成可部署的 `dist/`、独立 HTML 和忽略跟踪的派生数据 |
| `npm run check` | 校验数据、来源定位、史料语料、人物关系、评曰、头像尺寸及运行时代码 |
| `npm run review:progress` | 汇总人物二次复核状态；pilot 仍计入未完成 |
| `node scripts/review-candidates.mjs <人物ID>` | 列出姓名字面命中候选；输出不是核验结论 |
| `npm run build:cloud` | 供 Cloudflare 构建环境运行；先验证原 Worker、账号、域名和地图密钥，再构建并检查 |

## 代码与数据结构

| 路径 | 责任 |
| --- | --- |
| `src/legacy.html` | 地图和原页面的构建外壳 |
| `src/timeline.html`, `src/timeline.js`, `src/timeline.css` | 人物流年视图、筛选、虚拟滚动和样式 |
| `src/history-ui.js` | 人物资料、来源摘录、官爵、关系和评曰弹窗 |
| `src/calendar.js` | 年号、纪年换算及日历显示 |
| `src/google-satellite.js`, `src/google-satellite.css` | Google Map Tiles 卫星底图 |
| `data/original.json` | 人物与原始网站数据基线 |
| `data/curation*.json` | 人物事实、年代、简介、原文锚点及校订 |
| `data/factions.json` | 势力名称和色彩 |
| `data/affiliation-review.json` | 已核统属与人物间关系 |
| `data/affiliation-metadata.json` | 合作、家族、客居等关系与汉末官爵 |
| `data/appraisal-rules.json`, `data/appraisal-sources/` | 陈寿评曰的来源、分段及人物对应 |
| `data/person-second-review.json`, `PERSON_SECOND_REVIEW.md` | 逐人二次复核状态、证据、异说和未解事项 |
| `data/sources/`, `data/source-corpus-manifest.json` | 原文缓存、底本信息和内容校验值 |
| `assets/portraits/`, `data/portrait-plan.json` | 头像素材和生成/导入状态 |
| `scripts/history.mjs`, `scripts/build.mjs` | 把数据与源文件转换为应用模型和构建产物 |
| `scripts/check.mjs`, `scripts/check-source-corpus.mjs` | 项目和语料校验 |

`dist/`、`output/`、`data/history.json` 和根目录的独立 HTML 是构建产物，均由构建重新生成并列入忽略规则。应编辑输入数据和 `src/` 源码，不手改这些产物。

## 史料语料

完整本地语料由 `data/source-corpus-manifest.json` 管理：

| 语料 | 卷数/记录 | 文件前缀 |
| --- | ---: | --- |
| 《三国志》及裴松之注 | 65 | `a04-` |
| 《后汉书》 | 120 | `a03-` |
| 《华阳国志》序及卷一至十二 | 13 | `a06-` |
| 《晋书》 | 130 | `a05-` |

文件编号含底本卷次，记录保存正文段落、来源标题和哈希。清单中的缓存文件哈希会先把 CRLF 统一为 LF，避免 Windows 与 Linux 的换行转换造成误报；原始史料正文及其原字形不做改写。部分《后汉书》卷有拆分文件或不同电子文本版本；不能把重复版本计作不同史料。华阳底本是四部丛刊无标点页块，引用保留页块原字形，不补标点或改写。构建检查清单中的卷目、原文哈希和来源记录；不得重复下载已缓存文本来覆盖底本。

原文命中仅用于定位候选。每条史料结论还要核传主、卷次、正文或注文层级、上下文和异说。特别注意附传省姓、异体字、同名人物、书中引用的早期著作，以及后世作者的论赞。

## 主要数据工作流

### 人物历史与时间线

`scripts/history.mjs` 组合基础人物、考据、官爵、关系和事件数据。时间线事件由本纪编年索引生成，避免把注文、无日期追叙或后世评语误作当年事件。修改统属、区间或年代后运行构建和检查，确保首领的证据区间覆盖已核部下的任职时段；不能为填满时间线而推造起讫。

### 陈寿评曰

`scripts/appraisals.mjs` 根据65卷卷末底本和 `data/appraisal-rules.json` 提取评曰，明确区分陈寿正文与裴注，校验分段锚点、人物归属和全文覆盖。应在对应原卷中核对标点前后的原句，不从旧人物简介拷贝评论。

### 人物二次复核

每次处理一人，先读其本人传、本纪、相关他传和裴注，再检索四种指定著作的适用卷次。来源缺失要记录具体卷次，不能写成“史书无载”。按 `PERSON_SECOND_REVIEW.md` 保存出处、正文/注文层级、段落、定位词、证据 ID、明载/推定/未知、同名排除和异说。只有所有适用来源与身份都核对完成才能改为 `complete`；`pilot` 仍属未完成。

当前复核任务暂停，进度记录在 `data/person-second-review.json`；恢复任务须由用户明确要求。不要因暂停而把 pilot 改为 complete。

### 头像

头像作为艺术示意，不是传世肖像。只读取 `data/portrait-plan.json` 中实际的 `pending` 项，使用内置 imagegen 逐人生成，保留完整提示词并由 `scripts/import-portraits.mjs` 导入120×120 WebP。已经生成的条目不能覆盖。当前头像自动任务已暂停且没有 pending；不要自行恢复。

## 验证说明

`npm run build` 检查原文锚点并生成应用；`npm run check` 校验来源覆盖、内容哈希、时间范围、评曰、关系、官爵、人物案例及头像尺寸。编辑可追溯数据后至少运行这两项。若二次复核数据也有修改，再运行 `npm run review:progress` 记录进度。

浏览器验收可运行本地预览并检查人物弹窗、来源展开、时间线和地图；Google 卫星底图的生产权限只能在配置域名验证。不要把地图密钥、OAuth 缓存或本地登录凭据加入仓库。

## Git 与发布

生产配置记录在 `deployment.json` 和 `wrangler.jsonc`。当前 Cloudflare Workers Builds 连接 `main`，构建命令为 `npm run build:cloud`，部署命令 `npx wrangler deploy` 只在 Cloudflare 构建容器中运行。GitHub Actions 运行 `npm run build` 和 `npm run check`，仅做验证，不另建生产发布链路。

`GOOGLE_MAPS_API_KEY` 是 Cloudflare 构建 secret。缺少它时云构建应失败，避免发布后破坏现有卫星地图；密钥不进 Git。向 `main` 推送会自动触发生产构建，所以提交和推送就是实际发布操作。推送前核对变更、通过本地检查并确认包含的文件都应进入仓库。任何人都不得从本地直接运行生产部署。

## 相关文档

- [README.md](README.md)：项目介绍、快速开始和当前状态
- [PERSON_SECOND_REVIEW.md](PERSON_SECOND_REVIEW.md)：史料逐人复核方法
- [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md)：Cloudflare 仓库发布连接
- [DOTS_START.md](DOTS_START.md)：历史云端交接记录；当前操作状态以本手册和状态文件为准
