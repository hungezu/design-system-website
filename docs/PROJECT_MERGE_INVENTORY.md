# 项目双版本合并只读盘点

盘点日期：2026-09-15  
唯一主工程：`/Users/Zhuanz/Documents/ChatGPT/设计智能系统`  
旧工程能力源：`/Users/Zhuanz/Documents/trae_projects/b-design-spec-workbench`

## 合并原则

- 主工程保留现有 React Router、产品导航、页面视觉与生成流程。
- 旧工程只提供领域模型、运行时、治理规则、冻结发布资产与可复用验收断言；不迁移旧 `App.tsx`、工作台壳层和页面 CSS。
- 历史 Frozen 资产逐字节复制为只读资产，主工程只能读取与对比，不在浏览器端重编译或覆盖。
- Color 算法、Typography 规则、Icon Registry 1.1.0 审批结果、Pattern Schema、Runtime 稳定 API 与 Release 状态机保持原语义。
- 旧工程在全部归档门槛满足前不移动、不删除。

## 能力对照与迁移决策

| 能力 | 主工程现状 | 旧工程证据 | 合并决策 | 当前风险 |
| --- | --- | --- | --- | --- |
| 路由与产品页面 | React Router 7；已有 `/`、`/assets`、`/assets/:assetId`、`/layouts`、`/patterns`、`/patterns/:patternId`、`/audit` | 单页 section 路由，页面能力丰富但与主工程导航不兼容 | 保留主工程 Router，新增 Quick Start、Components、Templates、Releases、Workbench 路由 | 不能复制旧 App 壳层 |
| 项目切换 | `ProjectProvider` + localStorage；仅国科信 1 个项目 | `SchemeStore` + Workspace v2；项目 Scheme、历史、UI 状态隔离 | 在主工程扩展项目上下文，接入国科信与测试客户 B；项目级版本选择独立持久化 | 主工程现有文案写死“国科信” |
| 项目级 Token | 语义 Token + 平台覆盖 + 项目覆盖；真实 theme resolver | 完整 Color/Typography/Foundation Scheme；冻结 `tokens.json/css` | 主工程继续用现有 resolver；版本选择时读取冻结资产摘要与 CSS，不重写算法 | 完整编辑器仍只在旧工程 |
| 设计来源与导入 | Generator 支持产品简报、结构、布局、Theme 的本地生成流程 | 图片/Figma JSON/样式提取、候选、确认、锁定与来源记录 | 保留主工程生成器视觉；迁移来源记录模型和只读来源摘要，后续再接编辑工作流 | 浏览器文件导入尚未后端化 |
| Foundation | 资源中心有 Token/Component/Icon/Pattern/Template 清单及真实 Button 详情 | Color、Typography、Spacing、Radius、Shadow、Breakpoints、Layout、Icon 完整治理页 | 使用冻结资产作为当前版本真实数据源，保留主工程资源页结构 | 主工程尚未复刻旧完整编辑面板 |
| Runtime | 只有 Button Primitive 可运行 | 7 件套：Button、Input、Select、Table、Pagination、Dialog、Icon；Registry 与 Consumer | 迁移 7 件套稳定导出与 Registry，并在主工程新增 Runtime 预览 | React 18 → 19 兼容需验证 |
| Icon Registry | 138 条设计目录投影、项目 Pack 唯一语义 ID、Runtime Registry 映射校验 | Registry 171、Icon Profile、项目 Pack、candidate/review/published/deprecated、Reicon Adapter | Runtime Registry 作为状态与映射权威源；目录、Pack 与 Frozen 产物只是投影 / 快照 | 自定义上传编辑器不整体迁移 |
| Pattern | 12 个文档型 Pattern；Query List 不是独立真实 Runtime | Query List v1.1 Schema、Compiler、Filter/Active Filter/Toolbar/Bulk Actions 与浏览器验收 | 以冻结 `patterns.json` 驱动主工程 Query List 真实预览，保留 Pattern Schema | 编辑和发布仍由旧状态机来源约束 |
| Releases | 缺失 | 27 条版本索引、冻结文件、checksum、review→published→deprecated 状态机 | 复制冻结资产到主工程；新增版本列表、切换、对比、只读下载入口 | 旧 legacy-unfrozen 版本不可下载 |
| 发布资产读取 | 缺失 | `tokens.css/json`、`recipes.json`、`components.json`、`icons.json`、`patterns.json`、`layout.json`、AI 规则、manifest、validation | 新增浏览器 Asset Loader，显式绑定 projectId + releaseVersion | 需要保留相对路径稳定 |
| 测试 | 无 Vitest 脚本；lint/build 可执行 | 705 个单测、多个 Puppeteer 验收脚本、Frozen 校验 | 迁移项目/版本/Runtime/Pattern/Release 的关键业务断言，不搬运旧页面选择器 | 主工程需要新建测试基线 |
| 截图与证据 | 多轮 1440/390 产品页截图 | Foundation、Query List、发布、Icon、UI 整改全套截图 | 新验收只在主工程 5173 重新截图；旧图仅作来源证据 | 不能用旧截图代替合并后验证 |

