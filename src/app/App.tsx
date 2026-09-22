import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { AssetDetail } from '../pages/AssetDetail'
import { Assets } from '../pages/Assets'
import { Audit } from '../pages/Audit'
import { Home } from '../pages/Home'
import { PatternDetail } from '../pages/PatternDetail'
import { Patterns } from '../pages/Patterns'
import { QuickStart } from '../pages/QuickStart'
import { Components } from '../pages/Components'
import { Templates } from '../pages/Templates'
import { Releases } from '../pages/Releases'
import { UsersPage } from '../pages/UsersPage'
import { ProjectMembers } from '../pages/ProjectMembers'
import { Projects } from '../pages/Projects'
import { NewProject } from '../pages/NewProject'
import { ProjectDetail } from '../pages/ProjectDetail'
import { Announcements } from '../pages/Announcements'
import { ThemeEditor } from '../pages/ThemeEditor'
import { SearchResults } from '../pages/SearchResults'
import { NotFound } from '../pages/NotFound'
import { canManage, useAccess } from './access-context'
import { LegacyProjectRedirect, ProjectSpace } from './ProjectSpace'

function ManagementRoute() {
  const { user } = useAccess()
  return user.platformRole === 'admin' ? <UsersPage /> : <div className="page route-state"><h1>需要平台管理权限</h1><p>项目管理员仅管理自己的项目，不能管理平台用户。</p><Link className="secondary-action" to="/projects">返回我的项目</Link></div>
}

function MembersRoute() {
  const { user } = useAccess()
  return canManage(user.role) ? <ProjectMembers /> : <div className="page route-state"><h1>需要项目管理权限</h1><p>请联系此项目的管理员。</p></div>
}
function ThemeRoute() {
  const { user } = useAccess()
  return user.role !== 'viewer' ? <ThemeEditor /> : <div className="page route-state"><h1>当前项目为只读权限</h1><p>你可以查阅项目规范和资源。编辑主题需要编辑者或项目管理员权限。</p></div>
}
export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="login" element={<Navigate to="/projects" replace />} />
        <Route index element={<Home />} />
        <Route path="quick-start" element={<QuickStart />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="assets" element={<Assets />} />
        <Route path="assets/:assetId" element={<AssetDetail />} />
        <Route path="components" element={<Components />} />
        <Route path="components/:componentId" element={<Components />} />
        <Route path="patterns" element={<Patterns />} />
        <Route path="patterns/:patternId" element={<PatternDetail />} />
        <Route path="templates" element={<Templates />} />
        <Route path="templates/:assetId" element={<Templates />} />
        <Route path="projects" element={<Projects />} />
        <Route path="new-project" element={<NewProject />} />
        <Route path="projects/:projectId" element={<ProjectSpace />}>
          <Route index element={<ProjectDetail />} />
          <Route path="members" element={<MembersRoute />} />
          <Route path="foundations" element={<Assets scope="project" />} />
          <Route path="foundations/:assetId" element={<AssetDetail scope="project" />} />
          <Route path="foundations/theme" element={<ThemeRoute />} />
          <Route path="components" element={<Components />} />
          <Route path="components/:componentId" element={<Components />} />
          <Route path="patterns" element={<Patterns />} />
          <Route path="patterns/:patternId" element={<PatternDetail />} />
          <Route path="templates" element={<Templates />} />
          <Route path="templates/:assetId" element={<Templates />} />
          <Route path="releases" element={<Releases />} />
          <Route path="workbench" element={<LegacyProjectRedirect>{(projectId) => <Navigate to={`/projects/${projectId}/foundations/theme?version=draft`} replace />}</LegacyProjectRedirect>} />
          <Route path="audit" element={<Audit />} />
        </Route>
        <Route path="audit" element={<LegacyProjectRedirect>{(projectId) => <Navigate to={`/projects/${projectId}/audit`} replace />}</LegacyProjectRedirect>} />
        <Route path="releases" element={<LegacyProjectRedirect>{(projectId) => <Navigate to={`/projects/${projectId}/releases`} replace />}</LegacyProjectRedirect>} />
        <Route path="workbench" element={<LegacyProjectRedirect>{(projectId) => <Navigate to={`/projects/${projectId}/foundations/theme?version=draft`} replace />}</LegacyProjectRedirect>} />
        <Route path="layouts" element={<LegacyProjectRedirect>{(projectId) => <Navigate to={`/projects/${projectId}/templates`} replace />}</LegacyProjectRedirect>} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="users" element={<ManagementRoute />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
