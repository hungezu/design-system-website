export const AI_COMPONENTS = [
 {id:'chain-of-thought',name:'执行过程',exportName:'DSChainOfThought',file:'Activity.tsx',description:'可折叠的任务步骤、公开摘要和执行进度。',states:['default','open','loading','error'],variants:[['default','已完成'],['collapsed','折叠'],['streaming','执行中'],['nested','嵌套步骤'],['error','失败']],required:['title','steps']},
 {id:'chat-attachment',name:'聊天附件',exportName:'DSChatAttachment',file:'Sources.tsx',description:'文件名称、体积、预览与上传状态。',states:['default','loading','error','disabled'],variants:[['default','文件'],['uploading','上传中'],['error','失败重试'],['removable','可移除'],['long','长文件名']],required:['name']},
 {id:'chat-conversation',name:'对话容器',exportName:'DSChatConversation',file:'Messages.tsx',description:'跟随最新消息，阅读历史时保持当前位置。',states:['default','loading','empty'],variants:[['default','对话记录'],['full-chat','完整聊天'],['streaming','生成中'],['empty','空会话'],['long','历史消息']],required:['children']},
 {id:'chat-list-view',name:'会话列表',exportName:'DSChatListView',file:'Messages.tsx',description:'会话选择、消息摘要与未读状态。',states:['default','selected','disabled','empty'],variants:[['default','标准'],['compact','紧凑'],['empty','空列表'],['disabled','禁用项']],required:['items','onSelect']},
 {id:'chat-loader',name:'聊天加载',exportName:'DSChatLoader',file:'Content.tsx',description:'回复生成时的圆点、脉冲、旋转与骨架占位。',states:['loading'],variants:[['default','圆点'],['pulse','脉冲'],['spinner','旋转'],['skeleton','骨架']],required:[]},
 {id:'chat-message',name:'聊天消息',exportName:'DSChatMessage',file:'Messages.tsx',description:'用户气泡、助手内容、附件、来源和异常反馈。',states:['default','loading','error'],variants:[['default','助手消息'],['user','用户消息'],['streaming','生成中'],['error','生成失败'],['stopped','已停止'],['rich','内容与来源']],required:['role','content']},
 {id:'chat-message-actions',name:'消息操作',exportName:'DSChatMessageActions',file:'Messages.tsx',description:'复制、重新生成及反馈操作，保留真实失败反馈。',states:['default','selected','disabled'],variants:[['default','完整操作'],['minimal','仅复制'],['disabled','禁用']],required:[]},
 {id:'chat-source',name:'引用来源',exportName:'DSChatSource',file:'Sources.tsx',description:'链接或文档来源，以紧凑列表或折叠组展示。',states:['default','open'],variants:[['default','网页来源'],['document','文档来源'],['grouped','折叠来源'],['long','长标题']],required:['sources']},
 {id:'chat-tool',name:'工具调用',exportName:'DSChatTool',file:'Activity.tsx',description:'工具输入、结果、运行错误和需要确认的操作。',states:['default','open','loading','error'],variants:[['default','执行结果'],['running','执行中'],['error','执行失败'],['approval','等待确认'],['rejected','已拒绝']],required:['name','state']},
 {id:'code-block',name:'代码块',exportName:'DSCodeBlock',file:'Content.tsx',description:'常用语言高亮、横向滚动与可验证的复制反馈。',states:['default'],variants:[['default','TypeScript'],['json','JSON'],['plain','纯文本'],['long','长代码']],required:['code']},
 {id:'markdown',name:'Markdown 内容',exportName:'DSMarkdown',file:'Content.tsx',description:'消息标题、列表、表格、链接和代码围栏的安全呈现。',states:['default','loading'],variants:[['default','富文本'],['table','表格'],['streaming','未完成内容'],['unsafe','原始 HTML 不执行']],required:['content']},
 {id:'prompt-input',name:'提示输入',exportName:'DSPromptInput',file:'PromptInput.tsx',description:'文本与附件输入、发送、停止、失败重试及中文输入支持。',states:['default','loading','error','disabled'],variants:[['default','标准'],['inline','行内'],['compact','紧凑'],['attachments','含附件'],['streaming','生成与停止'],['error','发送失败'],['disabled','禁用']],required:['value','onChange','onSubmit']},
 {id:'prompt-suggestion',name:'建议问题',exportName:'DSPromptSuggestion',file:'Messages.tsx',description:'供用户选择的起始问题，选择后填入输入框。',states:['default','disabled'],variants:[['default','紧凑建议'],['cards','卡片建议'],['disabled','禁用']],required:['items','onSelect']},
 {id:'text-shimmer',name:'生成状态文字',exportName:'DSTextShimmer',file:'Content.tsx',description:'短状态文字的生成动效，尊重减少动画设置。',states:['default','loading'],variants:[['default','生成中'],['inactive','静态文字']],required:['children']},
] as const
export const AI_COMPONENT_IDS:readonly string[]=AI_COMPONENTS.map(item=>item.id)
export const AI_COMPONENT_RULES = [
 'AI 组件只呈现调用方传入的内容和状态，不自行请求模型、上传文件或执行工具。',
 '消息区以内容为主：助手回复不包裹大块主题色气泡；用户消息使用中性弱背景。',
 '输入为空且无附件时禁止发送；中文输入组合期间 Enter 不提交，Shift+Enter 换行。生成中展示可用的停止入口；失败保留文本和附件。',
 '执行过程使用真实任务事件和公开摘要；加载、成功、失败、待确认不能仅靠颜色区分。',
 '工具确认按钮只发出回调；以业务处理结果决定后续状态，未经确认不自动执行。',
 'Markdown 不执行原始 HTML 或代码；来源链接仅允许安全协议；复制成功后才显示成功反馈。',
 '流式对话仅在用户接近底部时自动跟随，阅读历史时不抢滚动位置；提供回到最新消息入口。',
 '本地附件预览须释放对象 URL；组件中的文件选择不等于已上传，上传状态由真实请求驱动。',
 '控制台、公共预览和项目主题分开；使用 AI 用途变量及已有语义变量，不硬编码品牌色。',
 '键盘可展开步骤、选择建议和操作消息；减少动画偏好下停止闪动和位移。',
] as const
