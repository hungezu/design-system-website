export function componentsForProjectContext<T extends { componentId: string }>(
  catalog: readonly T[],
  projectComponentIds: readonly string[],
  releasedComponentIds?: readonly string[],
) {
  const projectIds = new Set(projectComponentIds)
  const releasedIds = releasedComponentIds ? new Set(releasedComponentIds) : null
  return catalog.filter((component) => projectIds.has(component.componentId) && (!releasedIds || releasedIds.has(component.componentId)))
}
