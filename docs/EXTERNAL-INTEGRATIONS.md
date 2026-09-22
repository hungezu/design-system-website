# 外部扩展接入状态

当前代码契约稳定前的基础准备已落地，实际外部目标尚未提供，不能标成“Figma 已同步”“多人协作已上线”或“AI 服务已接入”。

## Figma / Code Connect

`artifacts/external-handoff/figma-handoff.json` 包含当前国科信语义变量、可转换的 RGB 值、核心 20 项实现、状态与绑定，以及运行时标识。`targetFileKey`、`figmaNodeId` 为 null，Code Connect 状态为 unbound。

下一步需要目标 Figma 文件或团队及库使用权限。先验证 Button/Input/Select 一族的变量、Variant、状态和代码映射，核对通过后扩展核心 20 项。此文件不是已写入的 Figma 库。

## 多人协作

当前站点已通过 `server/workspace.ts` 与 `src/services/workspace-api.ts` 接入 Node / SQLite 工作区：真实账号会话、平台用户管理、项目成员角色、审计记录、共享主题和版本，以及修订冲突保护均由服务端处理。原 `workspace-repository.ts` 保留为未来外部存储适配契约，不是当前运行路径。

本机功能已实现；远端部署仍需服务器、域名与 HTTPS 配置，尚未接入公司 SSO 或邮件网关。启动、初始化、权限矩阵和备份见 [账号与部署说明](ACCESS-AND-DEPLOYMENT.md)。这不表示多人协作网站已经上线。

## 规则检查与 AI

设计检查页现在执行真实的本地确定性检查：当前版本颜色对比度、输入片段的未知 Token 和 DS 组件引用，结果附规则及行号，不执行用户代码。

`src/services/external-review.ts` 提供按需调用同源/本地代理的评审适配器，有失败、取消和响应格式校验。它不会自动发送内容，不在浏览器保存密钥。目标模型、代理地址和数据范围未配置，所以当前不声称发生了 AI 推理。需要真实服务选择后再完成端到端连接、质量评价和人工复核。
