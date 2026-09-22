import type { ProjectConfig } from '../types/design-system'
export type ProjectRole = 'viewer' | 'editor' | 'project-admin'
export type Profession = 'product' | 'design' | 'development' | 'other'
export interface Account { id: string; email: string; name: string; profession: Profession; platformRole: 'admin' | 'member'; status: 'active' | 'disabled' }
export interface Membership { projectId: string; userId: string; role: ProjectRole }
export interface SessionData { user: Account; memberships: Membership[]; projects: ProjectConfig[] }
export interface Member extends Account { role: ProjectRole }
export interface Invitation { id: string; email: string; role: ProjectRole; expiresAt: number; status: 'pending' | 'accepted' | 'revoked' | 'expired' }
export const projectRoleLabels: Record<ProjectRole, string> = { viewer: '查看者', editor: '编辑者', 'project-admin': '项目管理员' }
export const professionLabels: Record<Profession, string> = { product: '产品经理', design: '设计师', development: '开发', other: '其他' }
