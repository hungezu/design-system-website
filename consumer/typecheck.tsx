import type { CSSProperties } from 'react'
import { DSInput, DSButton, TemplateExample, PreviewScope } from '@local/design-system'
import tokens from '@local/design-system/tokens.json'
export const typedConsumer = <PreviewScope vars={tokens as CSSProperties}><DSInput label="名称"/><DSButton variant="primary">保存</DSButton><TemplateExample templateId="template-list" variant="advanced"/></PreviewScope>
// @ts-expect-error DSInput requires a programmatically associated label.
export const invalidInput = <DSInput />