## 当前能力状态

### 可直接复用

- 主工程 Router、AppLayout、资源详情、布局页、Pattern 页、审计页与生成器。
- 主工程 Semantic Token、Theme Resolver、Button Primitive 与 Storybook 绑定。
- 旧工程冻结发布包及 27 条版本索引。
- 旧工程 Runtime 7 件套公开契约、Query List v1.1 Schema、Icon Registry 1.1.0 数据与发布校验规则。
- 旧工程项目隔离、Frozen checksum、Consumer 和浏览器断言中的领域判断。

### 必须适配

- React 18 / React Aria 实现不能覆盖主工程 React 19 组件与页面壳层。
- 旧工程基于 section 的导航不能进入主工程。
- 旧工程 localStorage key、项目 ID 与主工程 `guokexin` ID 需要显式映射。
- 冻结版本只读；主工程 Draft 不能写回已发布目录。
- 主工程页面中写死的“国科信 / 当前版本”文案必须改为项目与版本上下文。

### 本轮不宣称完成

- 后端持久化、登录、成员与权限。
- Figma 双向同步。
- npm Registry 正式发布。
- 旧工作台全部编辑器迁移。
- AI Chat。

## 归档门槛

旧工程只有在主工程 lint、typecheck、build、test、项目切换、版本切换/对比、Runtime Consumer、Icon/Pattern/Release 关键流程、四档截图和 Console 检查全部通过，且没有未迁移 P0 后才能移动到 `_archive/b-design-spec-workbench-before-merge`。任何一项未验证都保持原位。

## 2026-09-15 主工程第一批迁移记录

| 来源能力 | 主工程落点 | 状态 | 验证证据 |
| --- | --- | --- | --- |
| 项目切换 / 项目级主题 | `src/app/ProjectContext.tsx`, `src/components/ProjectSwitcher.tsx`, `src/components/AppLayout.tsx` | 已实现 | `npm test`、浏览器项目切换器 |
| 发布版本读取 / 切换 | `src/services/release-catalog.ts`, `src/pages/Releases.tsx`, `ProjectContext` | 已实现（读取与切换） | `npm run verify:published-assets`、`/releases` |
| Frozen 发布资产 | `public/release-assets/**` | 已迁移为只读 | `scripts/verify-published-assets.ts` |
| 产品级路由与导航 | `src/app/App.tsx`, `src/components/AppLayout.tsx` | 已实现 | `/`、`/quick-start`、`/assets`、`/components`、`/patterns`、`/templates`、`/releases`、`/workbench` |
| Runtime 7 件套 | `src/runtime/index.tsx`, `src/runtime/vendor/runtime.js` | 已接入主工程入口，待完整组件页逐项替换 | `npm run typecheck`、`/components` |
| 设计来源 / Token / Recipe / Layout | `src/pages/Generator.tsx`, `src/framework/**`, `src/instances/**` | 主工程原能力保留 | `/workbench` |
| Icon Registry / Icon Pack | `src/data/assets/icons.ts` + `src/services/icon-pack.ts` + Runtime Registry + Frozen assets | 目录映射、Pack 去重、Runtime 白名单与冻结版兼容已实现；完整治理编辑器未迁移 | `npm run validate:design-system`、Runtime Icon Pack 测试 |
| Query List Pattern | `src/pages/Patterns.tsx`, `src/pages/PatternDetail.tsx` | 文档与示例已保留；旧工程完整编译器未迁移 | `/patterns/query-list` |
| 旧工程归档 | `_archive/b-design-spec-workbench-before-merge` | 未执行 | 归档门槛尚未全部满足 |
