# 主工程组件验收

对象：/Users/Zhuanz/Documents/ChatGPT/设计智能系统。
结论：本轮不通过完整组件交付验收。完成目录/挂载/基本交互层；不能等同于全部组件生产就绪。

## 命令结果

| 检查 | 结果 | 证据 |
| --- | --- | --- |
| npm test | 12 files / 114 tests 通过 | tests.log |
| npm run typecheck | 通过 | typecheck.log |
| npm run build | 通过，chunk 体积警告 | build.log |
| npm run verify:published-assets | 27 条记录校验通过；以脚本现有检查范围为限 | assets.log |
| npm run lint | 失败：5 errors、2 warnings | lint.log |

## 浏览器实测

1. /components?component=input 成功加载分类、预览、API 和项目版本。
2. 输入“验收输入”后出现清空按钮；清空后值为空，焦点回到项目名称输入框。
3. 示例圆角从继承值调到 16，输入框呈现圆角变化。
4. /components?component=date-picker 可打开日历；选择 2026-09-17 后回填日期并关闭。
5. 日期示例圆角调至 24 时输入区改变，弹出日历仍保持原有小圆角；浮层还被拉伸为输入区域宽度，出现明显内部留白。

本次页面观察未保存为图片文件；没有宣称全部 88 项浏览器验收完成。键盘测试已有自动化覆盖仅限 tests.log 中具体测试，屏幕阅读器尚未人工验收。

## 阻塞问题

### A-01 / P1：浮层未继承预览规范
DateTime/index.tsx:11-12 的 Popover 未接收当前预览的 CSS 变量；Color/Date/ComboBox 等需统一 Portal 主题作用域。实测日期圆角 24 时弹层不同步。不能声称设计师调整一次即可适配全部组件。
修复建议：统一作用域 Provider，把解析变量显式传入 Portal；对两项目、历史版本和局部覆盖分别验证。

### A-02 / P1：新增组件未完成版本发布绑定
Components.tsx:35-48 以当前代码的 Runtime 导出存在判断可用，预览读取历史 manifest 的 Token，但没有验证该 manifest.availableComponents 是否包含该组件。历史版本显示的新组件与项目版本原有能力不能混为一谈。
修复建议：区分平台实现可用、当前版本可消费、局部实验预览；当前版本未包含的组件不得标记为该版本已支持。

### A-03 / P1：规范调整仍只作用于预览
Components.tsx:39 的圆角/主色设置是局部 CSS 覆盖；没有覆盖确认、锁定、Recipe 写入、新版本编译和独立 Consumer 对照。页面已经说明仅预览，但尚未达到完整自定义绑定交付标准。

### A-04 / P1：全部自有源码迁移尚未完成
runtime/index.ts 仍 export * from vendor/runtime.js。DSButton、Table、Pagination、Icon、Upload、Provider 等兼容实现仍保留。88 个目录导出包括多组别名；挂载测试不证明 88 个独立成熟组件。

## 其他问题

- A-05 / P2：日期浮层套用 Select 的 min-width:var(--trigger-width)，日历被撑宽且日期列仍窄，布局不符合参考目标。DateTime 应使用独立宽度契约。
- A-06 / P2：导入区仅提供 import，没有可直接运行的 Usage 代码；旧设计文档与新 API 仍有不同契约，需明确 Primitive Button 与 DSButton 的差别。
- A-07 / P2：lint 失败，部分来自兼容 bundle/声明文件与规则配置，需分清自有源码和供应代码检查范围，不能忽略全站规则。
- A-08 / P2：当前测试以挂载为主。尚缺所有浮层焦点锁定/返回、多实例主题、上传失败、日期区域格式、所有状态和窄屏的系统覆盖。

## 下一轮顺序

先统一 Token/Portal 作用域并建立当前版本能力判定，再完成原源码迁移与项目覆盖发布闭环；随后补上述交互矩阵和独立 Consumer 验收。本轮不发布。
