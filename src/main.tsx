import '@fontsource-variable/noto-sans-sc'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import { AppThemeScope } from './design-system/theme/AppThemeScope'
import { AccessProvider } from './app/access-context'
import { ProjectProvider } from './app/ProjectContext'
import './design-system/tokens.css'
import './styles/app-tokens.css'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppThemeScope><AccessProvider><ProjectProvider>
        <App />
      </ProjectProvider></AccessProvider></AppThemeScope>
    </BrowserRouter>
  </StrictMode>,
)
