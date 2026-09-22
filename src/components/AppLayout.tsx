import {
  BookOpen,
  Box,
  ChevronDown,
  ClipboardCheck,
  FileClock,
  FolderKanban,
  LayoutTemplate,
  Search,
  Settings,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  roleLabels,
  useAccess,
} from "../app/access-context";
import { useProject } from "../app/project-context";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { BrandMark } from "./BrandMark";
import { AppSelect } from "./AppSelect";
import { DSIconAction } from "../design-system/primitives/IconAction";
import { DRAFT_VERSION, isDraftVersion } from "../services/release-catalog";

export const publicNavigation = [
  { to: "/", label: "概览", icon: Sparkles, end: true },
  { to: "/assets", label: "设计基础", icon: Box },
  { to: "/components", label: "组件", icon: LayoutTemplate },
  { to: "/patterns", label: "交互模式", icon: Workflow },
  { to: "/templates", label: "页面模板", icon: ClipboardCheck },
  { to: "/projects", label: "项目", icon: FolderKanban },
];

export function AppLayout() {
  const { project, release, releases, setReleaseVersion } = useProject();
  const { user, logout, visibleProjectIds, projectRole } = useAccess();
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const accountRef = useRef<HTMLDivElement>(null);
  const projectMatch = location.pathname.match(/^\/projects\/([^/]+)/);
  const projectRouteId = projectMatch?.[1];
  const projectSuffix = projectRouteId
    ? location.pathname.slice(`/projects/${projectRouteId}`.length)
    : "";
  const isMemberManagement = projectSuffix === '/members';
  const requestedVersion = new URLSearchParams(location.search).get("version");
  const viewingDraft = !requestedVersion || isDraftVersion(requestedVersion);
  const projectVersionSearch = requestedVersion ? `?version=${encodeURIComponent(requestedVersion)}` : "";
  const projectNavigation = projectRouteId
    ? [
        { to: `/projects/${projectRouteId}${projectVersionSearch}`, label: "概览", end: true },
        { to: `/projects/${projectRouteId}/foundations${projectVersionSearch}`, label: "设计规范" },
        { to: `/projects/${projectRouteId}/components${projectVersionSearch}`, label: "组件" },
        { to: `/projects/${projectRouteId}/patterns${projectVersionSearch}`, label: "交互模式" },
        { to: `/projects/${projectRouteId}/templates${projectVersionSearch}`, label: "页面模板" },
        { to: `/projects/${projectRouteId}/releases${projectVersionSearch}`, label: "版本记录" },
        ...(projectRole(projectRouteId) === 'project-admin' ? [{ to: `/projects/${projectRouteId}/members`, label: '成员与权限' }] : []),
      ]
    : [];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    setAccountOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node))
        setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const submitSearch = (event: FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    const next = new URLSearchParams()
    if (value) next.set('q', value)
    if (projectRouteId) {
      next.set('space', 'project')
      next.set('project', projectRouteId)
      next.set('version', requestedVersion ?? DRAFT_VERSION)
    }
    navigate(`/search${next.size ? `?${next.toString()}` : ''}`);
    setSearchOpen(false);
  };

  const changeProjectRoute = (nextProjectId: string) => {
    if (
      document.querySelector('[data-theme-unsaved="true"], .resource-workflow[data-unsaved="true"]') &&
      !window.confirm("当前主题尚未保存，确定切换项目吗？")
    )
      return;
    const target = nextProjectId;
    if (!visibleProjectIds.includes(target)) return;
    navigate(`/projects/${target}${projectSuffix}`);
  };

  const changeVersion = (version: string) => {
    if(document.querySelector('[data-theme-unsaved="true"], .resource-workflow[data-unsaved="true"]')&&!window.confirm('当前编辑尚未保存，确定切换版本吗？'))return;
    const next = new URLSearchParams(location.search);
    next.set("version", version);
    if (version !== DRAFT_VERSION) setReleaseVersion(version);
    navigate(`${location.pathname}?${next.toString()}`, { replace: true });
  };


  useEffect(() => {
    if (
      isMemberManagement ||
      !projectRouteId ||
      !visibleProjectIds.includes(projectRouteId) ||
      projectRouteId !== project.id
    )
      return;
    const requested = new URLSearchParams(location.search).get("version");
    if (isDraftVersion(requested)) return;
    const validRequested =
      requested && releases.some((item) => item.version === requested);
    if (validRequested && requested !== release?.version)
      setReleaseVersion(requested);
    if (!requested) {
      const next = new URLSearchParams(location.search);
      next.set("version", DRAFT_VERSION);
      navigate(`${location.pathname}?${next.toString()}`, { replace: true });
    }
  }, [
    isMemberManagement,
    location.pathname,
    location.search,
    navigate,
    project.id,
    projectRouteId,
    release,
    release?.version,
    releases,
    setReleaseVersion,
    visibleProjectIds,
  ]);

  return (
    <div className={`app-shell${projectRouteId ? " app-shell--project" : ""}`}>
      <header className="global-header">
        <div className="global-header__primary">
          <Link
            className="global-brand"
            to="/"
            aria-label="设计规范管理平台首页"
          >
            <BrandMark />
            <span>
              <strong>设计规范管理平台</strong>
            </span>
          </Link>
          <nav className="global-nav" aria-label="一级导航">
            {publicNavigation.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}>
                <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="global-actions">
            {searchOpen ? (
              <form className="global-search" onSubmit={submitSearch}>
                <Search size={15} aria-hidden="true" />
                <input
                  autoFocus
                  aria-label="全站搜索"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索组件、模式或模板"
                />
                <DSIconAction
                  semantic="close"
                  compact
                  aria-label="关闭全站搜索"
                  onPress={() => setSearchOpen(false)}
                />
              </form>
            ) : (
              <button
                className="header-icon-button"
                onClick={() => setSearchOpen(true)}
                aria-label="打开全站搜索"
              >
                <Search size={18} />
              </button>
            )}
            <div className="account-menu" ref={accountRef}>
              <button
                className="account-trigger"
                aria-label={`${user.name}，账号菜单`}
                onClick={() => setAccountOpen((value) => !value)}
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <UserRound size={17} aria-hidden="true" />
                <span>{user.name}</span>
                <ChevronDown size={14} aria-hidden="true" />
              </button>
              {accountOpen && (
                <div className="account-popover" role="menu">
                  <div className="account-popover__identity">
                    <strong>{user.name}</strong>
                    <span>{user.platformRole === 'admin' ? '平台管理员' : projectRouteId ? `当前项目权限：${roleLabels[user.role]}` : '项目成员 · 权限按项目分配'}</span>
                  </div>
                  <Link role="menuitem" to={projectRouteId ? `/quick-start?project=${encodeURIComponent(projectRouteId)}&version=${encodeURIComponent(requestedVersion ?? DRAFT_VERSION)}` : '/quick-start'}>
                    <BookOpen size={15} />
                    快速开始
                  </Link>
                  <Link role="menuitem" to="/announcements">
                    <FileClock size={15} />
                    公告
                  </Link>
                  {user.platformRole === "admin" && (
                    <Link role="menuitem" to="/users">
                      <Settings size={15} />
                      平台管理
                    </Link>
                  )}
                  <button className="text-action" role="menuitem" onClick={() => {
                    if (document.querySelector('[data-theme-unsaved="true"]') && !window.confirm('当前主题尚未保存，确定退出登录吗？')) return;
                    void logout().catch(error => window.alert(error instanceof Error ? error.message : '退出失败，请重试。'));
                  }}>退出登录</button>
                </div>
              )}
            </div>
          </div>
        </div>
        {projectRouteId && (
          <div className="global-header__context" aria-label="项目空间导航">
            <nav className="project-nav" aria-label="项目导航">
              {projectNavigation.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <ProjectSwitcher onProjectChange={changeProjectRoute} />
            <span className="context-divider" />
            <span className="context-item">
              <small>平台</small>
              <strong>Web</strong>
            </span>
            {!isMemberManagement && <label className="version-switcher">
              <span>版本</span>
              <AppSelect
                aria-label="切换当前版本"
                value={viewingDraft ? DRAFT_VERSION : release?.version ?? ""}
                onChange={(event) => changeVersion(event.target.value)}
              >
                <option value={DRAFT_VERSION}>当前草稿</option>
                {releases.map((item) => (
                  <option key={item.version} value={item.version}>
                    {`v${item.version}`}
                  </option>
                ))}
              </AppSelect>
            </label>}
            {!isMemberManagement && user.role !== "viewer" && (
              <Link
                className="project-audit-link"
                to={`/projects/${projectRouteId}/audit${projectVersionSearch}`}
              >
                设计检查
              </Link>
            )}
          </div>
        )}
      </header>
      <main className="content">
        {/* Keep the shell mounted, but reset route-local state when the path changes. */}
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
}
