import { guokexinProject } from './guokexin'
import { testCustomerBProject } from './test-customer-b'

export const projects = [guokexinProject, testCustomerBProject]
export function setRuntimeProjects(next: typeof projects) { projects.splice(0, projects.length, ...next) }
export const defaultProjectId = guokexinProject.id
export const getProject = (id: string) => projects.find((project) => project.id === id)

// 后续项目继续以独立目录接入：projects/project-b、projects/project-c。
export { guokexinProject }
export { testCustomerBProject }
