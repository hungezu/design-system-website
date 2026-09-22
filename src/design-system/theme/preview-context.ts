import { createContext, useContext, type CSSProperties } from 'react'

export const PreviewContext = createContext<CSSProperties>({})
export const usePreviewVariables = () => useContext(PreviewContext)

export const PreviewOwnerContext = createContext<string | undefined>(undefined)
export const usePreviewOwner = () => useContext(PreviewOwnerContext)
