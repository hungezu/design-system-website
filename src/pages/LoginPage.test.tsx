// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { LoginPage } from './LoginPage'
import { api } from '../services/workspace-api'
vi.mock('../services/workspace-api', () => ({ api: vi.fn() }))
const request = vi.mocked(api)
beforeEach(() => { request.mockReset(); window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener() {}, removeEventListener() {} }) })
afterEach(cleanup)
function LocationState() { const location = useLocation(); return <output data-testid="location">{location.pathname}{location.search}</output> }
const show = (path = '/') => render(<MemoryRouter initialEntries={[path]}><LoginPage onAuthenticated={vi.fn()} /><LocationState /></MemoryRouter>)
const field = (name: string) => screen.getByLabelText(new RegExp(`^${name}`))
async function fillSetup() {
  const user = userEvent.setup()
  await user.type(field('初始化码'), 'test-only-code')
  await user.type(field('邮箱'), 'test@example.test')
  await user.type(field('姓名'), '测试用户')
  return user
}
describe('账号表单必填与密码下限', () => {
  it('初始化未完整时禁用；恰好八位纯数字且一致才启用，清空后再次禁用', async () => {
    request.mockResolvedValue({ needsSetup: true }); const { container } = show()
    const submit = await screen.findByRole('button', { name: '创建管理员并进入' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    expect(container.querySelectorAll('input[required]').length).toBe(5)
    expect(container.querySelectorAll('.access-field-label .access-required').length).toBe(5)
    const user = await fillSetup()
    await user.type(field('设置密码'), '1234567'); await user.type(field('确认密码'), '1234567')
    expect(submit.disabled).toBe(true)
    fireEvent.submit(container.querySelector('form')!)
    expect(request).toHaveBeenCalledTimes(1)
    await user.type(field('设置密码'), '8'); expect(submit.disabled).toBe(true)
    await user.type(field('确认密码'), '8'); expect(submit.disabled).toBe(false)
    await user.clear(field('姓名')); await user.type(field('姓名'), '   '); expect(submit.disabled).toBe(true)
  })
  it('密码不一致时就地提示并保持禁用，正确后提示消失', async () => {
    request.mockResolvedValue({ needsSetup: true }); show()
    const submit = await screen.findByRole('button', { name: '创建管理员并进入' }) as HTMLButtonElement
    const user = await fillSetup()
    await user.type(field('设置密码'), 'abcdefgh'); await user.type(field('确认密码'), 'abcd1234')
    expect(submit.disabled).toBe(true); expect(screen.getByText('两次输入的密码不一致。')).toBeTruthy()
    expect(field('确认密码').getAttribute('aria-invalid')).toBe('true')
    await user.clear(field('确认密码')); await user.type(field('确认密码'), 'abcdefgh')
    expect(submit.disabled).toBe(false); expect(screen.queryByText('两次输入的密码不一致。')).toBeNull()
  })
  it('登录只要求邮箱与八位密码，不要求初始化字段', async () => {
    request.mockResolvedValue({ needsSetup: false }); show('/login')
    const submit = await screen.findByRole('button', { name: /^登录$/ }) as HTMLButtonElement
    const user = userEvent.setup(); expect(submit.disabled).toBe(true)
    await user.type(field('邮箱'), 'bad-address'); await user.type(field('登录密码'), '12345678'); expect(submit.disabled).toBe(true)
    await user.clear(field('邮箱')); await user.type(field('邮箱'), 'test@example.test'); expect(submit.disabled).toBe(false)
  })
  it('在密码框内部显示 Caps Lock 状态，关闭或失焦后清除；确认区分大小写', async () => {
    request.mockResolvedValue({ needsSetup: true }); show()
    const submit = await screen.findByRole('button', { name: '创建管理员并进入' }) as HTMLButtonElement
    const user = await fillSetup()
    const input = field('设置密码')
    fireEvent.keyDown(input, { key: 'CapsLock', modifierCapsLock: true })
    expect(screen.getByRole('img', { name: '大写锁定已开启' }).querySelector('svg')).toBeTruthy()
    expect(input.parentElement?.querySelector('.access-caps-lock')?.textContent).toBe('')
    expect(input.getAttribute('placeholder')).toBe('至少 8 位，区分大小写')
    fireEvent.keyUp(input, { key: 'CapsLock', modifierCapsLock: false })
    expect(screen.queryByRole('img', { name: '大写锁定已开启' })).toBeNull()
    fireEvent.keyDown(input, { key: 'A', modifierCapsLock: true })
    fireEvent.blur(input)
    expect(screen.queryByRole('img', { name: '大写锁定已开启' })).toBeNull()
    await user.type(input, 'Abcdefgh'); await user.type(field('确认密码'), 'abcdefgh')
    expect(submit.disabled).toBe(true)
    await user.clear(field('确认密码')); await user.type(field('确认密码'), 'Abcdefgh')
    expect(submit.disabled).toBe(false)
  })
  it.each(['invite', 'reset'] as const)('已有账号的 %s 按实际字段决定可提交状态', async purpose => {
    request.mockResolvedValue({ email: 'test@example.test', projectId: purpose === 'invite' ? 'test-project' : null, projectName: '测试项目', role: 'viewer', purpose, existingAccount: true })
    show('/join#token=test-only-token')
    const submit = await screen.findByRole('button', { name: purpose === 'reset' ? '保存密码并登录' : '确认加入' }) as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    const user = userEvent.setup(); await user.type(field(purpose === 'reset' ? '设置密码' : '登录密码'), 'abcdefgh')
    if (purpose === 'reset') { expect(submit.disabled).toBe(true); await user.type(field('确认密码'), 'abcdefgh') }
    expect(submit.disabled).toBe(false)
  })
  it('接受项目邀请后直接进入被邀请项目', async () => {
    const session = { user: { id: 'u', email: 'test@example.test', name: '测试', profession: 'design', platformRole: 'member', status: 'active' }, memberships: [], projects: [] }
    request.mockResolvedValueOnce({ email: 'test@example.test', projectId: 'project-a', projectName: '项目 A', role: 'viewer', purpose: 'invite', existingAccount: true }).mockResolvedValueOnce(session)
    show('/join#token=test-only-token')
    const user = userEvent.setup()
    await user.type(await screen.findByLabelText(/^登录密码/), 'abcdefgh')
    await user.click(screen.getByRole('button', { name: '确认加入' }))
    expect(screen.getByTestId('location').textContent).toBe('/projects/project-a?version=draft')
  })
})
