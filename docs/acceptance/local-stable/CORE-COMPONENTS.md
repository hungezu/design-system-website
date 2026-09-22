# 核心 20 项 API—状态—示例—证据

由脚本生成。状态是适用能力；通过结论由相邻验收报告与日志给出，不能仅凭清单判定。

|组件|实现|适用状态|示例数|Story|回归入口|
|---|---|---|---:|---|---|
|button|DSButton|default / hover / focus / active / disabled / loading|4|src/design-system/stories/button.stories.tsx|src/design-system/primitives/Button/DSButton.test.tsx|
|input|DSInput|default / hover / focus / disabled / error|8|src/design-system/stories/input.stories.tsx|src/design-system/primitives/TextField/TextField.test.tsx|
|select|DSSelect|default / hover / focus / open / selected / disabled / error|10|src/design-system/stories/select.stories.tsx|src/design-system/primitives/Select/Select.test.tsx|
|table|DSTable|default / hover / selected / loading / empty|16|src/design-system/stories/table.stories.tsx|src/design-system/../runtime/table-updates.test.tsx|
|pagination|DSPagination|default / hover / focus / active / disabled|4|src/design-system/stories/pagination.stories.tsx|src/design-system/../components/RuntimeExample.behavior.test.tsx|
|dialog|DSDialog|default / open / loading|6|src/design-system/stories/dialog.stories.tsx|src/design-system/primitives/extended-interaction.test.tsx|
|drawer|DSDrawer|default / open / loading|6|src/design-system/stories/drawer.stories.tsx|src/design-system/../components/RuntimeExample.behavior.test.tsx|
|tabs|DSTabs|default / hover / focus / selected / disabled|9|src/design-system/stories/tabs.stories.tsx|src/design-system/primitives/interaction.test.tsx|
|tag|DSTag|default / hover / disabled|3|src/design-system/stories/tag.stories.tsx|src/design-system/../components/RuntimeExample.behavior.test.tsx|
|badge|DSBadge|default / success / warning / error / info|4|src/design-system/stories/badge.stories.tsx|src/design-system/core-acceptance.test.tsx|
|toast|DSToast|default / success / warning / error / info|5|src/design-system/stories/toast.stories.tsx|src/design-system/primitives/Feedback/Toast.test.tsx|
|form|DSForm|default / disabled / loading / error / success|4|src/design-system/stories/form.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|field|DSField|default / hover / focus / disabled / error|4|src/design-system/stories/field.stories.tsx|src/design-system/core-acceptance.test.tsx|
|upload|DSUpload|default / hover / focus / disabled / loading / error|6|src/design-system/stories/upload.stories.tsx|src/design-system/../components/RuntimeExample.behavior.test.tsx|
|empty|DSEmpty|empty|2|src/design-system/stories/empty.stories.tsx|src/design-system/core-acceptance.test.tsx|
|loading|DSLoading|loading|3|src/design-system/stories/loading.stories.tsx|src/design-system/core-acceptance.test.tsx|
|alert|DSAlert|default / success / warning / error / info|4|src/design-system/stories/alert.stories.tsx|src/design-system/core-acceptance.test.tsx|
|checkbox|DSCheckbox|default / hover / focus / checked / indeterminate / disabled / error / loading|8|src/design-system/stories/checkbox.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|radio|DSRadio|default / hover / focus / checked / disabled / error / loading|6|src/design-system/stories/radio.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|switch|DSSwitch|default / hover / focus / checked / disabled / loading|5|src/design-system/stories/switch.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
