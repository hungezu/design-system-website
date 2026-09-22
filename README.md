# 设计规范管理平台

在线公开演示：https://hungezu.github.io/design-system-website/

公开演示不需要登录，保留组件、交互模式、页面模板和项目视觉预览；账号、成员权限、发布和服务端写入仅在本地完整工作区中启用。

React / React Aria / TypeScript / Vite + Node 24 / SQLite 设计规范协作工作区。

```sh
npm install
npm run dev
```

默认入口：`http://127.0.0.1:5173`。`npm run dev` 同时启动前端和 API。首次访问使用 `.workspace/setup-token.txt` 中的一次性初始化码，自行创建管理员账号。账号、成员、主题和新版本保存在服务器 SQLite 中。

[账号、权限、旧数据与部署说明](docs/ACCESS-AND-DEPLOYMENT.md)

[将项目规范交给 AI：文件选择、使用方式与验证](docs/AI-DESIGN-MD.md)。已就绪项目版本提供“下载 AI 设计规范”；新组件包内包含同一份 DESIGN.md。可运行 `npm run verify:design-md` 做独立消费验证。

## 验证与交付

```sh
npm test
npm run test:access
npm run typecheck:server
npm run build
npm run lint
npm run storybook:build
npm run delivery:build
```

- [执行计划与任务状态](docs/PROJECT-PLAN.md)
- [本地候选交付与独立消费](docs/LOCAL-STABLE.md)
- [核心 20 项验收映射](docs/acceptance/local-stable/CORE-COMPONENTS.md)
- [最终验收记录](docs/acceptance/local-stable/FINAL-RECHECK.md)
- [项目组件包生成与前端接入](docs/PROJECT-DELIVERY-IMPLEMENTATION.md)
- [外部扩展接入状态](docs/EXTERNAL-INTEGRATIONS.md)

`consumer/` 是独立 npm 项目，使用 `artifacts/local-stable` 生成的 tarball；它不引用管理站源码。安装后 `npm run build` 同时检查类型并生成可部署的静态消费侧页面。

历史 `public/release-assets` 保持不可变。工作区已接入真实会话和项目权限；本地候选包仍不等同于线上发布。本轮未接入公司 SSO、邮件投递或部署公网网站。
