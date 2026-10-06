# 三国志：疆域与人物流年

以《三国志》及裴松之注为中心的静态历史资料浏览器。界面使用繁体中文，搜索兼容简体、繁体。时间轴限定为史书纪年184—280年，人物以目前已核资料的首次可考活动排序。

## 文档入口

- [开发与维护手册](DEVELOPMENT.md)：项目结构、数据流程、验证及部署
- [人物二次复核方法](PERSON_SECOND_REVIEW.md)：逐人史料核查规范
- [Cloudflare 仓库发布交接](CLOUD_HANDOFF.md)：生产构建与地图配置
- [Dots 历史交接记录](DOTS_START.md)：已归档的旧交接说明

## 当前维护状态

截至 2026-10-06，逐人复核完成 1/471（张邈）；曹操仍为 `pilot`，其余 469 人未开始。用户已暂停二次复核定时任务；头像任务也处于暂停状态，`data/portrait-batch-state.json` 显示 `pending=0`，Dots 云端续作已停止。恢复任何自动任务须等用户明确要求。

## 本地构建

需要 Node.js 22 或更新版本。

```sh
npm ci
npm run build
npm run check
```

构建结果在 `dist/`。同时生成根目录的 `三国志_郡国疆域与人物年表.html`，它可直接打开；需要与 `assets/portraits/` 一起保留以显示头像。

本地预览可以运行 `npx wrangler dev`。浏览器验收脚本为 `scripts/browser-smoke.js`，通过 Playwright CLI 的 `run-code` 执行；它默认访问 `http://127.0.0.1:4173/`。

## Cloudflare 部署

纯静态网站，没有用户账户或在线编辑需求，因此使用 JSON 文件和静态资源，无需 D1、KV 或服务端数据库。

- **当前发布方式：GitHub推送触发Cloudflare Workers Builds。** 使用现有 `sanguo-chronicle` Worker、账号和 `sanguo.720108.xyz` 域名；不再从本地项目直接部署。
- 在Worker的Settings → Builds中连接 `sanguo` 仓库的 `main` 分支，根目录为仓库根目录。
- Node.js 22；构建命令 `npm run build:cloud`；部署命令 `npx wrangler deploy` **只由Cloudflare构建服务执行**。
- 构建secret `GOOGLE_MAPS_API_KEY` 沿用已有地图Key。构建语言／区域为 `zh-TW` / `CN`。缺少地图secret会阻止云端发布，避免清空已启用的卫星功能。
- `.github/workflows/verify.yml` 在推送和PR时验证构建与数据；生产发布由Cloudflare仓库连接负责。
- 配置完成后以一次真实 `main` 推送验证自动构建、正式域名和新画像，再标记发布完成。云端接续详见 [CLOUD_HANDOFF.md](CLOUD_HANDOFF.md)。

`dist` 只包含网页和浏览资源，不包含原始备份、工具脚本或完整史料缓存。JS、CSS、头像使用内容指纹文件名，`_headers` 为这些资源配置长期缓存。

## 启用 Google 卫星底图

