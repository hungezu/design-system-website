# 本地稳定版候选与取用

本次交付是 **带源码指纹的本地候选**（具体版本见 `artifacts/local-stable/delivery.json`），不代表正式版本发布或云端上线。

## 交付内容

- `artifacts/local-stable/local-design-system-<候选版本>.tgz`：编译后的组件、共享业务流程、样式、字体、TypeScript 声明、冻结变量、完整数据快照和第三方说明。
- `artifacts/local-stable/snapshot/`：11 个实际资产文件。包含 Token、组件 API/状态、Icon Registry 元数据、配方、模式/模板元数据、布局与主题信息、结构校验和规则。
- `artifacts/local-stable/delivery.json`：候选状态、包 SHA-256、快照完整性值及匹配的运行时 build ID。
- `consumer/`：独立 npm/Vite 项目，只安装 tarball，不引用管理站源码或浏览器存储。

## 重建与验证

在工程根目录：

```sh
npm run build
npm run storybook:build
npm run delivery:build
cd consumer
npm install
npm run build
npm run dev
```

候选包更新后，应停止旧 Consumer 服务、重新安装生成的 tarball，再重新启动开发命令（已包含 --force 以刷新预构建缓存），确认 `consumer/node_modules/@local/design-system/runtime-build.json` 与候选 `delivery.json` 一致。Consumer 页面同时核对宿主目标候选、包内执行代码与快照标识；旧代码搭配旧快照也不会误报一致。在工程根目录运行 `npm run verify:delivery` 可校验源码、归档和独立安装。

```tsx
import { PreviewScope, TemplateExample } from '@local/design-system'
import tokens from '@local/design-system/tokens.json'
import '@local/design-system/style.css'

export default function Example() {
  return <PreviewScope vars={tokens}>
    <TemplateExample templateId="template-list" variant="advanced" />
  </PreviewScope>
}
```

TypeScript 可使用 `tokens as CSSProperties`。公共包还导出正式 DS 控件、`ComponentExample` 和 `PatternExample`。详情页复制代码与预览使用相同实现、参数和已解析变量。

## 快照范围

新 `bds-release/local-2` 快照不再默默借用旧版 icons/recipes/patterns。浏览器冻结的是数据；执行代码需要匹配 build ID 的候选包。图标 JSON 记录 Registry 元数据，实际字形实现在包内。

快照内的 FNV-1a 内容标识用于检查意外损坏，不是身份签名；交付 tarball 另有 SHA-256。历史包不改写。旧版没有匹配的可执行代码归档时，只能在兼容 Runtime 中读取其历史资产，不能声称恢复了旧版全部行为。

本次候选使用国科信项目源码配置构造，不冒充用户浏览器里尚未保存的草稿。

## 备份与恢复

版本记录页导出 `design-workspace-server-backup/1` JSON，包含服务端保存的可见项目配置、主题和完整冻结快照。最大 20 MB。浏览器未保存编辑、账号、成员权限、登录会话和审计历史不在该文件范围。

导入先校验内容、快照载荷、项目关联、权限与现存版本，返回待恢复范围和当前修订号；确认时再次核验。需要每个目标项目的管理权限，新项目仅平台管理员可恢复。任一项目的修订变化、冻结标识或同号内容冲突都会拒绝整批写入。SQLite 事务覆盖配置、主题、补入版本和恢复审计；数据库中途失败会回滚。未包含的项目、既有版本和成员保留。

“旧版浏览器数据备份”单独保留原始记录供迁移诊断，不能作为服务端备份导入。旧主题可在主题编辑页载入、核对并保存。包含账号与全部审计记录的运维备份见 [账号与部署说明](./ACCESS-AND-DEPLOYMENT.md)。

## 已知限制

- 工作台使用真实 Node/SQLite 会话、项目权限和并发修订校验；独立组件消费包本身不承担业务鉴权或团队数据同步。
- 业务流程操作的是示例数据；提交失败/读取失败示例不冒充真实业务后端。
- 本地规则检查只覆盖明确列出的变量、组件引用和对比度，不是全面 WCAG、截图或业务认证。
- 字体及兼容 Runtime 带来较大包体，当前是稳定候选，尚未执行按需拆包优化。
- 外部 Figma、协作与 AI 连接状态见 [外部扩展说明](./EXTERNAL-INTEGRATIONS.md)。

项目指定版本交付及真实业务接入的后续方案见 [前端交付与接入方案](./FRONTEND-DELIVERY.md)。
