# 国科信项目组件矩阵

> 由 `scripts/generate-component-matrix.ts` 从 `system.manifest.json`、Runtime Registry 和 ComponentAsset 自动生成，请勿手工维护清单。

| 组件 | ID | Runtime | Token 数 | 状态 | React | Storybook | Figma |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| 按钮 | `button` | `DSButton` | 49 | default / hover / active / disabled / loading | 已绑定 | 已绑定 | 待补充 |
| 输入框 | `input` | `DSInput` | 4 | focus / error | 已绑定 | 已绑定 | 待补充 |
| 选择器 | `select` | `DSSelect` | 4 | open | 已绑定 | 已绑定 | 待补充 |
| 表格 | `table` | `DSTable` | 8 | default / loading / empty | 已绑定 | 已绑定 | 待补充 |
| 分页 | `pagination` | `DSPagination` | 4 | default / active / disabled | 已绑定 | 已绑定 | 待补充 |
| 对话框 | `dialog` | `DSDialog` | 3 | default / open | 已绑定 | 已绑定 | 待补充 |
| 抽屉 | `drawer` | `DSDrawer` | 3 | default / open | 已绑定 | 已绑定 | 待补充 |
| 标签页 | `tabs` | `DSTabs` | 3 | selected | 已绑定 | 已绑定 | 待补充 |
| 标签 | `tag` | `DSTag` | 3 | default / disabled | 已绑定 | 已绑定 | 待补充 |
| 徽标 | `badge` | `DSBadge` | 6 | default / success / warning / error | 已绑定 | 已绑定 | 待补充 |
| 轻提示 | `toast` | `DSToast` | 3 | info / success / error | 已绑定 | 已绑定 | 待补充 |
| 表单 | `form` | `DSForm` | 4 | default / loading / error / success | 已绑定 | 已绑定 | 待补充 |
| 表单字段 | `field` | `DSField` | 5 | default / focus / error | 已绑定 | 已绑定 | 待补充 |
| 上传 | `upload` | `DSUpload` | 4 | default / loading / error | 已绑定 | 已绑定 | 待补充 |
| 空状态 | `empty` | `DSEmpty` | 3 | empty | 已绑定 | 已绑定 | 待补充 |
| 加载状态 | `loading` | `DSLoading` | 3 | loading | 已绑定 | 已绑定 | 待补充 |
| 警告提示 | `alert` | `DSAlert` | 5 | info / success / warning / error | 已绑定 | 已绑定 | 待补充 |
| 复选框 | `checkbox` | `DSCheckbox` | 4 | default / checked / indeterminate / disabled | 已绑定 | 已绑定 | 待补充 |
| 单选框 | `radio` | `DSRadio` | 3 | default / checked / disabled | 已绑定 | 已绑定 | 待补充 |
| 开关 | `switch` | `DSSwitch` | 4 | default / checked / disabled | 已绑定 | 已绑定 | 待补充 |
| 执行过程 | `chain-of-thought` | `DSChainOfThought` | 9 | default / open / loading / error | 已绑定 | 已绑定 | 待补充 |
| 聊天附件 | `chat-attachment` | `DSChatAttachment` | 9 | default / loading / error / disabled | 已绑定 | 已绑定 | 待补充 |
| 对话容器 | `chat-conversation` | `DSChatConversation` | 11 | default / loading / empty | 已绑定 | 已绑定 | 待补充 |
| 会话列表 | `chat-list-view` | `DSChatListView` | 9 | default / selected / disabled / empty | 已绑定 | 已绑定 | 待补充 |
| 聊天加载 | `chat-loader` | `DSChatLoader` | 9 | loading | 已绑定 | 已绑定 | 待补充 |
| 聊天消息 | `chat-message` | `DSChatMessage` | 11 | default / loading / error | 已绑定 | 已绑定 | 待补充 |
| 消息操作 | `chat-message-actions` | `DSChatMessageActions` | 9 | default / selected / disabled | 已绑定 | 已绑定 | 待补充 |
| 引用来源 | `chat-source` | `DSChatSource` | 9 | default / open | 已绑定 | 已绑定 | 待补充 |
| 工具调用 | `chat-tool` | `DSChatTool` | 13 | default / open / loading / error | 已绑定 | 已绑定 | 待补充 |
| 代码块 | `code-block` | `DSCodeBlock` | 13 | default | 已绑定 | 已绑定 | 待补充 |
| Markdown 内容 | `markdown` | `DSMarkdown` | 13 | default / loading | 已绑定 | 已绑定 | 待补充 |
| 提示输入 | `prompt-input` | `DSPromptInput` | 9 | default / loading / error / disabled | 已绑定 | 已绑定 | 待补充 |
| 建议问题 | `prompt-suggestion` | `DSPromptSuggestion` | 9 | default / disabled | 已绑定 | 已绑定 | 待补充 |
| 生成状态文字 | `text-shimmer` | `DSTextShimmer` | 9 | default / loading | 已绑定 | 已绑定 | 待补充 |

## 准入规则

- React Binding、Token 与状态契约必须完整，才能进入项目草稿组件目录。
- Frozen 版本只展示其 `manifest.availableComponents` 中已包含的组件。
- Storybook 和 Figma 状态必须如实呈现；未绑定不得宣称同步完成。