使用 Google 官方 **Map Tiles API → 2D Map Tiles**。只请求 `mapType: "satellite"`，不添加 `layerRoadmap`、交通、现代城市名称或行政区划标注。照片本身呈现现代地貌，网页原有的古代郡国、城池和关隘点位独立叠加。[卫星图块说明](https://developers.google.com/maps/documentation/tile/satellite)

Key 填在项目根目录的 **`maps.config.local.json` → `googleMapsApiKey`**。文件已列入 `.gitignore`；不要发到聊天。若文件已经存在，直接编辑，勿用示例覆盖已有 Key。首次配置才执行：

```powershell
Copy-Item maps.config.example.json maps.config.local.json
```

```json
{
  "googleMapsApiKey": "填写已有的Key",
  "googleMapsLanguage": "zh-TW",
  "googleMapsRegion": "CN"
}
```

也可通过构建环境变量 `GOOGLE_MAPS_API_KEY`、`GOOGLE_MAPS_LANGUAGE`、`GOOGLE_MAPS_REGION` 提供配置；环境变量优先。Key 会进入浏览器资源，应使用专用且受限制的 Key，不使用服务端密钥。应用不会输出 Key 到构建日志。

Google Cloud 项目需要启用 **Map Tiles API**；API restrictions 可限制为该 API。本接入不使用 Maps JavaScript API，也不需要地图 ID、D1 或 KV。保留已有的应用限制。当前 Key 指定的网站是 `https://sanguo.720108.xyz`，地址不能带末尾中文句号 `。`；真实权限验收应在这个生产域名进行，本地使用模拟接口。如果需要本地真实预览，应由 Key 所有者明确添加对应来源，不能靠伪造 Referer 或取消限制绕过鉴权。[官方配置](https://developers.google.com/maps/documentation/tile/get-api-key)、[限制说明](https://developers.google.com/maps/api-security-best-practices)

执行 `npm run build`、`npm run check` 后，提交并推送仓库，由Cloudflare仓库构建向现有 `sanguo-chronicle` Worker 发布，在“疆域地图”选择“Google 卫星”。确认真实影像、点位、拖拽缩放与底部署名均正常。未提供 Key 时，本地预览选项为未启用状态；云端生产构建会要求地图secret。

实现先通过 `createSession` 获取会话，依据服务返回的到期时间复用；拖拽停止后更新 viewport 信息并显示完整版权文字，再获取当前可见的二维图块。图块不批量预取、不写入本地或服务端缓存，HTTP 缓存由浏览器遵循响应头处理。[会话说明](https://developers.google.com/maps/documentation/tile/session_tokens)、[视口与覆盖范围](https://developers.google.com/maps/documentation/tile/2d-tiles-overview)、[署名要求](https://developers.google.com/maps/documentation/tile/policies)

Google 影像按 WGS-84 / Web Mercator 定位，不叠加高德的 GCJ-02 偏移。加载失败、无覆盖或鉴权失败时会显示提示，可重试或切回高德；不会自动放宽 Key 限制。调用费用和额度由自己的 Google Cloud 项目管理。

`scripts/google-map-smoke.js` 通过 Playwright CLI 的 `run-code` 执行，默认访问 `http://127.0.0.1:4173/`。它拦截 Google 请求并返回测试会话、视口和图块，覆盖纯卫星参数、会话复用与过期、署名、WGS-84、缩放拖拽、切换竞态、失败恢复和移动端布局，不使用真实 Key 发起测试请求。

## 数据与代码

| 路径 | 用途 |
| --- | --- |
| `backups/original.html` | 改动前的原始网页备份 |
| 原有 CSV | 原始配套数据保留；不作为网页的实时数据接口 |
| `data/original.json` | 从原网页提取的数据基线 |
| `data/curation.json`、`data/curation-extra.json`、`data/curation-research.json` | 人物统属、年代、事实考据、概述和原文定位依据；research 中的校订优先 |
| `data/factions.json` | 势力名称和配色 |
| `data/affiliation-review.json` | 379人逐条复核的实际统属、原文锚点与同名辨析；补充既有92人的考据 |
| `data/affiliation-metadata.json` | 家族、召医、合作等关系，以及与实际势力分列的汉末官爵和授官者 |
| `data/person-second-review.json`、`PERSON_SECOND_REVIEW.md` | 逐人二次复核进度、五类史料原文定位、交叉判断与未解问题；试核不等于全员完成 |
| `data/sources/` | 史书电子文本缓存，含 URL、读取日期和摘要哈希 |
| `data/source-corpus-manifest.json` | 四书语料的卷目覆盖、底本、来源与缓存校验值 |
| `data/history.json` | 构建生成的可追溯史料模型 |
| `data/portrait-plan.json` | 头像名单、性别、参考史料、生成状态和最终提示词 |
| `data/appraisal-sources/`、`data/appraisal-rules.json` | 《三国志》65卷的陈寿评曰正文、裴注分离证据与人物分段对应规则 |
| `assets/portraits/` | 内置 imagegen 生成并按要求缩为120×120的头像 |
| `src/legacy.html` | 地图、检索、郡县表等原有功能的构建模板 |
| `src/timeline.*` | 时间轴结构、样式和虚拟滚动逻辑 |
| `src/history-ui.js` | 人物、统属证据与事件弹窗 |
| `src/google-satellite.js`、`src/google-satellite.css` | Google 卫星底图、坐标处理及加载状态 |
| `maps.config.example.json`、`scripts/map-config.mjs` | Google 浏览器端 Key 的配置示例与构建读取 |

四书完整语料已缓存在 `data/sources/`，卷目、版本、网址和哈希登记于 `data/source-corpus-manifest.json`。`npm run check` 会核对所有卷目、来源元数据及缓存校验值。只有清单明确显示缺卷时才使用 `python scripts/fetch-complete-corpus.py` 或 `python scripts/fetch-ahcb-corpora.py` 补齐；不要为刷新而重下或覆盖既有底本。原文缓存不放入运行时模型上下文。引用仍须逐人确认底本、正文／注文层级、同名和上下文；字面命中不等于史实结论。

## 史料处理规则

1. `precision` 区分 `exact`、`inferred`、`unknown`，每段必须有可在缓存文本找到的原文定位词。引用存在检查不等同完整历史校勘。
2. 统属条表示实际任职、追随关系；朝代建立之前不会提前显示相应皇朝。失载、未任职、被俘、投效分别处理。
3. 起讫不详的边界用虚线和明确说明。图上示意边界不能当作准确任职年。
4. `chronicle-index.mjs` 只从本纪正文的段首年份索引记载，排除裴注、无日期段落和明显回顾性记载。自动索引仅画灰色事件点，不据此推断势力或连续任职。
5. 未逐字核对的旧传记概述、相貌、评论和裴注不作为已核史料展示。原始内容保存在备份。
6. 头像是艺术示意，不是传世肖像。个性头像制作中与资料不足的匿名轮廓分开标示。说明在图下，不覆盖图面。
7. 出生、死亡、统属与任职起讫分项判断。生卒不全不能抹掉已知的势力和活动区间。朝廷、政权、地方势力、军队集团分档；孔融、鲍信等自领部众者不因有汉官号就合并为朝廷。
8. `facts` 中保存史书纪月日、引用及明载/推定等级。农历岁末与公历年份可能跨年，保留原年号、月份与干支，不能机械相减造出生卒。
9. 同时检读《后汉书》《晋书》及裴注引《魏书》《魏略》等。宗室或附传省姓的条目，按卷次及字匹配（如陈思王植、兴字安国），不因全名不出现而判为史料不足。
10. 人物弹窗的“陈寿评曰”从65卷卷末原文提取，不沿用旧表中的评论字段。来源版式中的裴注独立分离；个人评论按对象摘录，共同评论分别收入相关人物。非连续摘录以“……”标示，并可展开本卷评曰全文。后妃、宗室等制度性总评标为“本卷合传总评”；原文未直接评及的人物明确说明，不套用父祖或同传他人的评论。构建时核对每个分段锚点、全部卷末文字覆盖、姓名同名辨析及来源，`npm run check` 同时验证用户指定的曹操和关张马黄赵示例。
11. `affiliations` 是有依据的实际统属或明确标注的家族、客居、召医、合作等关系，独立于 `segments` 的年代边界。471人均可查看标签，缺生卒或任职起讫者仍参与势力筛选。379人的新增复核逐条保留来源段落与定位词，修正普通词语、异体字和同名误配。汉末官爵保存为 `hanOffices`，注明授官者；汉中王刘备任马超为左将军，不误作前将军或汉献帝诏封。追祀、追封等回顾记载不生成生前活动点。

当前版本为可用预览，部分人物仍只有年代点位或待考条目，不能称为全员履历已完成校勘。请查看页面凡例与 `output/data-audit.json` 获取当次构建的覆盖情况。

## 人物資料二次復核

先读 [PERSON_SECOND_REVIEW.md](PERSON_SECOND_REVIEW.md)，再执行 `npm run review:progress` 查看进度。`node scripts/review-candidates.mjs <人物ID>` 只列字面候选，不能代替同名辨析和原文核对。结论须在适用卷次核对后，连同正文/裴注层级、段落定位、明载或推定等级和异说一并保存。张邈是首个已完成样例；其本人势力与曹操、吕布合作分开，生年不详而卒于兴平二年。pilot 仍属未完成。

## 头像维护（当前暂停）

头像计划保存在 `data/portrait-plan.json`，批次状态保存在 `data/portrait-batch-state.json`。现有头像已经上线；当前没有 pending 项。头像自动任务已暂停，Dots 云端续作已停止。

若用户明确恢复头像制作，再逐人核对史料、性别、职业和外貌，只处理 pending，每批最多8人。使用内置 imagegen 保存完整提示词，以 `scripts/import-portraits.mjs` 导入120×120 WebP，随后运行构建和检查。不得覆盖已完成头像。生产发布由 GitHub 推送触发 Cloudflare Workers Builds；禁止本地直接运行 `wrangler deploy`。
