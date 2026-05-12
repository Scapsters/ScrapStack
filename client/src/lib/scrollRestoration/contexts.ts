import { createUseContext } from '../contexts'
import { createContext } from 'react'

export type ScrollRestorationStore = {
	scroll?: number
}

export const ScrollRestorationContext = createContext<ScrollRestorationStore | null>(null)

export const useScrollRestoration = createUseContext(ScrollRestorationContext)
