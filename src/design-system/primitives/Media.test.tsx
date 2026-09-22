import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { DSDropZone, DSImagePreview } from './Collections/Additional'
import { DSFileList } from './Content'
import { DSUpload } from './Upload'

describe('文件与媒体组件', () => {
  it('上传和拖放区使用统一上传图标与明确操作名称', () => {
    const upload = renderToStaticMarkup(<DSUpload label="文件" error="格式不支持" onFiles={() => {}} />)
    const dropZone = renderToStaticMarkup(<DSDropZone label="上传文件" onFiles={() => {}} />)
    expect(upload).toContain('aria-label="选择文件"')
    expect(upload).toContain('data-icon="upload"')
    expect(upload).toContain('role="alert"')
    expect(dropZone).toContain('data-icon="upload"')
    expect(dropZone).toContain('拖放文件到此处')
  })

  it('文件列表提供文件语义、格式化大小和图标移除操作', () => {
    const html = renderToStaticMarkup(<DSFileList files={[{ id: 'a', name: '变量.json', size: 1024 }]} onRemove={() => {}} />)
    expect(html).toContain('data-icon="file-text"')
    expect(html).toContain('1.0 KB')
    expect(html).toContain('aria-label="移除变量.json"')
  })

  it('图片预览区分横图和方图并保留大图替代文本', () => {
    const html = renderToStaticMarkup(<DSImagePreview src="/assets/hj-logo-112.png" alt="品牌标识" aspect="square" />)
    expect(html).toContain('owned-image-preview--square')
    expect(html).toContain('aria-label="预览品牌标识"')
  })
})
