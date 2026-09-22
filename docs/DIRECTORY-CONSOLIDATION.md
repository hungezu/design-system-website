# 目录去重记录

本轮按资源职责合并入口，保留主工程与原有数据。

| 重复位置 | 处理 |
| --- | --- |
| /assets 与 /components 都展示组件 | /assets 仅保留 Token 和图标；组件归 /components |
| /components 82 项规划目录 + 12 项资产列表 | 合为一个目录，对已有资产提供文档链接 |
| /templates 静态八项与 templateAssets 四项 | 从 templateAssets 读取；保留草稿状态，不伪造实现 |
| 快速开始手写 Runtime 数量/列表 | 链接到唯一组件目录，不重复维护数量 |
| runtime/index.ts 和 index.tsx 不同导出 | index.tsx 只转发 index.ts，避免绕过源码组件 |
| 旧组件和模板 /assets 链接 | 自动跳转到 /components/:id、/templates/:id，保留查询和锚点 |
| 首页固定国科信文案 | 读取当前项目 |
| 无效详情地址自动显示 Button | 显示资源不存在，避免错误归属 |

保留的差异：Button 是主工程 Primitive，DSButton 是冻结资产兼容 API，不能简单互换；两者需要在组件迁移批次中做 API/Token 适配。组件与 Pattern、模板之间的引用是组合关系，不删除。主工程静态规范 Token 与冻结版本 Token 尚未完成语义统一，本轮不覆盖历史发布资产。

本轮不代表全部组件源码已迁移或所有重复业务实现已消除。
