import type { CSSProperties } from 'react'
import { DSInput, DSButton, PreviewScope } from '@local/design-system'
// @ts-expect-error Demo templates are not project-approved package-root exports.
import { TemplateExample } from '@local/design-system'
// @ts-expect-error Demo component renderers are not project-approved package-root exports.
import { ComponentExample } from '@local/design-system'
import tokens from '@local/design-system/tokens.json'
void TemplateExample
void ComponentExample
export const typedConsumer = <PreviewScope vars={tokens as CSSProperties}><DSInput label="名称"/><DSButton variant="primary">保存</DSButton></PreviewScope>
// @ts-expect-error DSInput requires a programmatically associated label.
export const invalidInput = <DSInput />
