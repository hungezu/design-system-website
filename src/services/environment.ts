export const isStaticDemo = import.meta.env.VITE_STATIC_DEMO === 'true'
export const publicAssetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
