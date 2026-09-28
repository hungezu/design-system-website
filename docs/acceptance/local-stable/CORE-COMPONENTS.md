# 核心 62 项 API—状态—示例—证据

由脚本生成。状态是适用能力；通过结论由相邻验收报告与日志给出，不能仅凭清单判定。

|组件|实现|适用状态|示例数|Story|回归入口|
|---|---|---|---:|---|---|
|button|DSButton|default / hover / focus / active / disabled / loading|4|src/design-system/stories/button.stories.tsx|src/design-system/primitives/Button/DSButton.test.tsx|
|input|DSInput|default / hover / focus / disabled / error|8|src/design-system/stories/input.stories.tsx|src/design-system/primitives/TextField/TextField.test.tsx|
|search-field|DSSearchField|default / hover / focus / disabled / error|5|src/design-system/stories/search-field.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|number-field|DSNumberField|default / hover / focus / disabled / error|6|src/design-system/stories/number-field.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|select|DSSelect|default / hover / focus / open / selected / disabled / error|10|src/design-system/stories/select.stories.tsx|src/design-system/primitives/Select/Select.test.tsx|
|combo-box|DSComboBox|default / hover / focus / disabled / error / open / selected|6|src/design-system/stories/combo-box.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|checkbox|DSCheckbox|default / hover / focus / checked / indeterminate / disabled / error / loading|8|src/design-system/stories/checkbox.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|checkbox-group|DSCheckboxGroup|default / hover / focus / selected / disabled / loading / error|6|src/design-system/stories/checkbox-group.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|radio|DSRadio|default / hover / focus / checked / disabled / error / loading|6|src/design-system/stories/radio.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|switch|DSSwitch|default / hover / focus / checked / disabled / loading|5|src/design-system/stories/switch.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|form|DSForm|default / disabled / loading / error / success|4|src/design-system/stories/form.stories.tsx|src/design-system/primitives/Forms/Forms.test.tsx|
|field|DSField|default / hover / focus / disabled / error|4|src/design-system/stories/field.stories.tsx|src/design-system/core-acceptance.test.tsx|
|table|DSTable|default / hover / selected / loading / empty|16|src/design-system/stories/table.stories.tsx|src/runtime/table-updates.test.tsx|
|list-box|DSListBox|default / focus / selected / disabled|2|src/design-system/stories/list-box.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|tree|DSTree|default / focus / selected / open|2|src/design-system/stories/tree.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|pagination|DSPagination|default / hover / focus / active / disabled|4|src/design-system/stories/pagination.stories.tsx|src/components/RuntimeExample.behavior.test.tsx|
|tabs|DSTabs|default / hover / focus / selected / disabled|9|src/design-system/stories/tabs.stories.tsx|src/design-system/primitives/interaction.test.tsx|
|menu|DSMenu|default / hover / focus / selected / open / disabled|9|src/design-system/stories/menu.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|dialog|DSDialog|default / open / loading|6|src/design-system/stories/dialog.stories.tsx|src/design-system/primitives/extended-interaction.test.tsx|
|drawer|DSDrawer|default / open / loading|6|src/design-system/stories/drawer.stories.tsx|src/components/RuntimeExample.behavior.test.tsx|
|popover|DSPopover|default / open|2|src/design-system/stories/popover.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|tooltip|DSTooltip|default / open|8|src/design-system/stories/tooltip.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|tag|DSTag|default / hover / disabled|3|src/design-system/stories/tag.stories.tsx|src/components/RuntimeExample.behavior.test.tsx|
|badge|DSBadge|default / success / warning / error / info|4|src/design-system/stories/badge.stories.tsx|src/design-system/core-acceptance.test.tsx|
|progress-bar|DSProgressBar|default / indeterminate / complete|3|src/design-system/stories/progress-bar.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|toast|DSToast|default / success / warning / error / info|5|src/design-system/stories/toast.stories.tsx|src/design-system/primitives/Feedback/Toast.test.tsx|
|upload|DSUpload|default / hover / focus / disabled / loading / error|6|src/design-system/stories/upload.stories.tsx|src/components/RuntimeExample.behavior.test.tsx|
|drop-zone|DSDropZone|default / hover / focus / disabled|3|src/design-system/stories/drop-zone.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|date-picker|DSDatePicker|default / hover / focus / disabled / error / open / selected|7|src/design-system/stories/date-picker.stories.tsx|src/design-system/primitives/foundation-phase-one.test.tsx|
|empty|DSEmpty|empty|2|src/design-system/stories/empty.stories.tsx|src/design-system/core-acceptance.test.tsx|
|loading|DSLoading|loading|3|src/design-system/stories/loading.stories.tsx|src/design-system/core-acceptance.test.tsx|
|alert|DSAlert|default / success / warning / error / info|4|src/design-system/stories/alert.stories.tsx|src/design-system/core-acceptance.test.tsx|
|toggle-button|DSToggleButton|default / hover / focus / selected / disabled|3|src/design-system/stories/toggle-button.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|toggle-button-group|DSToggleButtonGroup|default / hover / focus / selected / disabled|3|src/design-system/stories/toggle-button-group.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|autocomplete|DSAutocomplete|default / hover / focus / disabled / error / open / selected|6|src/design-system/stories/autocomplete.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|slider|DSSlider|default / hover / focus / disabled|3|src/design-system/stories/slider.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|tag-group|DSTagGroup|default|2|src/design-system/stories/tag-group.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|meter|DSMeter|default|3|src/design-system/stories/meter.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|calendar|DSCalendar|default / focus / selected / disabled|5|src/design-system/stories/calendar.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|date-field|DSDateField|default / hover / focus / disabled / error|6|src/design-system/stories/date-field.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|date-range-picker|DSDateRangePicker|default / hover / focus / disabled / error|7|src/design-system/stories/date-range-picker.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|range-calendar|DSRangeCalendar|default / focus / selected / disabled|5|src/design-system/stories/range-calendar.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|time-field|DSTimeField|default / hover / focus / disabled / error|6|src/design-system/stories/time-field.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-area|DSColorArea|default / hover / focus / disabled|4|src/design-system/stories/color-area.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-field|DSColorField|default / hover / focus / disabled / error|4|src/design-system/stories/color-field.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-picker|DSColorPicker|default / disabled|4|src/design-system/stories/color-picker.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-slider|DSColorSlider|default / hover / focus / disabled|4|src/design-system/stories/color-slider.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-swatch|DSColorSwatch|default|3|src/design-system/stories/color-swatch.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|color-swatch-picker|DSColorSwatchPicker|default / focus / selected / disabled|3|src/design-system/stories/color-swatch-picker.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|breadcrumb|DSBreadcrumb|default|2|src/design-system/stories/breadcrumb.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|disclosure|DSDisclosure|default / hover / focus / disabled / open|2|src/design-system/stories/disclosure.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|disclosure-group|DSDisclosureGroup|default / hover / focus / disabled / open|3|src/design-system/stories/disclosure-group.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|link|DSLink|default / hover / focus / disabled|3|src/design-system/stories/link.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|toolbar|DSToolbar|default|2|src/design-system/stories/toolbar.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|separator|DSSeparator|default|2|src/design-system/stories/separator.stories.tsx|src/design-system/primitives/foundation-phase-two.test.tsx|
|token-field|DSTokenField|default / hover / focus / selected / readonly / disabled|4|src/design-system/stories/token-field.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|grid-list|DSGridList|default / hover / focus / selected / disabled / empty|6|src/design-system/stories/grid-list.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|color-wheel|DSColorWheel|default / hover / focus / active / disabled|3|src/design-system/stories/color-wheel.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|navigation-tree|DSNavigationTree|default / hover / focus / current / open / disabled|4|src/design-system/stories/navigation-tree.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|preview-trigger|DSPreviewTrigger|default / hover / focus / open / disabled|4|src/design-system/stories/preview-trigger.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|group|DSGroup|default / hover / focus / disabled / error|4|src/design-system/stories/group.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
|virtualizer|DSVirtualizer|default / empty|4|src/design-system/stories/virtualizer.stories.tsx|src/design-system/primitives/foundation-phase-three.test.tsx|
