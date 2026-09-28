import type { ReactNode } from 'react'
import { RouterProvider as AriaRouterProvider } from 'react-aria-components'
import { useHref, useLocation, useNavigate } from 'react-router-dom'

function useAppHref(href:string|URL) {
  const location=useLocation()
  return useHref(typeof href==='string'&&href.startsWith('#')?{pathname:location.pathname,search:location.search,hash:href}:String(href))
}

/** Connect React Aria links to the active BrowserRouter or HashRouter. */
export function DesignSystemRouter({children}:{children:ReactNode}) {
  const navigate=useNavigate()
  const location=useLocation()
  return <AriaRouterProvider useHref={useAppHref} navigate={href=>navigate(typeof href==='string'&&href.startsWith('#')?{pathname:location.pathname,search:location.search,hash:href}:String(href))}>{children}</AriaRouterProvider>
}
