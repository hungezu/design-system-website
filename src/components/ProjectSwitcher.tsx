import { projects } from '../data/projects'
import { useAccess } from '../app/access-context'
import { useProject } from '../app/project-context'
import { AppSelect } from './AppSelect'

export function ProjectSwitcher({ onProjectChange }: { onProjectChange?: (projectId: string) => void }) {
  const { project, setProjectId } = useProject()
  const { visibleProjectIds } = useAccess()

  return (
    <label className="project-switcher">
      <span className="project-switcher__label">当前项目</span>
      <span className="project-switcher__value">
        <span className="project-dot" aria-hidden="true" />
        <AppSelect value={project.id} onChange={(event) => { if (onProjectChange) onProjectChange(event.target.value); else setProjectId(event.target.value) }} aria-label="切换当前项目">
          {projects.filter(item => visibleProjectIds.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </AppSelect>
      </span>
    </label>
  )
}
